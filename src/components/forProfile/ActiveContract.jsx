import { useState, useEffect, Fragment } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header, ProtectedRoute, LoadingSpinner } from "@/components";
import * as iconsUtil from "@/utils/icons.util";
import { useTranslation } from "react-i18next";
import { getToken, handleApiResponse } from "@/utils/token.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ActiveContract = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idContract = searchParams.get("idContract");
  const [contractData, setContractData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    if (idContract) {
      fetchContractDetails();
    } else {
      setError("Contract ID is missing");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idContract]);

  const fetchContractDetails = async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/user/member/getContract?idContract=${idContract}`,
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
        throw new Error("Failed to fetch contract details");
      }

      const data = await response.json();
      setContractData(data);
    } catch (error) {
      console.error("Error fetching contract details:", error);
      setError(
        "Συνέβη κάποιο σφάλμα κατά τη φόρτωση των στοιχείων της σύμβασης."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!idContract) return;

    const token = getToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsRenewing(true);
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/user/renew?idContract=${idContract}`,
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
        throw new Error("Failed to renew contract");
      }

      const data = await response.json();

      // Determine which quote page to redirect to based on contract type
      const contractType =
        contractData?.product_type ||
        contractData?.productType ||
        contractData?.type ||
        "";
      const quoteRoute = getQuoteRoute(contractType);

      // Store the renew data in localStorage for the quote page to use
      if (data) {
        localStorage.setItem(
          "renewContractData",
          JSON.stringify({
            idContract: idContract,
            contractData: data,
            originalContract: contractData,
          })
        );
      }

      navigate(quoteRoute);
    } catch (error) {
      console.error("Error renewing contract:", error);
      setError("Συνέβη κάποιο σφάλμα κατά την ανανέωση της σύμβασης.");
    } finally {
      setIsRenewing(false);
    }
  };

  const getQuoteRoute = (contractType) => {
    const type = contractType?.toLowerCase() || "";
    const routeMap = {
      travel: "/get-a-quote-travel",
      foreigners: "/get-a-quote-foreigners",
      immigration: "/get-a-quote-foreigners",
      intermediaries: "/get-a-quote-intermediaries",
      liability: "/get-a-quote-liability",
      guarantee: "/get-a-quote-guarantee",
      bond: "/get-a-quote-guarantee",
    };
    return routeMap[type] || "/get-a-quote-travel";
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !contractData) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </div>
      </ProtectedRoute>
    );
  }

  // Helper function to get field value from contract data
  const getField = (fieldName, defaultValue = "") => {
    return (
      contractData?.[fieldName] ||
      contractData?.[fieldName.toLowerCase()] ||
      contractData?.[fieldName.replace(/_/g, "")] ||
      defaultValue
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        i18n.language === "el" ? "el-GR" : "en-US"
      );
    } catch {
      return dateString;
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }
      return age;
    } catch {
      return "";
    }
  };

  const birthDate =
    getField("birth_date") || getField("date_birth") || getField("birthDate");
  const age = calculateAge(birthDate);
  const birthDateFormatted = formatDate(birthDate);
  const birthDateDisplay =
    birthDateFormatted +
    (age ? ` (${age} ${i18n.language === "el" ? "χρονών" : "years old"})` : "");

  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="Inter_font flex flex-col lg:flex-row justify-center items-baseline gap-7 my-10 mx-5">
          {/* Insurance Details Section */}
          <section
            className="w-full lg:w-auto 2xl:w-[778px] bg-[#FFEFEA] rounded-3xl"
            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
          >
            <h1 className="max-w-[683px] vsm:text-xl sm:text-3xl text-left font-medium m-8">
              {t("active_contract.title")}
            </h1>
            <hr className="border border-[#FACABC] mx-5" />

            {error && (
              <div className="mx-8 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 sm:px-14">
              {/* Insurance Company */}
              <article className="flex gap-4 vsm:gap-7 items-center">
                <iconsUtil.CompanyIcon />
                <span>
                  <h1 className="sm:text-lg font-semibold text-secondaryColor">
                    {t("active_contract.insurance_company")}
                  </h1>
                  <h2 className="text-sm sm:text-base">
                    {getField("insurance_company") ||
                      getField("company") ||
                      "HDI Global Specialty SE"}
                  </h2>
                </span>
              </article>
              <hr className="border border-[#FACABC] w-full" />

              {/* Insurance Period */}
              <article className="flex gap-4 vsm:gap-7 items-center">
                <iconsUtil.PeriodIcon />
                <span>
                  <h1 className="sm:text-lg font-semibold text-secondaryColor">
                    {t("active_contract.insurance_period")}
                  </h1>
                  <h2 className="text-sm sm:text-base">
                    {getField("insurance_period") ||
                      getField("period") ||
                      getField("duration") ||
                      ""}
                  </h2>
                </span>
              </article>
              <hr className="border border-[#FACABC] w-full" />

              {/* Insured Person */}
              <article className="flex gap-4 vsm:gap-7 items-center">
                <iconsUtil.PersonIcon />
                <span>
                  <h1 className="sm:text-lg font-semibold text-secondaryColor">
                    {t("active_contract.insured_person")}
                  </h1>
                  <h2 className="text-sm sm:text-base">
                    {getField("insured_person") ||
                      getField("full_name") ||
                      getField("name") ||
                      getField("first_name") + " " + getField("last_name") ||
                      ""}
                  </h2>
                </span>
              </article>
              <hr className="border border-[#FACABC] w-full" />

              {/* Nationality */}
              <article className="flex gap-4 vsm:gap-7 items-center">
                <iconsUtil.TravellingToIcon />
                <span>
                  <h1 className="sm:text-lg font-semibold text-secondaryColor">
                    {t("active_contract.nationality")}
                  </h1>
                  <h2 className="text-sm sm:text-base">
                    {getField("nationality") || getField("country") || ""}
                  </h2>
                </span>
              </article>
              <hr className="border border-[#FACABC] w-full" />

              {/* Identity Card */}
              <article className="flex gap-4 vsm:gap-7 items-center">
                <iconsUtil.IDIcon />
                <span>
                  <h1 className="sm:text-lg font-semibold text-secondaryColor">
                    {t("active_contract.identity_card")}
                  </h1>
                  <h2 className="text-sm sm:text-base">
                    {getField("identity_card") ||
                      getField("id_card") ||
                      getField("id_number") ||
                      getField("identification") ||
                      ""}
                  </h2>
                </span>
              </article>
              <hr className="border border-[#FACABC] w-full" />

              {/* Birth Date */}
              {birthDate && (
                <>
                  <article className="flex gap-4 vsm:gap-7 items-center">
                    <iconsUtil.CakeIcon />
                    <span>
                      <h1 className="sm:text-lg font-semibold text-secondaryColor">
                        {t("active_contract.birth_date")}
                      </h1>
                      <h2 className="text-sm sm:text-base">
                        {birthDateDisplay}
                      </h2>
                    </span>
                  </article>
                  <hr className="border border-[#FACABC] w-full" />
                </>
              )}

              {/* Gender */}
              {getField("gender") && (
                <article className="flex gap-4 vsm:gap-7 items-center">
                  <iconsUtil.GenderIcon />
                  <span>
                    <h1 className="sm:text-lg font-semibold text-secondaryColor">
                      {t("active_contract.gender")}
                    </h1>
                    <h2 className="text-sm sm:text-base">
                      {getField("gender")}
                    </h2>
                  </span>
                </article>
              )}
            </div>
          </section>

          {/* Cover Details Section */}
          <section
            className="relative w-full lg:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
          >
            <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
              <h1 className="max-w-[683px] text-xl sm:text-2xl lg:text-3xl text-center font-medium">
                {t("active_contract.coverages")}
              </h1>
              <iconsUtil.DownloadIcon />
            </div>

            <hr className="border border-[#FACABC] mx-5" />

            {/* Cover Details Rows */}
            <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 xl:pt-28 xl:max-h-[705px] xl:overflow-y-scroll overflow-x-hidden">
              {contractData?.coverages &&
              Array.isArray(contractData.coverages) &&
              contractData.coverages.length > 0 ? (
                contractData.coverages.map((coverage, index) => (
                  <Fragment key={index}>
                    <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                      {coverage.amount && (
                        <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                          {typeof coverage.amount === "number"
                            ? `€${coverage.amount.toLocaleString()}`
                            : coverage.amount}
                        </p>
                      )}
                      <span>
                        {coverage.title && (
                          <h1 className="sm:text-lg font-semibold text-secondaryColor">
                            {coverage.title}
                          </h1>
                        )}
                        {coverage.description && (
                          <h2 className="text-sm sm:text-base">
                            {coverage.description}
                          </h2>
                        )}
                        {coverage.details &&
                          Array.isArray(coverage.details) && (
                            <ul className="list-disc ml-5 mt-3 list-outside text-sm sm:text-base">
                              {coverage.details.map((detail, detailIndex) => (
                                <li
                                  key={detailIndex}
                                  className={detailIndex > 0 ? "mt-3" : ""}
                                >
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                      </span>
                    </article>
                    {index < contractData.coverages.length - 1 && (
                      <hr className="border border-[#FACABC] w-full" />
                    )}
                  </Fragment>
                ))
              ) : (
                // Fallback to default coverages if API doesn't provide them
                <>
                  {/* Death Coverage */}
                  <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                    <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                      500€
                    </p>
                    <span>
                      <h1 className="sm:text-lg font-semibold text-secondaryColor">
                        {t("active_contract.details.death")}
                      </h1>
                      <h2 className="text-sm sm:text-base">ΜΕΡΟΣ Β</h2>
                    </span>
                  </article>
                  <hr className="border border-[#FACABC] w-full" />

                  {/* Total Disability */}
                  <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                    <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                      15.000€
                    </p>
                    <span>
                      <h1 className="sm:text-lg font-semibold text-secondaryColor">
                        {t("active_contract.details.total_disability")}
                      </h1>
                      <h2 className="text-sm sm:text-base">
                        Συμμετοχή του ασφαλιζόμενου 20% για κάθε μία απαίτηση
                      </h2>
                      <ul className="list-disc ml-5 mt-3 list-outside text-sm sm:text-base">
                        <li>Μόνιμη ολική ανικανότητα από ατύχημα</li>
                        <li className="mt-3">
                          Μόνιμη μερική ανικανότητα από ατύχημα (ποσοστό με βάση
                          τον πίνακα αποζημίωσης του ασφαλιστηρίου)
                        </li>
                      </ul>
                    </span>
                  </article>
                  <hr className="border border-[#FACABC] w-full" />

                  {/* Hospitalization */}
                  <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                    <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                      10.000€
                    </p>
                    <span>
                      <h1 className="sm:text-lg font-semibold text-secondaryColor">
                        {t("active_contract.details.hospitalization")}
                      </h1>
                      <h2 className="text-sm sm:text-base">
                        Μόνο εντός δημοσίου νοσοκομείου. Ανώτατο όριο κατά
                        περιστατικό και συνολικά ετησίως έως 10.000€. (συμμετοχή
                        του ασφαλιζόμενου 20% για κάθε μία απαίτηση)
                      </h2>
                    </span>
                  </article>
                  <hr className="border border-[#FACABC] w-full" />

                  {/* Medical Expenses */}
                  <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                    <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                      1.500€
                    </p>
                    <span>
                      <h1 className="sm:text-lg font-semibold text-secondaryColor">
                        {t("active_contract.details.medical_expenses")}
                      </h1>
                      <h2 className="text-sm sm:text-base">
                        Μόνο εντός δημοσίου νοσοκομείου. Ανώτατο όριο κατά
                        περιστατικό και συνολικά ετησίως έως 1.500€. (συμμετοχή
                        του ασφαλιζόμενου 20% για κάθε μία απαίτηση)
                      </h2>
                    </span>
                  </article>
                </>
              )}
            </div>

            <div className="absolute -bottom-36 p-5 w-full bg-white border-none">
              {/* Total Amount */}
              <h1 className="text-2xl py-2 sm:text-4xl text-center font-semibold text-secondaryColor w-full">
                {t("active_contract.amount_payed")}{" "}
                {getField("amount") ||
                getField("total_amount") ||
                getField("price")
                  ? `€${
                      getField("amount") ||
                      getField("total_amount") ||
                      getField("price")
                    }`
                  : "€175.00"}
              </h1>

              {/* Renew Button (only if is_renewable === true) */}
              {contractData?.is_renewable === true && (
                <button
                  className="text-center sm:text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-[30px] py-3 w-full transition-all mb-3"
                  style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                  onClick={handleRenew}
                  disabled={isRenewing}
                >
                  {isRenewing
                    ? t("active_contract.renewing") || "Renewing..."
                    : t("active_contract.renew_button") || "Renew Contract"}
                </button>
              )}

              {/* Back Button */}
              <button
                className="text-center sm:text-xl font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
                style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                onClick={() => window.history.back()}
              >
                {t("active_contract.back_button")}
              </button>
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
};