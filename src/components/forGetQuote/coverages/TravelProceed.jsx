import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as iconsUtil from "@/utils/icons.util";
import { QuoteHeader, TravelForm, LoadingSpinner, LoginPopup, RegisterPopup, OtpPopup } from "@/components";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// === ديناميكي 100% - كل الأيقونات في object واحد ===
const COVERAGE_CONFIG = [
  { key: "cancellation",        icon: iconsUtil.CancellationIcon,        fallback: "cancellation" },
  { key: "medical",             icon: iconsUtil.MedicIcon,               fallback: "medical" },
  { key: "baggage",             icon: iconsUtil.BaggageIcon,             fallback: "baggage" },
  { key: "accident",            icon: iconsUtil.PersonalAccidentIcon,    fallback: "personal_accident" },
  { key: "delay",               icon: iconsUtil.TravelDelayIcon,         fallback: "travel_delay" },
  { key: "possessions",         icon: iconsUtil.PersonalPossessionsIcon, fallback: "personal_possessions" },
  { key: "money",               icon: iconsUtil.PersonalMoneyIcon,       fallback: "personal_money" },
  { key: "liability",           icon: iconsUtil.PersonalLiabilityIcon,  fallback: "personal_liability" },
  { key: "expenses",            icon: iconsUtil.LegalExpensesIcon,       fallback: "legal_expenses" },
];

