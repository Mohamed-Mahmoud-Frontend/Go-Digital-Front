import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
// Components
import { QuoteHeader, Economy, LoadingSpinner } from "@/components";
// Icons
import * as Icons from "@/utils/icons.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getApiInsuredType = (insuredType) => {
    switch (insuredType) {
        case "Ένα Άτομο":
        case "Individual":
            return "individual";
        case "Ζευγάρι":
        case "Couple":
            return "couple";
        case "Οικογένεια":
        case "Family":
            return "family";
        case "Ομάδα (Group)":
        case "Group":
            return "group";
        default:
            return "";
    }
};

export const TravelQuote = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const totalSteps = 5;
    const [currentStep, setCurrentStep] = useState(0);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [apiData, setApiData] = useState({
        countries: [],
        types: []
    });
    const [showEconomy, setShowEconomy] = useState({
        item1: false,
        item2: false,
        item3: false,
        item4: false,
    });
    const [userData, setUserData] = useState({
        step1: {
            fromCountry: "",
            toCountry: "",
            fromCountryId: "",
            toCountryId: ""
        },
        step2: { startDate: "", endDate: "" },
        step3: {
            insuredType: "",
            insuredTypeId: "",
            personCount: ""
        },
        step4: {
            persons: [
                {
                    dateBirth: "",
                    name: "",
                    identification: ""
                }
            ]
        },
        step5: { selectedQuote: null }
    });

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/user/travelInsurance/getArguments`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': i18n.language
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch travel insurance data');
                }

                const data = await response.json();
                setApiData({
                    countries: data.countries || [],
                    types: data.types || []
                });
            } catch (error) {
                console.error('Error fetching travel insurance data:', error);
                setError('Failed to load travel insurance options');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiData();
    }, [i18n.language]);

    useEffect(() => {
        const prefilledId = localStorage.getItem("travel_destination_prefill");

        if (prefilledId && apiData.countries.length > 0) {
            const selectedCountry = apiData.countries.find(c => c.id.toString() === prefilledId);

            if (selectedCountry) {
                setUserData(prev => ({
                    ...prev,
                    step1: {
                        ...prev.step1,
                        toCountry: selectedCountry.name,
                        toCountryId: selectedCountry.id.toString()
                    }
                }));
                localStorage.removeItem("travel_destination_prefill");
            }
        }
    }, [apiData.countries]);

    const handleInputChange = (step, field, value) => {
        setIsInvalid(false);
        setUserData((prevData) => ({
            ...prevData,
            [step]: { ...prevData[step], [field]: value },
        }));
    };

    const handlePersonChange = (index, field, value) => {
        setUserData((prevData) => ({
            ...prevData,
            step4: {
                ...prevData.step4,
                persons: prevData.step4.persons.map((person, i) =>
                    i === index ? { ...person, [field]: value } : person
                )
            }
        }));
    };

    const handleCountrySelection = (step, field, countryName) => {
        const country = apiData.countries.find(c => c.name === countryName);
        setUserData((prevData) => ({
            ...prevData,
            [step]: {
                ...prevData[step],
                [field]: countryName,
                [`${field}Id`]: country ? country.id.toString() : ""
            },
        }));
    };

    const handleInsuredTypeSelection = (typeName) => {
        const type = apiData.types.find(t => t.name === typeName);
        setUserData((prevData) => ({
            ...prevData,
            step3: {
                ...prevData.step3,
                insuredType: typeName,
                insuredTypeId: type ? type.id : ""
            },
        }));
    };

    const isStepValid = (step) => {
        const stepData = userData[`step${step + 1}`];

        switch (step) {
            case 0:
                return stepData.fromCountry && stepData.toCountry;
            case 1:
                return stepData.startDate && stepData.endDate;
            case 2:
                if (!stepData.insuredType) return false;
                if (["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(stepData.insuredType)) {
                    return stepData.personCount && parseInt(stepData.personCount) > 0;
                }
                return true;
            case 3:
                return stepData.persons.every(person =>
                    person.dateBirth && person.name && person.identification
                );
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (isStepValid(currentStep)) {
            if (currentStep === 2) {
                const type = userData.step3.insuredType;
                let personCount = 1;
                if (type === "Ένα Άτομο" || type === "Individual") personCount = 1;
                else if (type === "Ζευγάρι" || type === "Couple") personCount = 2;
                else if (type === "Οικογένεια" || type === "Family" || type === "Ομάδα (Group)" || type === "Group") {
                    personCount = parseInt(userData.step3.personCount) || 1;
                }
                const newPersons = Array(personCount).fill(null).map((_, index) =>
                    userData.step4.persons[index] || {
                        dateBirth: "",
                        name: "",
                        identification: ""
                    }
                );
                setUserData((prevData) => ({
                    ...prevData,
                    step4: { ...prevData.step4, persons: newPersons }
                }));
            }
            if (currentStep === 3) {
                handleSubmit(false);
                return;
            }
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

    const handleSubmit = async (navigateToProceed = true) => {
        if (!isStepValid(currentStep)) {
            setIsInvalid(true);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const submissionData = {
                from_country: userData.step1.fromCountryId,
                to_country: userData.step1.toCountryId,
                persons: userData.step4.persons.map(person => ({
                    date_birth: person.dateBirth
                })),
                start_date: userData.step2.startDate,
                end_date: userData.step2.endDate,
                insured_type: getApiInsuredType(userData.step3.insuredType)
            };
            const response = await fetch(`${API_BASE_URL}/user/travelInsurance/getQuotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify(submissionData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get quotes');
            }
            const result = await response.json();
            const storedData = {
                quotes: result.quotes || [],
                userData: userData,
                submissionData: submissionData
            };
            localStorage.setItem('travelQuoteData', JSON.stringify(storedData));
            const quotesCount = result.quotes?.length || 0;
            const newShowEconomy = {};
            for (let i = 1; i <= Math.max(quotesCount, 4); i++) {
                newShowEconomy[`item${i}`] = false;
            }
            setShowEconomy(newShowEconomy);
            if (navigateToProceed) {
                navigate("/get-a-quote-travel/proceed");
            } else {
                setCurrentStep(4);
            }
        } catch (error) {
            console.error('Error submitting travel quote:', error);
            setError('Failed to get quotes. Please try again.');
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

    if (error) {
        return (
            <main>
                <QuoteHeader />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-lg font-semibold text-red-600">{error}</div>
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
                        {Array.from({ length: totalSteps - 1 }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-14 vsm:w-20 sm:w-32 md:w-[170px] lg:w-[214px] h-[15px] rounded-[5px]
          ${index < currentStep ? "bg-orange-400" : "bg-gray-300"}
          ${index === currentStep ? "ml-[70px] md:ml-16" : ""}`}
                            ></div>
                        ))}
                        <span
                            className={`${currentStep < 4 ? "absolute" : ""} transition_all`}
                            style={{
                                left: `calc(${currentStep * 23.5}%)`,
                            }}
                        >
                            <Icons.QuotePlaneIcon />
                        </span>
                    </div>
                </div>
                <div className={`${currentStep === 4 ? "my-0" : "my-14"} flex flex-wrap justify-center items-center gap-5`}>
                    {currentStep === 0 && (
                        <Fragment>
                            <TravelSelect
                                placeholder={t('travel_quote_page.steps.step1.placeholder_departure')}
                                value={userData.step1.fromCountry}
                                onChange={(e) =>
                                    handleCountrySelection("step1", "fromCountry", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step1.fromCountry}
                                options={apiData.countries.map(country => country.name)}
                            />
                            <TravelSelect
                                placeholder={t('travel_quote_page.steps.step1.placeholder_arrival')}
                                value={userData.step1.toCountry}
                                onChange={(e) =>
                                    handleCountrySelection("step1", "toCountry", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step1.toCountry}
                                options={apiData.countries.map(country => country.name)}
                            />
                        </Fragment>
                    )}
                    {currentStep === 1 && (
                        <div className="flex flex-col justify-center items-center gap-10">
                            <Icons.QuoteDurationIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('travel_quote_page.steps.step2.title')}
                            </h1>
                            <span className="flex flex-wrap justify-center gap-5">
                                <TravelInput
                                    type="date"
                                    placeholder={t('travel_quote_page.steps.step2.placeholder_start_date')}
                                    value={userData.step2.startDate}
                                    onChange={(e) =>
                                        handleInputChange("step2", "startDate", e.target.value)
                                    }
                                    isInvalid={isInvalid && !userData.step2.startDate}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <TravelInput
                                    type="date"
                                    placeholder={t('travel_quote_page.steps.step2.placeholder_end_date')}
                                    value={userData.step2.endDate}
                                    onChange={(e) =>
                                        handleInputChange("step2", "endDate", e.target.value)
                                    }
                                    isInvalid={isInvalid && !userData.step2.endDate}
                                    min={userData.step2.startDate || new Date().toISOString().split('T')[0]}
                                />
                            </span>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="flex flex-col justify-center items-center gap-10">
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('travel_quote_page.steps.step3.title')}
                            </h1>
                            <TravelSelect
                                placeholder={t('travel_quote_page.steps.step3.placeholder_preference')}
                                value={userData.step3.insuredType}
                                onChange={(e) =>
                                    handleInsuredTypeSelection(e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step3.insuredType}
                                options={apiData.types.map(type => type.name)}
                            />
                            {["Οικογένεια", "Family", "Ομάδα (Group)", "Group"].includes(userData.step3.insuredType) && (
                                <div className="flex flex-col justify-center items-center gap-5">
                                    <h2 className="text-xl font-semibold">Number of Persons</h2>
                                    <TravelInput
                                        type="number"
                                        placeholder="Enter number of persons"
                                        value={userData.step3.personCount}
                                        onChange={(e) =>
                                            handleInputChange("step3", "personCount", e.target.value)
                                        }
                                        isInvalid={isInvalid && !userData.step3.personCount}
                                        min="1"
                                        max="20"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="flex flex-col justify-center items-center gap-10">
                            <Icons.QuoteBirthIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('travel_quote_page.steps.step4.title')}
                            </h1>
                            <div className={`grid gap-6 w-full ${userData.step4.persons.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                                {userData.step4.persons.map((person, index) => {
                                    const shouldShowLabel = !["Ένα Άτομο", "Individual"].includes(userData.step3.insuredType);
                                    const personLabel = shouldShowLabel ? `Person ${index + 1}` : "";
                                    return (
                                        <div key={index} className="flex flex-col gap-4">
                                            {shouldShowLabel && (
                                                <h3 className="text-lg font-semibold">{personLabel}</h3>
                                            )}
                                            <TravelInput
                                                type="date"
                                                placeholder="Date of Birth"
                                                value={person.dateBirth}
                                                onChange={(e) =>
                                                    handlePersonChange(index, "dateBirth", e.target.value)
                                                }
                                                isInvalid={isInvalid && !person.dateBirth}
                                                max={new Date().toISOString().split('T')[0]}
                                                fullWidth={true}
                                            />
                                            <TravelInput
                                                type="text"
                                                placeholder="Full Name"
                                                value={person.name}
                                                onChange={(e) =>
                                                    handlePersonChange(index, "name", e.target.value)
                                                }
                                                isInvalid={isInvalid && !person.name}
                                                fullWidth={true}
                                            />
                                            <TravelInput
                                                type="text"
                                                placeholder="Identification Number"
                                                value={person.identification}
                                                onChange={(e) =>
                                                    handlePersonChange(index, "identification", e.target.value)
                                                }
                                                isInvalid={isInvalid && !person.identification}
                                                fullWidth={true}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <section>
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold mb-6 vsm:mb-10">
                                {t('travel_quote_page.steps.step5.title')}
                            </h1>
                            <div className="w-80 tiny:w-[350px] vsm:w-[420px] sm:w-[600px] md:w-[708px] bg-[#FDE5DE] rounded-[15px]">
                                {(() => {
                                    const storedData = JSON.parse(localStorage.getItem('travelQuoteData') || '{}');
                                    const quotes = storedData.quotes || [];

                                    if (quotes.length === 0) {
                                        return (
                                            <div className="p-8 text-center">
                                                <p className="text-lg font-semibold text-gray-600">No quotes available</p>
                                            </div>
                                        );
                                    }

                                    return quotes.map((quote, index) => (
                                        <Economy
                                            key={quote.id || index}
                                            id={`item${index + 1}`}
                                            show={showEconomy[`item${index + 1}`]}
                                            setShow={setShowEconomy}
                                            background={index % 2 === 0 ? "#FDE5DE" : "white"}
                                            quote={quote}
                                            index={index}
                                            A />
                                    ));
                                })()}
                            </div>
                        </section>
                    )}
                </div>

                {currentStep < 4 && (
                    <div className="flex justify-center items-center gap-3 vsm:gap-10 my-5">
                        <ActionButton
                            text={t('travel_quote_page.buttons.previous')}
                            iconPosition="left"
                            onClick={handlePrevious}
                            isDisabled={currentStep === 0}
                            _ />
                        <ActionButton
                            text={t('travel_quote_page.buttons.next')}
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

const TravelInput = ({ placeholder, value, onChange, isInvalid, type = "text", min, max, fullWidth = false }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={`w-full ${fullWidth ? '' : 'max-w-80 vsm:max-w-96 sm:w-[400px]'} h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-medium focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}
      `}
    />
);

const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
    <select
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none 
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
    >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option, idx) => (
            <option key={idx} value={option} className="font-medium">{option}</option>
        ))}
    </select>
);

const ActionButton = ({ text, iconPosition, onClick, isDisabled, isNext }) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className={`group flex items-center justify-between px-5 sm:px-3 
    ${isNext ? "sm:pl-16" : "sm:pr-14"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
    border rounded-[27.5px] shadow-md transition-all
    ${isDisabled ? "text-gray-400" : "text-black"}`}
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
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isInvalid: PropTypes.bool.isRequired,
    type: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    fullWidth: PropTypes.bool
};

TravelSelect.propTypes = {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    isInvalid: PropTypes.bool.isRequired
};

ActionButton.propTypes = {
    text: PropTypes.string.isRequired,
    iconPosition: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    isNext: PropTypes.bool.isRequired
};