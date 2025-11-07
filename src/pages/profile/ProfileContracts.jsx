import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Components
import { Header, ProtectedRoute, LoadingSpinner } from "@/components";
// Images
import Symbol from "@/assets/images/icon.png";
// Icons
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";
// Utils
import { getToken, handleApiResponse } from "@/utils/token.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Styles for all inputs
const styles = {
  inputStyle:
    "outline-none w-80 md:w-96 vsm:h-14 p-2 vsm:p-3 rounded-lg border border-primaryColor bg-transparent",
};

export const ProfileContracts = () => {
  const { t, i18n } = useTranslation();
  const [activeButton, setActiveButton] = useState("active"); // State to track the active button
  const [selectedProductType, setSelectedProductType] = useState(null); // State to track selected product type
  const [contracts, setContracts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch contracts and user data on component mount and when language changes
  useEffect(() => {
    fetchContracts();
    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const fetchContracts = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/user/member/getAllContracts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept-Language": i18n.language,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (!handleApiResponse(response, data)) {
          return;
        }
        throw new Error("Failed to fetch contracts");
      }

      const data = await response.json();
      // Handle the nested structure: { contracts: { active: {...}, inactive: {...} } }
      let contractsArray = [];

      if (data.contracts && typeof data.contracts === "object") {
        // Flatten the nested structure - combine active and inactive contracts
        const allContracts = [];

        // Process active contracts
        if (
          data.contracts.active &&
          typeof data.contracts.active === "object"
        ) {
          Object.keys(data.contracts.active).forEach((productType) => {
            const productContracts = data.contracts.active[productType];
            if (Array.isArray(productContracts)) {
              productContracts.forEach((contract) => {
                allContracts.push({
                  ...contract,
                  status: "active",
                  product_type: productType,
                });
              });
            }
          });
        }

        // Process inactive contracts
        if (
          data.contracts.inactive &&
          typeof data.contracts.inactive === "object"
        ) {
          Object.keys(data.contracts.inactive).forEach((productType) => {
            const productContracts = data.contracts.inactive[productType];
            if (Array.isArray(productContracts)) {
              productContracts.forEach((contract) => {
                allContracts.push({
                  ...contract,
                  status: "inactive",
                  product_type: productType,
                });
              });
            }
          });
        }

        contractsArray = allContracts;
      } else if (Array.isArray(data)) {
        contractsArray = data;
      } else if (Array.isArray(data.contracts)) {
        contractsArray = data.contracts;
      }

      setContracts(contractsArray);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setError("Συνέβη κάποιο σφάλμα κατά τη φόρτωση των συμβολαίων.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (!handleApiResponse(response, data)) {
          return;
        }
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Don't show error for user details, just use empty name
    }
  };

  // Function to handle active/inactive button click
  const handleButtonClick = (buttonType) => {
    setActiveButton(buttonType);
    setSelectedProductType(null); // Reset selected product when switching active/inactive
  };

  // Function to handle product type button click
  const handleProductTypeClick = (productType) => {
    setSelectedProductType(productType);
  };

  // Filter contracts by status - ensure contracts is an array
  const filteredContracts = Array.isArray(contracts)
    ? contracts.filter((contract) => {
        const status = (
          contract.status ||
          contract.contract_status ||
          contract.contractStatus ||
          ""
        )
          .toLowerCase()
          .trim();
        if (activeButton === "active") {
          // Match active contracts: "active", "ενεργά", "ενεργά συμβόλαια", etc.
          return (
            status === "active" ||
            status.includes("ενεργ") ||
            status === "1" ||
            status === "true"
          );
        } else {
          // Match inactive contracts: "inactive", "ανενεργά", "ανενεργά συμβόλαια", etc.
          return (
            status === "inactive" ||
            status.includes("ανενεργ") ||
            status === "0" ||
            status === "false"
          );
        }
      })
    : [];

  // Group contracts by product type
  const contractsByProduct = filteredContracts.reduce((acc, contract) => {
    const productType =
      contract.product_type || contract.productType || contract.type || "other";
    if (!acc[productType]) {
      acc[productType] = [];
    }
    acc[productType].push(contract);
    return acc;
  }, {});

  // Get product types that actually have contracts from the API
  const productTypes = Object.keys(contractsByProduct);

  // Get product display name - show the actual product type key
  const getProductDisplayName = (productType) => {
    return productType;
  };

  // Format contract dates
  const formatContractDates = (contract) => {
    const startDate = contract.start_date || contract.startDate || "";
    const endDate = contract.end_date || contract.endDate || "";
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    }
    return (
      contract.contract_dates || t("profile_contracts_page.contract_dates")
    );
  };

  return (
    <ProtectedRoute>
      <Fragment>
        <Header />

        <main className="grid grid-cols-1 xl:grid-cols-2 gap-8 mx-6 lg:mx-20 my-10">
          {/* Hero Section */}
          <section
            className="flex flex-col justify-center items-center p-7 sm:p-14 w-full bg-primaryBgColor text-left rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12"
            style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
          >
            {/* Hero Section Logo */}
            <img
              data-aos="fade-in"
              src={Symbol}
              alt="Go Digital Icon"
              className="w-[100px] md:w-[199px]"
            />
            {/* User Name */}
            <h1 className="max-w-[806px] mx-5 tiny:text-2xl vsm:text-4xl md:text-5xl font-semibold vsm:leading-[51.96px] md:leading-[81.96px]">
              Mohamed Mohamed
            </h1>

            {/* Inputs Fields */}
            <span className="hidden xl:flex flex-col gap-5 my-5">
              <input
                type="text"
                value={`${userData?.first_name || ""} ${
                  userData?.last_name || ""
                }`}
                placeholder={t("profile_page.hero_section.name_placeholder")}
                className={styles.inputStyle}
                readOnly
              />
              <input
                type="email"
                value={userData?.email || ""}
                placeholder={t("profile_page.hero_section.email_placeholder")}
                className={styles.inputStyle}
                readOnly
              />
              <input
                type="text"
                value={userData?.mobile || ""}
                placeholder={t("profile_page.hero_section.phone_placeholder")}
                className={styles.inputStyle}
                readOnly
              />
              <input
                type="text"
                value={userData?.address || ""}
                placeholder={t("profile_page.hero_section.address_placeholder")}
                className={styles.inputStyle}
                readOnly
              />
            </span>
          </section>

          <section
            className="p-7 sm:p-14 w-full bg-[#F5F5F5] rounded-3xl md:rounded-[58px] py-6 md:py-12"
            style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="flex justify-center gap-3 vsm:gap-5 items-center">
              <button
                className={`w-full h-14 sm:h-[65px] rounded-[10px] text-xs sm:text-lg font-bold mt-5 transition_all active:scale-105 ${
                  activeButton === "active"
                    ? "bg-secondaryColor text-primaryColor"
                    : "bg-[#C3C3C3] text-primaryColor"
                }`}
                onClick={() => handleButtonClick("active")}
              >
                {t("profile_contracts_page.buttons.active_contracts")}
              </button>
              <button
                className={`w-full h-14 sm:h-[65px] rounded-[10px] text-xs sm:text-lg font-bold mt-5 transition_all active:scale-105 ${
                  activeButton === "inactive"
                    ? "bg-secondaryColor text-primaryColor"
                    : "bg-[#C3C3C3] text-primaryColor"
                }`}
                onClick={() => handleButtonClick("inactive")}
              >
                {t("profile_contracts_page.buttons.inactive_contracts")}
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State - Visible only on PC/Desktop */}
            {error && !isLoading && (
              <div className="hidden lg:flex flex-col justify-center items-center">
                <div className="w-full max-w-2xl bg-red-50 border-2 border-red-200 rounded-2xl p-6 md:p-8 text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h2 className="text-xl md:text-2xl font-bold text-red-800 mb-3">
                    {t("profile_contracts_page.error_loading")}
                  </h2>
                  <p className="text-base md:text-lg text-red-600 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={fetchContracts}
                    className="px-6 py-3 bg-secondaryColor text-white rounded-lg font-semibold hover:bg-secondaryColor/80 transition-all active:scale-105"
                  >
                    {i18n.language === "el" ? "Δοκιμή Ξανά" : "Try Again"}
                  </button>
                </div>
              </div>
            )}

            {/* Contracts Display */}
            {!isLoading && !error && (
              <>
                {/* Show product type buttons if no product is selected */}
                {!selectedProductType ? (
                  <div className="flex flex-col justify-center items-center gap-5 my-5 xl:min-h-[60vh]">
                    <div className="w-full flex flex-col items-center gap-5">
                      {/* Show only product types that have contracts from API */}
                      {productTypes.length > 0 ? (
                        productTypes.map((productType) => (
                          <button
                            key={productType}
                            onClick={() => handleProductTypeClick(productType)}
                            className="w-full h-14 vsm:h-16 rounded-[10px] border-2 hover:bg-secondaryColor hover:text-white border-secondaryColor bg-primaryColor text-secondaryColor text-xs tiny:text-base sm:text-lg font-bold transition_all active:scale-105"
                          >
                            {getProductDisplayName(productType)}
                          </button>
                        ))
                      ) : (
                        <div className="w-full max-w-2xl bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 md:p-12 text-center">
                          <div className="text-5xl mb-4">📄</div>
                          <h3 className="text-xl md:text-2xl font-semibold text-secondaryColor mb-2">
                            {t("profile_contracts_page.no_contracts")}
                          </h3>
                          <p className="text-base text-gray-600 mb-6">
                            {i18n.language === "el"
                              ? "Δεν υπάρχουν διαθέσιμα συμβόλαια αυτή τη στιγμή."
                              : "You don't have any contracts available at the moment."}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Contact Button - Pushed to bottom */}
                    <Link
                      to="/contact"
                      className="w-full h-12 sm:h-[65px] rounded-[10px] text-xs tiny:text-base sm:text-lg font-bold xl:mt-auto mt-5 border-2 border-primaryBgColor bg-primaryBgColor text-white transition_all active:scale-105 flex items-center justify-center"
                      style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                    >
                      {t("profile_contracts_page.buttons.contact")}
                    </Link>
                  </div>
                ) : (
                  /* Show contracts for selected product type */
                  <div className="flex flex-col justify-center items-center text-center my-5 xl:min-h-[60vh]">
                    <div className="w-full flex flex-col items-center">
                      <h2 className="text-xl md:text-2xl my-5 font-bold text-secondaryColor">
                        {contractsByProduct[selectedProductType] &&
                        contractsByProduct[selectedProductType].length > 0
                          ? contractsByProduct[selectedProductType][0].quoteName
                          : selectedProductType}
                      </h2>
                      {contractsByProduct[selectedProductType] &&
                      contractsByProduct[selectedProductType].length > 0 ? (
                        <div className="w-full bg-[#FDE5DE] rounded-[15px]">
                          {contractsByProduct[selectedProductType].map(
                            (contract, index) => (
                              <article
                                key={
                                  contract.id || contract.idContract || index
                                }
                                className={`flex justify-between items-center font-semibold text-secondaryColor p-5 ${
                                  index === 0 ? "rounded-t-[15px]" : ""
                                } ${
                                  index ===
                                  contractsByProduct[selectedProductType]
                                    .length -
                                    1
                                    ? "rounded-b-[15px]"
                                    : ""
                                } ${index % 2 === 1 ? "bg-white" : ""}`}
                                style={{
                                  boxShadow:
                                    "0px -2px 4px 0px rgba(65, 72, 225, 0.15)",
                                }}
                              >
                                <p>{formatContractDates(contract)}</p>
                                <Link
                                  to={`/profile-contract/details?idContract=${
                                    contract.id ||
                                    contract.idContract ||
                                    contract.id_contract
                                  }`}
                                  className="flex justify-center items-center gap-5"
                                >
                                  {t("profile_contracts_page.view_button")}
                                  <Icons.ViewIcon />
                                </Link>
                              </article>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="w-full max-w-2xl bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 md:p-12 text-center">
                          <div className="text-5xl mb-4">📋</div>
                          <h3 className="text-xl md:text-2xl font-semibold text-secondaryColor mb-2">
                            {t(
                              "profile_contracts_page.no_contracts_for_product"
                            )}
                          </h3>
                          <p className="text-base text-gray-600">
                            {i18n.language === "el"
                              ? "Δεν υπάρχουν συμβόλαια για αυτόν τον τύπο προϊόντος."
                              : "There are no contracts available for this product type at the moment."}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Contact Button - Pushed to bottom */}
                    <Link
                      to="/contact"
                      className="w-full h-12 sm:h-[65px] xl:mt-auto mt-5 rounded-[10px] text-xs tiny:text-base sm:text-lg font-bold border-2 border-primaryBgColor bg-primaryBgColor text-white transition_all active:scale-105 flex items-center justify-center"
                      style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                    >
                      {t("profile_contracts_page.buttons.contact")}
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </Fragment>
    </ProtectedRoute>
  );
};
