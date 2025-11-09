import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { QuoteHeader, Economy, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "travelQuoteForm";

const getApiInsuredType = (insuredType) => {
  const map = {
    "Ένα Άτομο": "individual",
    Individual: "individual",
    Ζευγάρι: "couple",
    Couple: "couple",
    Οικογένεια: "family",
    Family: "family",
    "Ομάδα (Group)": "group",
    Group: "group",
  };
  return map[insuredType] || "";
};

export const TravelQuote = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiData, setApiData] = useState({ countries: [], types: [] });
  const [showEconomy, setShowEconomy] = useState({});

  // قراءة آمنة من localStorage
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return getDefaultUserData();

      const parsed = JSON.parse(saved);

      return {
        step1: {
          fromCountry: Array.isArray(parsed.step1?.fromCountry) ? parsed.step1.fromCountry : [],
          toCountry: Array.isArray(parsed.step1?.toCountry) ? parsed.step1.toCountry : [],
          fromCountryId: Array.isArray(parsed.step1?.fromCountryId) ? parsed.step1.fromCountryId : [],
          toCountryId: Array.isArray(parsed.step1?.toCountryId) ? parsed.step1.toCountryId : [],
        },
        step2: {
          startDate: parsed.step2?.startDate || "",
          endDate: parsed.step2?.endDate || "",
        },
        step3: {
          insuredType: parsed.step3?.insuredType || "",
          insuredTypeId: parsed.step3?.insuredTypeId || "",
          personCount: parsed.step3?.personCount || "",
        },
        step4: {
          persons: Array.isArray(parsed.step4?.persons)
            ? parsed.step4.persons.map(p => ({
                dateBirth: p.dateBirth || "",
                name: p.name || "",
                identification: p.identification || "",
              }))
            : [{ dateBirth: "", name: "", identification: "" }],
        },
        step5: { selectedQuote: null },
      };
    } catch {
      return getDefaultUserData();
    }
  });

  function getDefaultUserData() {
    return {
      step1: { fromCountry: [], toCountry: [], fromCountryId: [], toCountryId: [] },
      step2: { startDate: "", endDate: "" },
      step3: { insuredType: "", insuredTypeId: "", personCount: "" },
      step4: { persons: [{ dateBirth: "", name: "", identification: "" }] },
      step5: { selectedQuote: null },
    };
  }

  // حفظ تلقائي
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  }, [userData]);

  // جلب API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/user/travelInsurance/getArguments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": i18n.language,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setApiData({ countries: data.countries || [], types: data.types || [] });
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  // استقبال وجهة السفر (to_country)
  useEffect(() => {
    const prefilled = localStorage.getItem("travel_destination_prefill");
    if (prefilled && apiData.countries.length > 0) {
      const country = apiData.countries.find(c => c.id.toString() === prefilled);
      if (country && !userData.step1.toCountryId.includes(country.id.toString())) {
        setUserData(prev => ({
          ...prev,
          step1: {
            ...prev.step1,
            toCountry: [...prev.step1.toCountry, country.name],
            toCountryId: [...prev.step1.toCountryId, country.id.toString()],
          },
        }));
        localStorage.removeItem("travel_destination_prefill");
      }
    }
  }, [apiData.countries, userData.step1.toCountryId]);

  const handleCountryAdd = (field, name) => {
    const country = apiData.countries.find(c => c.name === name);
    const idField = `${field}Id`;
    if (country && !userData.step1[idField].includes(country.id.toString())) {
      setIsInvalid(false);
      setUserData(prev => ({
        ...prev,
        step1: {
          ...prev.step1,
          [field]: [...prev.step1[field], country.name],
          [idField]: [...prev.step1[idField], country.id.toString()],
        },
      }));
    }
  };

  const handleCountryRemove = (field, index) => {
    const idField = `${field}Id`;
    setUserData(prev => ({
      ...prev,
      step1: {
        ...prev.step1,
        [field]: prev.step1[field].filter((_, i) => i !== index),
        [idField]: prev.step1[idField].filter((_, i) => i !== index),
      },
    }));
  };

  const handleInsuredTypeSelection = (name) => {
    const type = apiData.countries.find(t => t.name === name);
    setUserData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        insuredType: name,
        insuredTypeId: type ? type.id.toString() : "",
        personCount: name.includes("Οικογένεια") || name.includes("Family") || name.includes("Group") ? prev.step3.personCount : "",
      },
    }));
  };

  const isStepValid = (step) => {
    const data = userData[`step${step + 1}`];
    switch (step) {
      case 0:
        return data.fromCountry.length > 0 && data.toCountry.length > 0;
      case 1:
        return data.startDate && data.endDate && data.startDate <= data.endDate;
      case 2:
        if (!data.insuredType) return false;
        if (["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(data.insuredType)) {
          const count = parseInt(data.personCount);
          return count >= 1 && count <= 20;
        }
        return true;
      case 3:
        return data.persons.every(p => p.dateBirth && p.name.trim() && p.identification.trim());
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      setIsInvalid(true);
      return;
    }

    if (currentStep === 2) {
      const type = userData.step3.insuredType;
      let count = 1;
      if (type.includes("Ζευγάρι") || type.includes("Couple")) count = 2;
      else if (["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(type)) {
        count = Math.max(1, Math.min(20, parseInt(userData.step3.personCount) || 1));
      }
      const persons = Array(count).fill(null).map((_, i) =>
        userData.step4.persons[i] || { dateBirth: "", name: "", identification: "" }
      );
      setUserData(prev => ({ ...prev, step4: { persons } }));
    }

    if (currentStep === 3) {
      handleSubmit(false);
      return;
    }

    setCurrentStep(prev => prev + 1);
    setIsInvalid(false);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setIsInvalid(false);
  };

  const handleSubmit = async (goToProceed = true) => {
    if (!isStepValid(currentStep)) {
      setIsInvalid(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        from_country: userData.step1.fromCountryId,
        to_country: userData.step1.toCountryId,
        persons: userData.step4.persons.map(p => ({ date_birth: p.dateBirth })),
        start_date: userData.step2.startDate,
        end_date: userData.step2.endDate,
        insured_type: getApiInsuredType(userData.step3.insuredType),
      };

      const res = await fetch(`${API_BASE_URL}/user/travelInsurance/getQuotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch quotes");
      }

      const result = await res.json();
      const stored = { quotes: result.quotes || [], userData, submissionData: payload };
      localStorage.setItem("travelQuoteData", JSON.stringify(stored));
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      const newShow = {};
      (result.quotes || []).forEach((_, i) => {
        newShow[`item${i + 1}`] = false;
      });
      setShowEconomy(newShow);

      if (goToProceed) {
        navigate("/get-a-quote-travel/proceed");
      } else {
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && currentStep === 0) {
    return (
      <Fragment>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Fragment>
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
      <section className="Inter_font border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center my-10">
          <div className="flex items-center gap-3 relative w-full">
            {Array.from({ length: totalSteps - 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-14 vsm:w-20 sm:w-32 md:w-[170px] lg:w-[214px] h-[15px] rounded-[5px]
                  ${i < currentStep ? "bg-orange-400" : "bg-gray-300"}
                  ${i === currentStep ? "ml-[70px] md:ml-16" : ""}`}
              />
            ))}
            <span
              className={`${currentStep < 4 ? "absolute" : ""} transition-all duration-300`}
              style={{ left: `calc(${currentStep * 23.5}%)` }}
            >
              <Icons.QuotePlaneIcon />
            </span>
          </div>
        </div>

        <div className={`${currentStep === 4 ? "my-0" : "my-14"} flex flex-wrap justify-center items-center gap-5 w-full`}>
          {/* === خطوة 1: المغادرة والوصول (كلاهما Multi Select) === */}
          {currentStep === 0 && (
            <Fragment>
              <MultiCountrySelect
                placeholder={t("travel_quote_page.steps.step1.placeholder_departure")}
                options={apiData.countries.map(c => c.name)}
                selectedCountries={userData.step1.fromCountry}
                onAddCountry={(name) => handleCountryAdd("fromCountry", name)}
                onRemoveCountry={(index) => handleCountryRemove("fromCountry", index)}
                isInvalid={isInvalid && userData.step1.fromCountry.length === 0}
              />
              <MultiCountrySelect
                placeholder={t("travel_quote_page.steps.step1.placeholder_arrival")}
                options={apiData.countries.map(c => c.name)}
                selectedCountries={userData.step1.toCountry}
                onAddCountry={(name) => handleCountryAdd("toCountry", name)}
                onRemoveCountry={(index) => handleCountryRemove("toCountry", index)}
                isInvalid={isInvalid && userData.step1.toCountry.length === 0}
              />
            </Fragment>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col justify-center items-center gap-10">
              <Icons.QuoteDurationIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("travel_quote_page.steps.step2.title")}
              </h1>
              <div className="flex flex-wrap justify-center gap-5">
                <TravelInput
                  type="date"
                  placeholder={t("travel_quote_page.steps.step2.placeholder_start_date")}
                  value={userData.step2.startDate}
                  onChange={(e) => setUserData(prev => ({ ...prev, step2: { ...prev.step2, startDate: e.target.value } }))}
                  isInvalid={isInvalid && !userData.step2.startDate}
                  min={new Date().toISOString().split("T")[0]}
                />
                <TravelInput
                  type="date"
                  placeholder={t("travel_quote_page.steps.step2.placeholder_end_date")}
                  value={userData.step2.endDate}
                  onChange={(e) => setUserData(prev => ({ ...prev, step2: { ...prev.step2, endDate: e.target.value } }))}
                  isInvalid={isInvalid && !userData.step2.endDate}
                  min={userData.step2.startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col justify-center items-center gap-10">
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("travel_quote_page.steps.step3.title")}
              </h1>
              <TravelSelect
                placeholder={t("travel_quote_page.steps.step3.placeholder_preference")}
                value={userData.step3.insuredType}
                onChange={(e) => handleInsuredTypeSelection(e.target.value)}
                isInvalid={isInvalid && !userData.step3.insuredType}
                options={apiData.types.map(t => t.name)}
              />
              {["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(userData.step3.insuredType) && (
                <div className="flex flex-col items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {t("travel_quote_page.steps.step3.person_count") || "Number of Persons"}
                  </h2>
                  <TravelInput
                    type="number"
                    placeholder="1"
                    value={userData.step3.personCount}
                    onChange={(e) => setUserData(prev => ({ ...prev, step3: { ...prev.step3, personCount: e.target.value } }))}
                    isInvalid={isInvalid && !userData.step3.personCount}
                    min="1"
                    max="20"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col justify-center items-center gap-10 w-full">
              <Icons.QuoteBirthIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("travel_quote_page.steps.step4.title")}
              </h1>
              <div className={`grid gap-6 w-full max-w-2xl ${userData.step4.persons.length === 1 ? "grid-cols-1" : "md:grid-cols-2"}`}>
                {userData.step4.persons.map((person, i) => {
                  const showLabel = !["Ένα Άτομο", "Individual"].includes(userData.step3.insuredType);
                  return (
                    <div key={i} className="flex flex-col gap-4">
                      {showLabel && (
                        <h3 className="text-lg font-semibold">
                          {t("common.person")} {i + 1}
                        </h3>
                      )}
                      <TravelInput
                        type="date"
                        placeholder={t("common.date_of_birth")}
                        value={person.dateBirth}
                        onChange={(e) => {
                          const newPersons = [...userData.step4.persons];
                          newPersons[i].dateBirth = e.target.value;
                          setUserData(prev => ({ ...prev, step4: { persons: newPersons } }));
                        }}
                        isInvalid={isInvalid && !person.dateBirth}
                        max={new Date().toISOString().split("T")[0]}
                        fullWidth
                      />
                      <TravelInput
                        type="text"
                        placeholder={t("common.full_name")}
                        value={person.name}
                        onChange={(e) => {
                          const newPersons = [...userData.step4.persons];
                          newPersons[i].name = e.target.value;
                          setUserData(prev => ({ ...prev, step4: { persons: newPersons } }));
                        }}
                        isInvalid={isInvalid && !person.name}
                        fullWidth
                      />
                      <TravelInput
                        type="text"
                        placeholder={t("common.identification")}
                        value={person.identification}
                        onChange={(e) => {
                          const newPersons = [...userData.step4.persons];
                          newPersons[i].identification = e.target.value;
                          setUserData(prev => ({ ...prev, step4: { persons: newPersons } }));
                        }}
                        isInvalid={isInvalid && !person.identification}
                        fullWidth
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <section className="w-full max-w-3xl">
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold mb-6">
                {t("travel_quote_page.steps.step5.title")}
              </h1>
              <div className="bg-[#FDE5DE] rounded-[15px] p-4">
                {(() => {
                  try {
                    const stored = JSON.parse(localStorage.getItem("travelQuoteData") || "{}");
                    const quotes = Array.isArray(stored.quotes) ? stored.quotes : [];
                    if (!quotes.length) {
                      return <p className="text-center py-8 text-gray-600">{t("common.no_quotes")}</p>;
                    }
                    return quotes.map((quote, i) => (
                      <Economy
                        key={quote.id || i}
                        id={`item${i + 1}`}
                        show={showEconomy[`item${i + 1}`] || false}
                        setShow={setShowEconomy}
                        background={i % 2 === 0 ? "#FDE5DE" : "white"}
                        quote={quote}
                        index={i}
                      />
                    ));
                  } catch {
                    return <p className="text-center py-8 text-red-600">فشل تحميل العروض</p>;
                  }
                })()}
              </div>
            </section>
          )}
        </div>

        {currentStep < 4 && (
          <div className="flex justify-center items-center gap-3 vsm:gap-10 my-5">
            <ActionButton
              text={t("travel_quote_page.buttons.previous")}
              iconPosition="left"
              onClick={handlePrevious}
              isDisabled={currentStep === 0}
            />
            <ActionButton
              text={t("travel_quote_page.buttons.next")}
              iconPosition="right"
              onClick={handleNext}
              isNext
            />
          </div>
        )}
      </section>
    </main>
  );
};

// مكونات
const TravelInput = ({ placeholder, value, onChange, isInvalid, type = "text", min, max, fullWidth = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange}
    min={min}
    max={max}
    className={`w-full ${fullWidth ? "max-w-none" : "max-w-80 vsm:max-w-96 sm:w-[400px]"} h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-medium focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  />
);

const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
  <select
    value={value || ""}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  >
    <option value="" disabled hidden>{placeholder}</option>
    {options.map((opt, i) => (
      <option key={i} value={opt}>{opt}</option>
    ))}
  </select>
);

const MultiCountrySelect = ({ placeholder, options, selectedCountries = [], onAddCountry, onRemoveCountry, isInvalid }) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const safeSelected = Array.isArray(selectedCountries) ? selectedCountries : [];
  const availableOptions = options.filter(
    opt => !safeSelected.includes(opt) && opt.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAdd = (name) => {
    onAddCountry(name);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
      <div
        className={`flex flex-wrap items-center gap-2 w-full min-h-[75px] px-4 py-2 border rounded-[10px] cursor-pointer
          ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
          ${safeSelected.length > 0 || filter ? "border-black" : "border-[#C3C3C3]"}`}
        onClick={() => setIsOpen(true)}
      >
        {safeSelected.map((country, i) => (
          <span key={i} className="flex items-center bg-gray-200 text-black rounded-full px-3 py-1 text-sm font-medium">
            {country}
            <button
              type="button"
              className="ml-2 text-gray-600 hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCountry(i);
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={safeSelected.length === 0 ? placeholder : ""}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[100px] h-[58px] bg-transparent border-none outline-none text-black font-medium"
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>
      {isOpen && availableOptions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-[10px] shadow-lg mt-1">
          {availableOptions.map((country, i) => (
            <li
              key={i}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-black"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAdd(country);
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
      ${isNext ? "sm:pl-16" : "sm:pr-14"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
      border rounded-[27.5px] shadow-md transition-all
      ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-black"}`}
  >
    {iconPosition === "left" && (
      <span className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform -rotate-90 group-hover:-rotate-[135deg]
        ${isDisabled ? "bg-gray-300" : "bg-black"}`}>
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

// PropTypes
TravelInput.propTypes = { placeholder: PropTypes.string, value: PropTypes.string, onChange: PropTypes.func.isRequired, isInvalid: PropTypes.bool, type: PropTypes.string, min: PropTypes.string, max: PropTypes.string, fullWidth: PropTypes.bool };
TravelSelect.propTypes = { placeholder: PropTypes.string, value: PropTypes.string, onChange: PropTypes.func.isRequired, options: PropTypes.array.isRequired, isInvalid: PropTypes.bool };
MultiCountrySelect.propTypes = { placeholder: PropTypes.string, options: PropTypes.array.isRequired, selectedCountries: PropTypes.array, onAddCountry: PropTypes.func.isRequired, onRemoveCountry: PropTypes.func.isRequired, isInvalid: PropTypes.bool };
ActionButton.propTypes = { text: PropTypes.string.isRequired, iconPosition: PropTypes.oneOf(["left", "right"]).isRequired, onClick: PropTypes.func.isRequired, isDisabled: PropTypes.bool, isNext: PropTypes.bool };