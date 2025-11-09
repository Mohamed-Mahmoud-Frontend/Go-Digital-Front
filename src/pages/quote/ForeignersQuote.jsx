import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "foreignersQuoteForm";

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
export const ForeignersQuote = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiData, setApiData] = useState({
    questions: [],
    countries: [],
    genders: [],
  });

  /* --------------------------- LOCAL STORAGE ---------------------------- */
  const [userData, setUserData] = useState(() => {
    const defaultData = {
      step1: { firstName: "", lastName: "" },
      step2: { nationality: "", nationalityId: null, identification: "" },
      step3: { birthday: "", gender: "", genderId: null },
      step4: { insurancePeriod: "" },
    };

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return defaultData;

      const parsed = JSON.parse(saved);

      return {
        step1: {
          firstName: parsed.step1?.firstName ?? "",
          lastName: parsed.step1?.lastName ?? "",
        },
        step2: {
          nationality: parsed.step2?.nationality ?? "",
          nationalityId: parsed.step2?.nationalityId ? Number(parsed.step2.nationalityId) : null,
          identification: parsed.step2?.identification ?? "",
        },
        step3: {
          birthday: parsed.step3?.birthday ?? "",
          gender: parsed.step3?.gender ?? "",
          genderId: parsed.step3?.genderId !== undefined ? Number(parsed.step3.genderId) : null,
        },
        step4: { insurancePeriod: parsed.step4?.insurancePeriod ?? "" },
      };
    } catch {
      return defaultData;
    }
  });

  // حفظ تلقائي
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error("localStorage save error:", e);
    }
  }, [userData]);

  /* ------------------------------- API -------------------------------- */
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `${API_BASE_URL}/user/immigrationMedical/getArguments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        console.log("API Response:", data);

        setApiData({
          questions: data.questions || [],
          countries: (data.countries || []).map(c => ({
            id: Number(c.id),
            name: c.name,
          })),
          genders: (data.genders || []).map(g => ({
            id: Number(g.id),
            name: g.name,
          })),
        });
      } catch (err) {
        console.error(err);
        setError(
          t("common.error.failed_load_data") ||
            "Failed to load data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [i18n.language, t]);

  /* ---------------------- PRE-FILL IDENTIFICATION ---------------------- */
  useEffect(() => {
    const prefilledId = localStorage.getItem("foreigners_id_prefill");
    if (prefilledId && apiData.countries.length > 0) {
      setUserData((prev) => ({
        ...prev,
        step2: { ...prev.step2, identification: prefilledId },
      }));
      localStorage.removeItem("foreigners_id_prefill");
    }
  }, [apiData.countries]);

  /* --------------------------- INPUT HANDLERS -------------------------- */
  const handleInputChange = (step, field, value) => {
    setIsInvalid(false);

    if (step === "step3" && field === "gender") {
      const selected = apiData.genders.find((g) => g.name.toLowerCase() === value.toLowerCase());
      setUserData((prev) => ({
        ...prev,
        step3: {
          ...prev.step3,
          gender: value,                    // "Male" أو "Female"
          genderId: selected ? selected.id : null,
        },
      }));
      return;
    }

    setUserData((prev) => ({
      ...prev,
      [step]: { ...prev[step], [field]: value },
    }));
  };

  // دولة واحدة فقط
  const handleNationalitySelect = (name) => {
    const country = apiData.countries.find((c) => c.name === name);
    if (country) {
      setIsInvalid(false);
      setUserData((prev) => ({
        ...prev,
        step2: {
          ...prev.step2,
          nationality: country.name,
          nationalityId: country.id,
        },
      }));
    }
  };

  const handleNationalityClear = () => {
    setUserData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        nationality: "",
        nationalityId: null,
      },
    }));
  };

  /* ----------------------------- VALIDATION ---------------------------- */
  const isStepValid = (step) => {
    const data = userData[`step${step + 1}`];
    switch (step) {
      case 0:
        return data.firstName.trim() && data.lastName.trim();
      case 1:
        return data.nationalityId !== null && data.identification.trim();
      case 2: {
        if (!data.birthday || !data.gender) return false;
        const birth = new Date(data.birthday);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return birth <= today;
      }
      case 3: {
        if (!data.insurancePeriod) return false;
        const ins = new Date(data.insurancePeriod);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return ins >= today;
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((p) => p + 1);
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((p) => Math.max(p - 1, 0));
    setIsInvalid(false);
  };

  const handleSubmit = async () => {
    if (!isStepValid(totalSteps - 1)) {
      setIsInvalid(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        country_id: userData.step2.nationalityId, // number
        date_birth: userData.step3.birthday,
        first_name: userData.step1.firstName,     // مع المسافات
        last_name: userData.step1.lastName,       // مع المسافات
        identification: userData.step2.identification,
        gender: userData.step3.gender.toLowerCase(), // female أو male (small letters)
      };

      // تحقق من الحقول
      if (!payload.gender || payload.country_id === null) {
        setError("Please fill all required fields.");
        setIsLoading(false);
        return;
      }

      console.log("Submitting payload:", payload);

      const res = await fetch(
        `${API_BASE_URL}/user/immigrationMedical/getQuotes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": i18n.language,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("API Error:", err);
        throw new Error(
          err.message ||
            t("common.error.failed_fetch_quotes") ||
            "Failed to fetch quotes"
        );
      }

      const result = await res.json();

      localStorage.setItem(
        "foreignersQuoteData",
        JSON.stringify({
          userData,
          apiData,
          quotes: result.quotes || [],
        })
      );
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate("/get-a-quote-foreigners/proceed");
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err.message ||
          t("common.error.try_again") ||
          "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------- DATE HELPERS --------------------------- */
  const getMaxBirthDate = () => new Date().toISOString().split("T")[0];

  const getMinInsuranceDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  /* ----------------------------- RENDER ------------------------------ */
  if (isLoading && currentStep === 0) {
    return (
      <main>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  if (error && currentStep === 0) {
    return (
      <main>
        <QuoteHeader />
        <div className="flex flex-col justify-center items-center min-h-screen text-red-600 gap-4">
          <div className="text-xl font-semibold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            {t("common.button.retry") || "Retry"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <QuoteHeader />

      <section className="border-t-2  mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        {/* Progress Bar */}
        <div className="flex flex-col justify-center items-center my-10">
          <div className="flex items-center gap-3 relative w-full max-w-[90%] sm:max-w-xl">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-[15px] rounded-[5px] transition-colors duration-300 ${
                  i < currentStep ? "bg-orange-400" : "bg-gray-300"
                }`}
              />
            ))}
            <span
              className="absolute transition-all duration-300"
              style={{
                left: `calc(${(currentStep / (totalSteps - 1)) * 100}% - 12px)`,
              }}
            >
              <Icons.QuotePersonIcon />
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="my-5 flex flex-wrap justify-center items-center gap-5 w-full">
          {/* STEP 1 */}
          {currentStep === 0 && (
            <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
              <Icons.QuoteProfileIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step1.title1")}
              </h1>
              <TravelInput
                placeholder={t("foreigners_quote_page.steps.step1.placeholder_name")}
                value={userData.step1.firstName}
                onChange={(e) => handleInputChange("step1", "firstName", e.target.value)}
                isInvalid={isInvalid && !userData.step1.firstName.trim()}
              />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step1.title2")}
              </h1>
              <TravelInput
                placeholder={t("foreigners_quote_page.steps.step1.placeholder_lastname")}
                value={userData.step1.lastName}
                onChange={(e) => handleInputChange("step1", "lastName", e.target.value)}
                isInvalid={isInvalid && !userData.step1.lastName.trim()}
              />
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 1 && (
            <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
              <Icons.QuoteCardIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step2.title1")}
              </h1>
              <SingleCountrySelect
                placeholder={t("foreigners_quote_page.steps.step2.placeholder_nationality")}
                options={apiData.countries.map((c) => c.name)}
                selectedCountry={userData.step2.nationality}
                onSelectCountry={handleNationalitySelect}
                onClear={handleNationalityClear}
                isInvalid={isInvalid && userData.step2.nationalityId === null}
              />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step2.title2")}
              </h1>
              <TravelInput
                placeholder={t("foreigners_quote_page.steps.step2.placeholder_identification")}
                value={userData.step2.identification}
                onChange={(e) => handleInputChange("step2", "identification", e.target.value)}
                isInvalid={isInvalid && !userData.step2.identification.trim()}
              />
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 2 && (
            <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
              <Icons.QuoteBirthIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step3.title1")}
              </h1>
              <TravelInput
                type="date"
                value={userData.step3.birthday}
                onChange={(e) => handleInputChange("step3", "birthday", e.target.value)}
                isInvalid={isInvalid && !userData.step3.birthday}
                max={getMaxBirthDate()}
              />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step3.title2")}
              </h1>
              <TravelSelect
                placeholder={t("foreigners_quote_page.steps.step3.placeholder_gender")}
                value={userData.step3.gender}
                onChange={(e) => handleInputChange("step3", "gender", e.target.value)}
                isInvalid={isInvalid && !userData.step3.gender}
                options={apiData.genders.map((g) => g.name)}
              />
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 3 && (
            <div className="flex flex-col justify-center items-center gap-10">
              <Icons.QuoteCalenderIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step4.title")}
              </h1>
              <TravelInput
                type="date"
                value={userData.step4.insurancePeriod}
                onChange={(e) => handleInputChange("step4", "insurancePeriod", e.target.value)}
                isInvalid={isInvalid && !userData.step4.insurancePeriod}
                min={getMinInsuranceDate()}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-3 vsm:gap-10 my-5">
          <ActionButton
            text={t("foreigners_quote_page.buttons.previous")}
            iconPosition="left"
            onClick={handlePrevious}
            isDisabled={currentStep === 0}
          />
          {currentStep < totalSteps - 1 ? (
            <ActionButton
              text={t("foreigners_quote_page.buttons.next")}
              iconPosition="right"
              onClick={handleNext}
              isNext
            />
          ) : (
            <ActionButton
              text={
                isLoading ? (
                  <LoadingSpinner />
                ) : (
                  t("foreigners_quote_page.buttons.submit")
                )
              }
              iconPosition="right"
              onClick={handleSubmit}
              isNext
              isDisabled={isLoading || !isStepValid(totalSteps - 1)}
            />
          )}
        </div>

        {error && currentStep !== 0 && (
          <div className="text-red-600 text-center mt-4 font-medium">
            {error}
          </div>
        )}
      </section>
    </main>
  );
};

/* -------------------------------------------------------------------------- */
/*                               INPUT COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const TravelInput = ({
  placeholder,
  value,
  onChange,
  isInvalid,
  type = "text",
  max,
  min,
}) => {
  const isDate = type === "date";
  const valueClass = (value || isDate) ? "text-black border-black" : "text-[#C3C3C3]";

  return (
    <input
      type={type}
      placeholder={isDate ? "" : placeholder}
      value={value}
      onChange={onChange}
      max={max}
      min={min}
      className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-semibold focus:outline-none 
        ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
        ${valueClass}`}
    />
  );
};

const TravelSelect = ({
  placeholder,
  value,
  onChange,
  options,
  isInvalid,
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  >
    <option value="" disabled hidden>
      {placeholder}
    </option>
    {options.map((opt, i) => (
      <option key={i} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const SingleCountrySelect = ({
  placeholder,
  options,
  selectedCountry,
  onSelectCountry,
  onClear,
  isInvalid,
}) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const availableOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (name) => {
    onSelectCountry(name);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
      <div
        className={`flex items-center justify-between w-full h-[75px] px-4 border rounded-[10px] cursor-pointer
          ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
          ${selectedCountry ? "border-black" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCountry ? "text-black font-medium" : "text-[#C3C3C3]"}>
          {selectedCountry || placeholder}
        </span>
        {selectedCountry && (
          <button
            type="button"
            className="text-gray-600 hover:text-black"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-[10px] shadow-lg">
          <input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border-b focus:outline-none"
            autoFocus
          />
          <ul className="max-h-60 overflow-y-auto">
            {availableOptions.map((country, i) => (
              <li
                key={i}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-black font-medium"
                onClick={() => handleSelect(country)}
              >
                {country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({
  text,
  iconPosition,
  onClick,
  isDisabled,
  isNext,
}) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
   className={`group flex items-center justify-between px-5 sm:px-3 
      ${
        isNext ? "sm:pl-16" : "sm:pr-14"
      } w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
      border rounded-[27.5px] shadow-md transition-all
      ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-black"}`}
  >
    {iconPosition === "left" && (
      <span
        className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform -rotate-90 group-hover:-rotate-[135deg]
          ${isDisabled ? "bg-gray-300" : "bg-black"}`}
      >
        <Icons.QuoteArrowIcon />
      </span>
    )}
    {text}
    {iconPosition === "right" && (
      <span
        className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45 ${
          isDisabled ? "bg-gray-300" : "bg-secondaryColor"
        }`}
      >
        <Icons.QuoteArrowIcon />
      </span>
    )}
  </button>
);

/* -------------------------------------------------------------------------- */
/*                                 PROPTYPES                                  */
/* -------------------------------------------------------------------------- */
TravelInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
  type: PropTypes.string,
  max: PropTypes.string,
  min: PropTypes.string,
};

TravelSelect.propTypes = {
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  isInvalid: PropTypes.bool,
};

SingleCountrySelect.propTypes = {
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCountry: PropTypes.string,
  onSelectCountry: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
};

ActionButton.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isNext: PropTypes.bool,
};