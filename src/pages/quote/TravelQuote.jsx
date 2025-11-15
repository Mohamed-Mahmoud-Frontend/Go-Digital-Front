import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner, Economy } from "@/components";
import * as Icons from "@/utils/icons.util";
import { toast, Toaster } from "react-hot-toast";
import api from "@/api/axios";

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
  const [quote, setQuote] = useState([]);
  const [showEconomy, setShowEconomy] = useState({});
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiData, setApiData] = useState({ countries: [], types: [] });
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : getDefaultUserData();
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
      console.error("Failed to save data:", err);
    }
  }, [userData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/travelInsurance/getArguments");
        setApiData({
          countries: response.data.countries || [],
          types: response.data.types || [],
        });
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [i18n.language, t]);

  useEffect(() => {
    if (quote.length > 0) {
      const newShow = {};
      quote.forEach((_, i) => {
        newShow[`item${i + 1}`] = false;
      });
      setShowEconomy(newShow);
    }
  }, [quote]);

  useEffect(() => {
    const renewDataStr = localStorage.getItem("renewContractData");
    if (renewDataStr && apiData.countries.length > 0 && apiData.types.length > 0) {
      try {
        const { contractData: renewData } = JSON.parse(renewDataStr);

        const fromCountryObj = apiData.countries.find(
          (c) => c.id.toString() === renewData.from_country
        );

        const toCountryObj = apiData.countries.find(
          (c) => c.id.toString() === renewData.to_country
        );

        const insuredTypeObj = apiData.types.find(
          (t) => t.name.toLowerCase() === renewData.insured_type.toLowerCase()
        );

        const persons = Array.isArray(renewData.persons) && renewData.persons.length > 0
          ? [{
              dateBirth: renewData.persons[0].date_birth || "",
              name: renewData.persons[0].fullName || "",
              identification: renewData.persons[0].identification || "",
            }]
          : [{ dateBirth: "", name: "", identification: "" }];

        const planDuration = parseInt(renewData.plan_duration) || 1;
        const today = new Date();
        const startDate = today.toISOString().split("T")[0];
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + planDuration - 1);
        const formattedEndDate = endDate.toISOString().split("T")[0];

        setUserData((prev) => ({
          ...prev,
          step1: {
            fromCountry: fromCountryObj?.name || "",
            fromCountryId: fromCountryObj?.id?.toString() || "",
            toCountry: toCountryObj ? [toCountryObj.name] : [],
            toCountryId: toCountryObj ? [toCountryObj.id.toString()] : [],
          },
          step2: { startDate, endDate: formattedEndDate },
          step3: {
            insuredType: insuredTypeObj?.name || renewData.insured_type || "Individual",
            insuredTypeId: insuredTypeObj?.id?.toString() || "",
            personCount: "",
          },
          step4: { persons },
        }));

        localStorage.removeItem("renewContractData");
      } catch (err) {
        console.error("Failed to populate renewal data:", err);
      }
    }
  }, [apiData.countries, apiData.types]);

  useEffect(() => {
    const prefilled = localStorage.getItem("travel_destination_prefill");
    if (prefilled && apiData.countries.length > 0) {
      const country = apiData.countries.find((c) => c.id.toString() === prefilled);
      if (country && !userData.step1.toCountryId.includes(country.id.toString())) {
        setUserData((prev) => ({
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
        newErrors.fromCountry = "Please select departure country";
        isValid = false;
      }
      if (userData.step1.toCountry.length === 0) {
        newErrors.toCountry = "Please select at least one destination";
        isValid = false;
      }
    }

    if (step === 1) {
      const today = new Date().toISOString().split("T")[0];
      if (!userData.step2.startDate) {
        newErrors.startDate = "Please enter start date";
        isValid = false;
      } else if (userData.step2.startDate < today) {
        newErrors.startDate = "Start date must be today or later";
        isValid = false;
      }

      if (!userData.step2.endDate) {
        newErrors.endDate = "Please enter end date";
        isValid = false;
      } else if (userData.step2.endDate < userData.step2.startDate) {
        newErrors.endDate = "End date cannot be before start date";
        isValid = false;
      } else if (userData.step2.endDate < today) {
        newErrors.endDate = "End date must be today or later";
        isValid = false;
      }
    }

    if (step === 2) {
      if (!userData.step3.insuredType) {
        newErrors.insuredType = "Please select insured type";
        isValid = false;
      }

      const isFamilyOrGroup = ["Family", "Group"].includes(userData.step3.insuredType);
      if (isFamilyOrGroup) {
        const count = parseInt(userData.step3.personCount);
        if (!count || isNaN(count) || count < 1 || count > 20) {
          newErrors.personCount = "Number of persons must be between 1 and 20";
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
          newErrors[`person_${i}_dateBirth`] = "Please enter date of birth";
          isValid = false;
        } else if (birth >= today) {
          newErrors[`person_${i}_dateBirth`] = "Birth date cannot be in the future";
          isValid = false;
        } else if (birth < minBirthDate) {
          newErrors[`person_${i}_dateBirth`] = "Birth date is too old";
          isValid = false;
        }

        if (!p.name.trim()) {
          newErrors[`person_${i}_name`] = "Please enter full name";
          isValid = false;
        } else if (p.name.trim().length < 2) {
          newErrors[`person_${i}_name`] = "Name is too short";
          isValid = false;
        }

        if (!p.identification.trim()) {
          newErrors[`person_${i}_id`] = "Please enter identification";
          isValid = false;
        } else if (!/^[A-Za-z0-9]{3,20}$/.test(p.identification.trim())) {
          newErrors[`person_${i}_id`] = "Identification must be 3-20 alphanumeric characters";
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFromCountrySelect = (name) => {
    const country = apiData.countries.find((c) => c.name === name);
    if (country) {
      setErrors((prev) => ({ ...prev, fromCountry: "" }));
      setUserData((prev) => ({
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
    const country = apiData.countries.find((c) => c.name === name);
    if (country && !userData.step1.toCountryId.includes(country.id.toString())) {
      setErrors((prev) => ({ ...prev, toCountry: "" }));
      setUserData((prev) => ({
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
    setUserData((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        toCountry: prev.step1.toCountry.filter((_, i) => i !== index),
        toCountryId: prev.step1.toCountryId.filter((_, i) => i !== index),
      },
    }));
  };

  const handleInsuredTypeSelection = (name) => {
    const type = apiData.types.find((t) => t.name === name);
    setErrors((prev) => ({ ...prev, insuredType: "", personCount: "" }));
    setUserData((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        insuredType: name,
        insuredTypeId: type ? type.id.toString() : "",
        personCount: name.includes("Family") || name.includes("Group") ? prev.step3.personCount : "",
      },
    }));
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 2) {
      const type = userData.step3.insuredType;
      let count = 1;
      if (type.includes("Couple")) count = 2;
      else if (["Family", "Group"].includes(type)) {
        count = Math.max(1, Math.min(20, parseInt(userData.step3.personCount) || 1));
      }
      const persons = Array(count)
        .fill(null)
        .map((_, i) => userData.step4.persons[i] || { dateBirth: "", name: "", identification: "" });
      setUserData((prev) => ({ ...prev, step4: { persons } }));
    }

    if (currentStep === 3) {
      handleSubmit(false);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (goToProceed = true) => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const payload = {
        from_country: userData.step1.fromCountryId,
        to_country: userData.step1.toCountryId,
        persons: userData.step4.persons.map((p) => ({ date_birth: p.dateBirth })),
        start_date: userData.step2.startDate,
        end_date: userData.step2.endDate,
        insured_type: getApiInsuredType(userData.step3.insuredType),
      };

      const response = await api.post("/user/travelInsurance/getQuotes", payload);
      const result = response.data;

      setQuote(result.quotes || []);

      const travelQuoteData = { quotes: result.quotes || [], formData: userData };
      localStorage.setItem("travelQuoteData", JSON.stringify(travelQuoteData));

      if (goToProceed) {
        navigate("/get-a-quote-travel/proceed");
      } else {
        setCurrentStep(4);
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit");
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
            <span className={`${currentStep < 4 ? "absolute" : ""} transition-all duration-300`} style={{ left: `calc(${currentStep * 23.5}%)` }}>
              <Icons.QuotePlaneIcon />
            </span>
          </div>
        </div>

        <div className={`${currentStep === 4 ? "my-0" : "my-14"} flex flex-wrap justify-center items-center gap-5 w-full`}>
          {currentStep === 0 && (
            <Fragment>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <SearchableSelect
                  placeholder="From which country?"
                  options={apiData.countries.map((c) => c.name)}
                  value={userData.step1.fromCountry}
                  onChange={handleFromCountrySelect}
                />
                {errors.fromCountry && <p className="text-red-600 text-sm mt-1 text-center">{errors.fromCountry}</p>}
              </div>

              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <MultiCountrySelect
                  placeholder="To which country?"
                  options={apiData.countries.map((c) => c.name)}
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
                When do you want to travel?
              </h1>
              <div className="flex flex-wrap justify-center gap-5">
                <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                  <TravelInput
                    type="date"
                    placeholder="Start Date"
                    value={userData.step2.startDate}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, startDate: e.target.value },
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.startDate && <p className="text-red-600 text-sm mt-1 text-center">{errors.startDate}</p>}
                </div>
                <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                  <TravelInput
                    type="date"
                    placeholder="End Date"
                    value={userData.step2.endDate}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, endDate: e.target.value },
                      }))
                    }
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
                Who is traveling?
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelSelect
                  placeholder="Select type"
                  value={userData.step3.insuredType}
                  onChange={(e) => handleInsuredTypeSelection(e.target.value)}
                  options={apiData.types.map((t) => t.name)}
                />
                {errors.insuredType && <p className="text-red-600 text-sm mt-1 text-center">{errors.insuredType}</p>}
              </div>
              {["Family", "Group"].includes(userData.step3.insuredType) && (
                <div className="flex flex-col items-center gap-3">
                  <h2 className="text-lg font-semibold">Number of persons</h2>
                  <div className="w-full max-w-80 vsm:max-w-96 sm:w-[200px]">
                    <TravelInput
                      type="number"
                      placeholder="1"
                      value={userData.step3.personCount}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          step3: { ...prev.step3, personCount: e.target.value },
                        }))
                      }
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
                Enter traveler details
              </h1>
              <div
                className={`grid gap-6 w-full max-w-2xl ${
                  userData.step4.persons.length === 1 ? "grid-cols-1" : "md:grid-cols-2"
                }`}
              >
                {userData.step4.persons.map((person, i) => {
                  const showLabel = !["Individual"].includes(userData.step3.insuredType);
                  return (
                    <div key={i} className="flex flex-col gap-4">
                      {showLabel && (
                        <h3 className="text-lg font-semibold text-center">
                          Person {i + 1}
                        </h3>
                      )}
                      <div>
                        <TravelInput
                          type="date"
                          placeholder="Date of Birth"
                          value={person.dateBirth}
                          onChange={(e) => {
                            const newPersons = [...userData.step4.persons];
                            newPersons[i].dateBirth = e.target.value;
                            setUserData((prev) => ({ ...prev, step4: { persons: newPersons } }));
                          }}
                          max={new Date().toISOString().split("T")[0]}
                          fullWidth
                        />
                        {errors[`person_${i}_dateBirth`] && (
                          <p className="text-red-600 text-sm mt-1 text-center">
                            {errors[`person_${i}_dateBirth`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <TravelInput
                          type="text"
                          placeholder="Full Name"
                          value={person.name}
                          onChange={(e) => {
                            const newPersons = [...userData.step4.persons];
                            newPersons[i].name = e.target.value;
                            setUserData((prev) => ({ ...prev, step4: { persons: newPersons } }));
                          }}
                          fullWidth
                        />
                        {errors[`person_${i}_name`] && (
                          <p className="text-red-600 text-sm mt-1 text-center">{errors[`person_${i}_name`]}</p>
                        )}
                      </div>
                      <div>
                        <TravelInput
                          type="text"
                          placeholder="ID / Passport"
                          value={person.identification}
                          onChange={(e) => {
                            const newPersons = [...userData.step4.persons];
                            newPersons[i].identification = e.target.value;
                            setUserData((prev) => ({ ...prev, step4: { persons: newPersons } }));
                          }}
                          fullWidth
                        />
                        {errors[`person_${i}_id`] && (
                          <p className="text-red-600 text-sm mt-1 text-center">{errors[`person_${i}_id`]}</p>
                        )}
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
                Choose your plan
              </h1>
              <div className="bg-[#FDE5DE] rounded-[15px] p-4">
                {quote.length === 0 ? (
                  <p className="text-center py-8 text-gray-600">No quotes available</p>
                ) : (
                  quote.map((q, i) => (
                    <Economy
                      key={q.id}
                      id={`item${i + 1}`}
                      show={showEconomy[`item${i + 1}`] || false}
                      setShow={setShowEconomy}
                      onPrevious={handlePrevious}
                      background={i % 2 === 0 ? "#FDE5DE" : "white"}
                      quote={q}
                      index={i}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        {currentStep < 4 && (
          <div className="flex justify-center items-center gap-3 vsm:gap-10 my-5">
            <ActionButton
              text="Previous"
              iconPosition="left"
              onClick={handlePrevious}
              isDisabled={currentStep === 0}
            />
            <ActionButton
              text="Next"
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
    (opt) => !safeSelected.includes(opt) && opt.toLowerCase().includes(filter.toLowerCase())
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
          <span
            key={i}
            className="flex items-center bg-gray-200 text-black rounded-full px-3 py-1 text-sm font-medium"
          >
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
  type: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  fullWidth: PropTypes.bool,
};

TravelSelect.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};

SearchableSelect.propTypes = {
  placeholder: PropTypes.string,
  options: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

MultiCountrySelect.propTypes = {
  placeholder: PropTypes.string,
  options: PropTypes.array.isRequired,
  selectedCountries: PropTypes.array,
  onAddCountry: PropTypes.func.isRequired,
  onRemoveCountry: PropTypes.func.isRequired,
};

ActionButton.propTypes = {
  text: PropTypes.string.isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isNext: PropTypes.bool,
};