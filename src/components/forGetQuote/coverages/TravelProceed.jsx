// src/pages/TravelProceed.jsx
import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as iconsUtil from "@/utils/icons.util";
import { QuoteHeader, TravelForm, LoadingSpinner, LoginPopup, RegisterPopup, OtpPopup } from "@/components";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedData = localStorage.getItem("travelQuoteData");
        if (!storedData) throw new Error("No quote data found");

        const parsed = JSON.parse(storedData);
        const quotes = parsed.quotes || [];
        const formData = parsed.formData || parsed.userData;

        if (!quotes.length) throw new Error("No quotes available");

        const quote = parsed.selectedQuote || quotes[0];
        setSelectedQuote(quote);
        setUserDetails(formData);
      } catch (err) {
        console.error("Failed to load quote data:", err);
        setError(t("travel_proceed.errors.load_failed"));
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, [t]);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");

    const response = await fetch(`${API_BASE_URL}/user/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept-Language": i18n.language,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user");
    return await response.json();
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

  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (isAuthenticated && !isModalOpen) {
        try {
          await fetchUserDetails();
          setIsModalOpen(true);
        } catch (err) {
          console.error("Login success but failed to load user:", err);
        }
      }
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    return () => window.removeEventListener("loginSuccess", handleLoginSuccess);
  }, [isAuthenticated, isModalOpen]);

  const getCoverage = (key, fallbackKey) => {
    const item = selectedQuote?.coverage?.[key];
    return {
      text: item?.text || t(`travel_proceed.covers.${fallbackKey}`),
      value: item?.value || "—",
      details: item?.details || t("common.no_details_available"),
    };
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = selectedQuote?.policy_document || "#";
    link.download = `${selectedQuote?.name || "policy"}.pdf`;
    link.click();
  };

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
          <div className="text-lg font-semibold text-red-600 text-center p-5">
            {error || t("travel_proceed.errors.no_data")}
          </div>
          </div>
       
      </Fragment>
    );
  }

  return (
    <Fragment>
      {/* === Authentication Popups === */}
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

        {/* === Insurance Summary === */}
        <section
          className="w-full lg:w-auto 2xl:w-[778px] bg-[#FFEFEA] rounded-3xl p-6"
          style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
        >
          <h1 className="hidden sm:block max-w-[683px] text-2xl sm:text-3xl text-left font-medium mb-4">
            {t("travel_proceed.header.desktop")}
          </h1>
          <h1 className="sm:hidden max-w-[683px] text-2xl lg:text-3xl text-left font-medium mb-4">
            {t("travel_proceed.header.mobile")}
          </h1>

          <hr className="border border-[#FACABC] mx-5 mb-6" />

          <div className="space-y-6">

            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.CompanyIcon />
              <div>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.insurance_company")}
                </h1>
                <h2 className="text-sm sm:text-base">HDI Global Specialty SE</h2>
              </div>
            </article>

            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.PeriodIcon />
              <div>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.insurance_period")}
                </h1>
                <h2 className="text-sm sm:text-base">
                  {userDetails.step2.startDate} to {userDetails.step2.endDate}
                </h2>
              </div>
            </article>

            <hr className="border border-[#FACABC]" />

            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.TravellingFromIcon />
              <div>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.travelling_from")}
                </h1>
                <h2 className="text-sm sm:text-base">{userDetails.step1.fromCountry}</h2>
              </div>
            </article>

            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.TravellingToIcon />
              <div>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.travelling_to")}
                </h1>
                <h2 className="text-sm sm:text-base">{userDetails.step1.toCountry.join(", ")}</h2>
              </div>
            </article>

            <hr className="border border-[#FACABC]" />

            <article className="flex gap-4 vsm:gap-7 items-center">
              <iconsUtil.TravelerIcon />
              <div>
                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                  {t("travel_proceed.traveler")}
                </h1>
                <h2 className="text-sm sm:text-base">
                  {userDetails.step3.insuredType} ({userDetails.step4.persons.length}{" "}
                  {userDetails.step4.persons.length === 1 ? t("common.person") : t("common.persons")})
                </h2>
              </div>
            </article>

            <hr className="border border-[#FACABC]" />

            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl font-semibold text-secondaryColor">
                {t("travel_proceed.total")} {selectedQuote.currency || "EUR"}{selectedQuote.price || "0.00"}
              </h1>
            </div>

            <button
              onClick={openModal}
              className="w-full bg-secondaryColor hover:bg-secondaryColor/80 text-white font-bold text-center py-3 rounded-[30px] transition-all duration-200"
              style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
            >
              {t("travel_proceed.proceed_button")}
            </button>
          </div>
        </section>

        {/* === Coverage Details - ديناميكي 100% === */}
        <section
          className="w-full lg:w-auto 2xl:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE] p-6"
          style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
        >
          <div className="flex flex-row-reverse sm:flex-row justify-between items-center mb-4">
            <h1 className="text-2xl lg:text-3xl font-medium">
              {selectedQuote.name || t("travel_proceed.cover")}
            </h1>
            <button
              onClick={handleDownload}
              className="text-secondaryColor hover:text-black transition-colors"
              aria-label={t("travel_proceed.download_policy")}
            >
              <iconsUtil.DownloadIcon />
            </button>
          </div>

          <hr className="border border-[#FACABC] mx-5 mb-6" />

          <div className="grid grid-cols-3 gap-4 p-5">
            {COVERAGE_CONFIG.map(({ key, icon: Icon, fallback }) => {
              const { text, value } = getCoverage(key, fallback);
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-3 text-center text-sm vsm:text-lg text-secondaryColor"
                >
                  <Icon />
                  <div className="text-black">
                    <p className="text-xs vsm:text-sm">{text}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* === Payment Modal === */}
      <TravelForm
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedQuote={selectedQuote}
        userDetails={userDetails}
      />
    </Fragment>
  );
};