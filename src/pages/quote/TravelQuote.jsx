import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { QuoteHeader, Economy, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { toast, Toaster } from "react-hot-toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const [apiData, setApiData] = useState({ countries: [], types: [] });
  const [showEconomy, setShowEconomy] = useState({});
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return getDefaultUserData();
      return JSON.parse(saved);
    } catch {
      return getDefaultUserData();
    }
  });

  function getDefaultUserData() {
    return {
      step1: { fromCountry: "", toCountry: [], fromCountryId: "", toCountryId: [] },
      step2: { startDate: "", endDate: "" },
      step3: { insuredType: "", insuredTypeId: "", personCount: "" },
      step4: { persons: [{ dateBirth: "", name: "", identification: "" }] },
      step5: { selectedQuote: null },
    };
  }

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
        toast.error(t("errors.load_failed"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [i18n.language, t]);

useEffect(() => {
  const renewDataStr = localStorage.getItem("renewContractData");
  if (renewDataStr && apiData.countries.length > 0 && apiData.types.length > 0) {
    try {
      const { contractData: renewData } = JSON.parse(renewDataStr);

      // حساب تاريخ البداية الجديد تلقائيًا
      let newStartDate = renewData.start_date || "";
      if (renewData.end_date) {
        const end = new Date(renewData.end_date);
        end.setDate(end.getDate() + 1);
        newStartDate = end.toISOString().split("T")[0];
      }

      const fromCountryObj = apiData.countries.find(c =>
        c.id.toString() === renewData.from_country_id?.toString() ||
        c.name === renewData.from_country
      );

      const toCountryIds = Array.isArray(renewData.to_country_ids)
        ? renewData.to_country_ids.map(id => id.toString())
        : [];
      const toCountries = apiData.countries
        .filter(c => toCountryIds.includes(c.id.toString()))
        .map(c => c.name);

      const insuredTypeObj = apiData.types.find(t =>
        t.id.toString() === renewData.insured_type_id?.toString() ||
        t.name === renewData.insured_type_name
      );

      const persons = Array.isArray(renewData.persons)
        ? renewData.persons.map(p => ({
            dateBirth: p.date_birth || p.dateBirth || "",
            name: p.full_name || p.name || "",
            identification: p.identification || p.id_number || ""
          }))
        : [{ dateBirth: "", name: "", identification: "" }];

      setUserData(prev => ({
        ...prev,
        step1: {
          fromCountry: fromCountryObj?.name || "",
          fromCountryId: fromCountryObj?.id?.toString() || "",
          toCountry: toCountries,
          toCountryId: toCountryIds,
        },
        step2: { 
          startDate: newStartDate,
          endDate: renewData.end_date || "" 
        },
        step3: {
          insuredType: insuredTypeObj?.name || renewData.insured_type_name || "",
          insuredTypeId: insuredTypeObj?.id?.toString() || "",
          personCount: renewData.person_count || ""
        },
        step4: { persons }
      }));

      localStorage.removeItem("renewContractData");
    } catch (err) {
      console.error("Failed to prefill renew data:", err);
    }
  }
}, [apiData.countries, apiData.types]);
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

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 0) {
      if (!userData.step1.fromCountry) {
        newErrors.fromCountry = t("validation.select_departure");
        isValid = false;
      }
      if (userData.step1.toCountry.length === 0) {
        newErrors.toCountry = t("validation.select_destination");
        isValid = false;
      }
    }

    if (step === 1) {
      const today = new Date().toISOString().split("T")[0];
      if (!userData.step2.startDate) {
        newErrors.startDate = t("validation.enter_start_date");
        isValid = false;
      } else if (userData.step2.startDate < today) {
        newErrors.startDate = t("validation.start_date_future");
        isValid = false;
      }

      if (!userData.step2.endDate) {
        newErrors.endDate = t("validation.enter_end_date");
        isValid = false;
      } else if (userData.step2.endDate < userData.step2.startDate) {
        newErrors.endDate = t("validation.end_before_start");
        isValid = false;
      } else if (userData.step2.endDate < today) {
        newErrors.endDate = t("validation.end_date_future");
        isValid = false;
      }
    }

    if (step === 2) {
      if (!userData.step3.insuredType) {
        newErrors.insuredType = t("validation.select_insured_type");
        isValid = false;
      }

      const isFamilyOrGroup = ["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(userData.step3.insuredType);
      if (isFamilyOrGroup) {
        const count = parseInt(userData.step3.personCount);
        if (!count || isNaN(count) || count < 1 || count > 20) {
          newErrors.personCount = t("validation.person_count_range");
          isValid = false;
        }
      }
    }

    if (step === 3) {
      const today = new Date();
      const minBirthDate = new Date();
      minBirthDate.setFullYear(today.getFullYear() - 100);

      userData.step4.persons.forEach((p, i) => {
        const birth = p.dateBirth ? new Date(p.dateBirth) : null;

        if (!p.dateBirth) {
          newErrors[`person_${i}_dateBirth`] = t("validation.enter_date_of_birth");
          isValid = false;
        } else if (birth >= today) {
          newErrors[`person_${i}_dateBirth`] = t("validation.birth_date_future");
          isValid = false;
        } else if (birth < minBirthDate) {
          newErrors[`person_${i}_dateBirth`] = t("validation.birth_date_too_old");
          isValid = false;
        }

        if (!p.name.trim()) {
          newErrors[`person_${i}_name`] = t("validation.enter_full_name");
          isValid = false;
        } else if (p.name.trim().length < 2) {
          newErrors[`person_${i}_name`] = t("validation.name_too_short");
          isValid = false;
        }

        if (!p.identification.trim()) {
          newErrors[`person_${i}_id`] = t("validation.enter_identification");
          isValid = false;
        } else if (!/^[A-Za-z0-9]{3,20}$/.test(p.identification.trim())) {
          newErrors[`person_${i}_id`] = t("validation.id_invalid_format");
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFromCountrySelect = (name) => {
    const country = apiData.countries.find(c => c.name === name);
    if (country) {
      setErrors(prev => ({ ...prev, fromCountry: "" }));
      setUserData(prev => ({
        ...prev,
        step1: {
          ...prev.step1,
          fromCountry: country.name,
          fromCountryId: country.id.toString(),
        },
      }));
    }
  };

  const handleToCountryAdd = (name) => {
    const country = apiData.countries.find(c => c.name === name);
    if (country && !userData.step1.toCountryId.includes(country.id.toString())) {
      setErrors(prev => ({ ...prev, toCountry: "" }));
      setUserData(prev => ({
        ...prev,
        step1: {
          ...prev.step1,
          toCountry: [...prev.step1.toCountry, country.name],
          toCountryId: [...prev.step1.toCountryId, country.id.toString()],
        },
      }));
    }
  };

  const handleToCountryRemove = (index) => {
    setUserData(prev => ({
      ...prev,
      step1: {
        ...prev.step1,
        toCountry: prev.step1.toCountry.filter((_, i) => i !== index),
        toCountryId: prev.step1.toCountryId.filter((_, i) => i !== index),
      },
    }));
  };

  const handleInsuredTypeSelection = (name) => {
    const type = apiData.types.find(t => t.name === name);
    setErrors(prev => ({ ...prev, insuredType: "", personCount: "" }));
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

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

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
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (goToProceed = true) => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
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

      if (res.status === 400) {
        const err = await res.json();
        toast.error(err.error || t("errors.invalid_data"));
        setIsLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch quotes");

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
      toast.error(err.message || t("errors.submit_failed"));
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

  return (
    <main>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#fef2f2",
            color: "#dc2626",
            fontWeight: "500",
            border: "1px solid #fecaca",
            borderRadius: "8px",
          },
        }}
      />
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
          {currentStep === 0 && (
            <Fragment>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <SearchableSelect
                  placeholder={t("travel_quote_page.steps.step1.placeholder_departure")}
                  options={apiData.countries.map(c => c.name)}
                  value={userData.step1.fromCountry}
                  onChange={handleFromCountrySelect}
                />
                {errors.fromCountry && <p className="text-red-600 text-sm mt-1 text-center">{errors.fromCountry}</p>}
              </div>

              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <MultiCountrySelect
                  placeholder={t("travel_quote_page.steps.step1.placeholder_arrival")}
                  options={apiData.countries.map(c => c.name)}
                  selectedCountries={userData.step1.toCountry}
                  onAddCountry={handleToCountryAdd}
                  onRemoveCountry={handleToCountryRemove}
                />
                {errors.toCountry && <p className="text-red-600 text-sm mt-1 text-center">{errors.toCountry}</p>}
              </div>
            </Fragment>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col justify-center items-center gap-10">
              <Icons.QuoteDurationIcon />
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("travel_quote_page.steps.step2.title")}
              </h1>
              <div className="flex flex-wrap justify-center gap-5">
                <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                  <TravelInput
                    type="date"
                    placeholder={t("travel_quote_page.steps.step2.placeholder_start_date")}
                    value={userData.step2.startDate}
                    onChange={(e) => setUserData(prev => ({ ...prev, step2: { ...prev.step2, startDate: e.target.value } }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.startDate && <p className="text-red-600 text-sm mt-1 text-center">{errors.startDate}</p>}
                </div>
                <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                  <TravelInput
                    type="date"
                    placeholder={t("travel_quote_page.steps.step2.placeholder_end_date")}
                    value={userData.step2.endDate}
                    onChange={(e) => setUserData(prev => ({ ...prev, step2: { ...prev.step2, endDate: e.target.value } }))}
                    min={userData.step2.startDate || new Date().toISOString().split("T")[0]}
                  />
                  {errors.endDate && <p className="text-red-600 text-sm mt-1 text-center">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col justify-center items-center gap-10">
              <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                {t("travel_quote_page.steps.step3.title")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelSelect
                  placeholder={t("travel_quote_page.steps.step3.placeholder_preference")}
                  value={userData.step3.insuredType}
                  onChange={(e) => handleInsuredTypeSelection(e.target.value)}
                  options={apiData.types.map(t => t.name)}
                />
                {errors.insuredType && <p className="text-red-600 text-sm mt-1 text-center">{errors.insuredType}</p>}
              </div>
              {["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(userData.step3.insuredType) && (
                <div className="flex flex-col items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {t("travel_quote_page.steps.step3.person_count") || "Number of Persons"}
                  </h2>
                  <div className="w-full max-w-80 vsm:max-w-96 sm:w-[200px]">
                    <TravelInput
                      type="number"
                      placeholder="1"
                      value={userData.step3.personCount}
                      onChange={(e) => setUserData(prev => ({ ...prev, step3: { ...prev.step3, personCount: e.target.value } }))}
                      min="1"
                      max="20"
                    />
                    {errors.personCount && <p className="text-red-600 text-sm mt-1 text-center">{errors.personCount}</p>}
                  </div>
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
                        <h3 className="text-lg font-semibold text-center">
                          {t("common.person")} {i + 1}
                        </h3>
                      )}
                      <div>
                        <TravelInput
                          type="date"
                          placeholder={t("common.date_of_birth")}
                          value={person.dateBirth}
                          onChange={(e) => {
                            const newPersons = [...userData.step4.persons];
                            newPersons[i].dateBirth = e.target.value;
                            setUserData(prev => ({ ...prev, step4: { persons: newPersons } }));
                          }}
                          max={new Date().toISOString().split("T")[0]}
                          fullWidth
                        />
                        {errors[`person_${i}_dateBirth`] && <p className="text-red-600 text-sm mt-1 text-center">{errors[`person_${i}_dateBirth`]}</p>}
                      </div>
                      <div>
                        <TravelInput
                          type="text"
                          placeholder={t("common.full_name")}
                          value={person.name}
                          onChange={(e) => {
                            const newPersons = [...userData.step4.persons];
                            newPersons[i].name = e.target.value;
                            setUserData(prev => ({ ...prev, step4: { persons: newPersons } }));
                          }}
                          fullWidth
                        />
                        {errors[`person_${i}_name`] && <p className="text-red-600 text-sm mt-1 text-center">{errors[`person_${i}_name`]}</p>}
                      </div>
                      <div>
                        <TravelInput
                          type="text"
                          placeholder={t("common.identification")}
                          value={person.identification}
                          onChange={(e) => {
                            const newPersons = [...userData.step4.persons];
                            newPersons[i].identification = e.target.value;
                            setUserData(prev => ({ ...prev, step4: { persons: newPersons } }));
                          }}
                          fullWidth
                        />
                        {errors[`person_${i}_id`] && <p className="text-red-600 text-sm mt-1 text-center">{errors[`person_${i}_id`]}</p>}
                      </div>
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

const TravelInput = ({ placeholder, value, onChange, type = "text", min, max, fullWidth = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange}
    min={min}
    max={max}
    className={`w-full ${fullWidth ? "max-w-none" : "max-w-80 vsm:max-w-96 sm:w-[400px]"} h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-medium focus:outline-none
      border-[#C3C3C3] ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  />
);

const TravelSelect = ({ placeholder, value, onChange, options }) => (
  <select
    value={value || ""}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      border-[#C3C3C3] ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  >
    <option value="" disabled hidden>{placeholder}</option>
    {options.map((opt, i) => (
      <option key={i} value={opt}>{opt}</option>
    ))}
  </select>
);

const SearchableSelect = ({ placeholder, options, value, onChange }) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const displayedValue = value || filter;

  const availableOptions = options.filter(
    (opt) => opt.toLowerCase().includes(filter.toLowerCase()) && opt !== value
  );

  const handleSelect = (name) => {
    onChange(name);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
      <input
        type="text"
        placeholder={placeholder}
        value={displayedValue}
        onChange={(e) => {
          setFilter(e.target.value);
          if (value) onChange("");
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={`w-full h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
          border-[#C3C3C3] ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
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

const MultiCountrySelect = ({ placeholder, options, selectedCountries = [], onAddCountry, onRemoveCountry }) => {
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
          border-[#C3C3C3] ${safeSelected.length > 0 || filter ? "border-black" : "border-[#C3C3C3]"}`}
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

TravelInput.propTypes = { placeholder: PropTypes.string, value: PropTypes.string, onChange: PropTypes.func.isRequired, type: PropTypes.string, min: PropTypes.string, max: PropTypes.string, fullWidth: PropTypes.bool };
TravelSelect.propTypes = { placeholder: PropTypes.string, value: PropTypes.string, onChange: PropTypes.func.isRequired, options: PropTypes.array.isRequired };
SearchableSelect.propTypes = { placeholder: PropTypes.string, options: PropTypes.array.isRequired, value: PropTypes.string, onChange: PropTypes.func.isRequired };
MultiCountrySelect.propTypes = { placeholder: PropTypes.string, options: PropTypes.array.isRequired, selectedCountries: PropTypes.array, onAddCountry: PropTypes.func.isRequired, onRemoveCountry: PropTypes.func.isRequired };
ActionButton.propTypes = { text: PropTypes.string.isRequired, iconPosition: PropTypes.oneOf(["left", "right"]).isRequired, onClick: PropTypes.func.isRequired, isDisabled: PropTypes.bool, isNext: PropTypes.bool };