export const TravelProceed = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Authentication popup states
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  // Load stored quote data
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = () => {
    try {
      const storedData = localStorage.getItem("travelQuoteData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.selectedQuote) {
          setSelectedQuote(parsedData.selectedQuote);
        } else if (parsedData.quotes && parsedData.quotes.length > 0) {
          setSelectedQuote(parsedData.quotes[0]);
        }
        setUserDetails(parsedData.userData);
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
      setError("Failed to load quote data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`${API_BASE_URL}/user/details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept-Language": i18n.language,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user details");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };

  const openModal = async () => {
    if (isAuthenticated) {
      try {
        await fetchUserDetails();
        setIsModalOpen(true);
      } catch {
        setIsLoginPopupOpen(true);
      }
    } else {
      setIsLoginPopupOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // Listen for login success
  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (isAuthenticated && !isModalOpen) {
        try {
          await fetchUserDetails();
          setIsModalOpen(true);
        } catch (error) {
          console.error("Failed to fetch user details after login:", error);
        }
      }
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    return () => window.removeEventListener("loginSuccess", handleLoginSuccess);
  }, [isAuthenticated, isModalOpen]);

  if (isLoading) {
    return (
      <Fragment>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Fragment>
    );
  }

  if (error || !selectedQuote || !userDetails) {
    return (
      <Fragment>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg font-semibold text-red-600">
            {error || "No quote data found"}
          </div>
        </div>
      </Fragment>
    );
  }

  // Helper: استخراج النص والقيمة من API أو fallback
  const getCoverage = (key, fallbackKey) => {
    const item = selectedQuote.coverage?.[key];
    return {
      text: item?.text || t(`travel_proceed.covers.${fallbackKey}`),
      value: item?.value || "—",
    };
  };

  return (
    <Fragment>
      {/* === Popups === */}
      {isLoginPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <LoginPopup
            handleLoginPopupClose={() => setIsLoginPopupOpen(false)}
            onSwitchToRegister={() => {
              setIsLoginPopupOpen(false);
              setIsRegisterPopupOpen(true);
            }}
            onSwitchToOtp={(email) => {
              setIsLoginPopupOpen(false);
              setIsOtpPopupOpen(true);
              setOtpEmail(email);
            }}
          />
        </div>
      )}

      {isRegisterPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <RegisterPopup
            handleLoginPopupClose={() => setIsRegisterPopupOpen(false)}
            onSwitchToOtp={(email) => {
              setIsRegisterPopupOpen(false);
              setIsOtpPopupOpen(true);
              setOtpEmail(email);
            }}
          />
        </div>
      )}

      {isOtpPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <OtpPopup
            handleLoginPopupClose={() => setIsOtpPopupOpen(false)}
            email={otpEmail}
            onSwitchToLogin={() => {
              setIsOtpPopupOpen(false);
              setIsLoginPopupOpen(true);
            }}
          />
        </div>
      )}

      <QuoteHeader />
      <hr className="border mx-10 my-1" />

      <main className="Inter_font flex flex-col lg:flex-row justify-center items-baseline gap-7 my-10 mx-5">

        {/* === Insurance Details === */}
        <section
          className="w-full lg:w-auto 2xl:w-[778px] bg-[#FFEFEA] rounded-3xl"
          style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
        >
          <h1 className="hidden sm:block max-w-[683px] text-2xl sm:text-3xl text-left font-medium m-8">
            {t("travel_proceed.header.desktop")}
          </h1>
          <h1 className="sm:hidden max-w-[683px] text-2xl lg:text-3xl text-left font-medium m-7">
            {t("travel_proceed.header.mobile")}
          </h1>

          <hr className="border border-[#FACABC] mx-5" />

          <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 sm:px-14">
            {/* Company */}
            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.CompanyIcon />
              <span>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.insurance_company")}
                </h1>
                <h2 className="text-sm sm:text-base">HDI Global Specialty SE</h2>
              </span>
            </article>

            {/* Period */}
            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.PeriodIcon />
              <span>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.insurance_period")}
                </h1>
                <h2 className="text-sm sm:text-base">
                  {userDetails.step2.startDate} to {userDetails.step2.endDate}
                </h2>
              </span>
            </article>

            <hr className="border border-[#FACABC] w-full" />

            {/* From */}
            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.TravellingFromIcon />
              <span>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.travelling_from")}
                </h1>
                <h2 className="text-sm sm:text-base">{userDetails.step1.fromCountry}</h2>
              </span>
            </article>

            {/* To */}
            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.TravellingToIcon />
              <span>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.travelling_to")}
                </h1>
                <h2 className="text-sm sm:text-base">{userDetails.step1.toCountry.join(", ")}</h2>
              </span>
            </article>

            <hr className="border border-[#FACABC] w-full" />

            {/* Traveler */}
            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.TravelerIcon />
              <span>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.traveler")}
                </h1>
                <h2 className="text-sm sm:text-base">
                  {userDetails.step3.insuredType} ({userDetails.step4.persons.length}{" "}
                  {userDetails.step4.persons.length === 1 ? "person" : "persons"})
                </h2>
              </span>
            </article>

            <hr className="border border-[#FACABC] w-full" />

            {/* Total */}
            <h1 className="text-2xl sm:text-4xl text-center font-semibold text-secondaryColor w-full">
              {t("travel_proceed.total")} {selectedQuote.currency || "€"}
              {selectedQuote.price || "0.00"}
            </h1>

            {/* Proceed */}
            <button
              onClick={openModal}
              className="text-center sm:text-xl font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
              style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
            >
              {t("travel_proceed.proceed_button")}
            </button>
          </div>
        </section>

        {/* === Cover Details - ديناميكي 100% === */}
        <section
          className="w-full lg:w-auto 2xl:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
          style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
        >
          <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
            <h1 className="max-w-[683px] text-2xl lg:text-3xl text-left font-medium">
              {selectedQuote.name || t("travel_proceed.cover")}
            </h1>
            <iconsUtil.DownloadIcon />
          </div>

          <hr className="border border-[#FACABC] mx-5" />

          {/* === Grid ديناميكي - 3 أعمدة === */}
          <div className="grid grid-cols-3 gap-4 p-5">
            {COVERAGE_CONFIG.map(({ key, icon: Icon, fallback }) => {
              const { text, value } = getCoverage(key, fallback);
              return (
                <div
                  key={key}
                  className="flex flex-col justify-center items-center gap-3 text-center text-sm vsm:text-lg text-secondaryColor"
                >
                  <Icon />
                  <p className="flex flex-col text-black">
                    {text}
                    <span className="font-medium">{value}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* === Modal === */}
      <TravelForm
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedQuote={selectedQuote}
        userDetails={userDetails}
      />
    </Fragment>
  );
};