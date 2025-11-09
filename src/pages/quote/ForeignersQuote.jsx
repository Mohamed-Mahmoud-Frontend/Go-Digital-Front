import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "foreignersQuoteForm";

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

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          step1: { firstName: "", lastName: "" },
          step2: { nationality: "", nationalityId: "", identification: "" },
          step3: { birthday: "", gender: "", genderId: "" },
          step4: { insurancePeriod: "" },
        };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/user/immigrationMedical/getArguments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setApiData(data);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [i18n.language]);

  useEffect(() => {
    const prefilledId = localStorage.getItem("foreigners_id_prefill");
    if (prefilledId && apiData.countries.length > 0) {
      setUserData((prev) => ({
        ...prev,
        step2: { ...prev.step2, identification: prefilledId },
      }));
      setCurrentStep(1);
      localStorage.removeItem("foreigners_id_prefill");
    }
  }, [apiData.countries]);

  const handleInputChange = (step, field, value) => {
    setIsInvalid(false);

    if (step === "step2" && field === "nationality") {
      const selected = apiData.countries.find((c) => c.name === value);
      setUserData((prev) => ({
        ...prev,
        step2: {
          ...prev.step2,
          nationality: value,
          nationalityId: selected ? selected.id.toString() : "",
        },
      }));
    } else if (step === "step3" && field === "gender") {
      const selected = apiData.genders.find((g) => g.name === value);
      setUserData((prev) => ({
        ...prev,
        step3: {
          ...prev.step3,
          gender: value,
          genderId: selected ? selected.id.toString() : "",
        },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [step]: { ...prev[step], [field]: value },
      }));
    }
  };

  const isStepValid = (step) => {
    const data = userData[`step${step + 1}`];
    switch (step) {
      case 0:
        return data.firstName.trim() && data.lastName.trim();
      case 1:
        return data.nationalityId && data.identification.trim();
      case 2:
        if (!data.birthday || !data.genderId) return false;
        const birth = new Date(data.birthday);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return birth <= today;
      case 3:
        return data.insurancePeriod.trim();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setIsInvalid(false);
  };

  const handleSubmit = async () => {
    if (!isStepValid(currentStep)) {
      setIsInvalid(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        date_birth: userData.step3.birthday,
        identification: userData.step2.identification,
        first_name: userData.step1.firstName,
        last_name: userData.step1.lastName,
        gender: userData.step3.genderId,
        country_id: userData.step2.nationalityId,
      };

      const response = await fetch(
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

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch quotes");
      }

      const result = await response.json();

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
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="flex justify-center items-center min-h-screen text-red-600">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main>
      <QuoteHeader />

      <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center my-10">
          <div className="flex items-center gap-3 relative w-full">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-14 vsm:w-20 sm:w-32 md:w-[170px] lg:w-[214px] h-[15px] rounded-[5px]
                  ${i < currentStep ? "bg-orange-400" : "bg-gray-300"}
                  ${i === currentStep ? "ml-[70px] md:ml-16" : ""}`}
              />
            ))}
            <span
              className="absolute transition-all duration-300"
              style={{ left: `calc(${currentStep * 24}%)` }}
            >
              <Icons.QuotePersonIcon />
            </span>
          </div>
        </div>

        <div className="my-5 flex flex-wrap justify-center items-center gap-5 w-full">
          {currentStep === 0 && (
            <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
              <Icons.QuoteProfileIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step1.title1")}
              </h1>
              <TravelInput
                placeholder={t(
                  "foreigners_quote_page.steps.step1.placeholder_name"
                )}
                value={userData.step1.firstName}
                onChange={(e) =>
                  handleInputChange("step1", "firstName", e.target.value)
                }
                isInvalid={isInvalid && !userData.step1.firstName}
              />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step1.title2")}
              </h1>
              <TravelInput
                placeholder={t(
                  "foreigners_quote_page.steps.step1.placeholder_lastname"
                )}
                value={userData.step1.lastName}
                onChange={(e) =>
                  handleInputChange("step1", "lastName", e.target.value)
                }
                isInvalid={isInvalid && !userData.step1.lastName}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
              <Icons.QuoteCardIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step2.title1")}
              </h1>
              <SearchableSelect
                placeholder={t(
                  "foreigners_quote_page.steps.step2.placeholder_nationality"
                )}
                value={userData.step2.nationality}
                onChange={(name) =>
                  handleInputChange("step2", "nationality", name)
                }
                isInvalid={isInvalid && !userData.step2.nationalityId}
                options={apiData.countries.map((c) => c.name)}
              />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step2.title2")}
              </h1>
              <TravelInput
                placeholder={t(
                  "foreigners_quote_page.steps.step2.placeholder_identification"
                )}
                value={userData.step2.identification}
                onChange={(e) =>
                  handleInputChange("step2", "identification", e.target.value)
                }
                isInvalid={isInvalid && !userData.step2.identification}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
              <Icons.QuoteBirthIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step3.title1")}
              </h1>
              <TravelInput
                type="date"
                placeholder=""
                value={userData.step3.birthday}
                onChange={(e) =>
                  handleInputChange("step3", "birthday", e.target.value)
                }
                isInvalid={isInvalid && !userData.step3.birthday}
                max={new Date().toISOString().split("T")[0]}
              />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step3.title2")}
              </h1>
              <TravelSelect
                placeholder={t(
                  "foreigners_quote_page.steps.step3.placeholder_gender"
                )}
                value={userData.step3.gender}
                onChange={(e) =>
                  handleInputChange("step3", "gender", e.target.value)
                }
                isInvalid={isInvalid && !userData.step3.genderId}
                options={apiData.genders.map((g) => g.name)}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col justify-center items-center gap-10">
              <Icons.QuoteCalenderIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("foreigners_quote_page.steps.step4.title")}
              </h1>
              <TravelInput
                type="date"
                placeholder=""
                value={userData.step4.insurancePeriod}
                onChange={(e) =>
                  handleInputChange("step4", "insurancePeriod", e.target.value)
                }
                isInvalid={isInvalid && !userData.step4.insurancePeriod}
              />
            </div>
          )}
        </div>

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
              isDisabled={isLoading || !isStepValid(currentStep)}
            />
          )}
        </div>

        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      </section>
    </main>
  );
};

const TravelInput = ({
  placeholder,
  value,
  onChange,
  isInvalid,
  type = "text",
  max,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange}
    max={max}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-semibold focus:outline-none
      ${
        isInvalid
          ? "border-secondaryColor border-2 animate-pulse"
          : "border-[#C3C3C3]"
      }
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  />
);

const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
  <select
    value={value || ""}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      ${
        isInvalid
          ? "border-secondaryColor border-2 animate-pulse"
          : "border-[#C3C3C3]"
      }
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

const SearchableSelect = ({
  placeholder,
  options,
  value,
  onChange,
  isInvalid,
}) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const displayedValue = value || filter;

  const availableOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(filter.toLowerCase()) && opt !== value
  );

  const handleSelect = (countryName) => {
    onChange(countryName);
    setFilter("");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setFilter(e.target.value);
    if (value) {
      onChange("");
    }
  };

  return (
    <div className="relative w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
      <input
        type="text"
        placeholder={placeholder}
        value={displayedValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={`w-full h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
          ${
            isInvalid
              ? "border-secondaryColor border-2 animate-pulse"
              : "border-[#C3C3C3]"
          }
          ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
      />
      {isOpen && availableOptions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-[10px] shadow-lg mt-1">
          {availableOptions.map((country, index) => (
            <li
              key={index}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-black"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(country);
              }}
            >
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ActionButton = ({ text, iconPosition, onClick, isDisabled, isNext }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`group flex items-center justify-between px-5 sm:px-3 
      ${isNext ? "sm:pl-10" : "sm:pr-10"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
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
      <span className="flex justify-center items-center bg-secondaryColor w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45">
        <Icons.QuoteArrowIcon />
      </span>
    )}
  </button>
);

TravelInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
  type: PropTypes.string,
  max: PropTypes.string,
};

TravelSelect.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  isInvalid: PropTypes.bool,
};

SearchableSelect.propTypes = {
  placeholder: PropTypes.string,
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
};

ActionButton.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isNext: PropTypes.bool,
};