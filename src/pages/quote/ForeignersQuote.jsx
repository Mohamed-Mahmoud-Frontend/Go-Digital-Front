import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ForeignersQuote = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const totalSteps = 4;
    const [currentStep, setCurrentStep] = useState(0);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [apiData, setApiData] = useState({
        questions: [],
        countries: [],
        genders: []
    });

    const [userData, setUserData] = useState({
        step1: { firstName: "", lastName: "" },
        step2: { nationality: "", nationalityId: "", identification: "" },
        step3: { birthday: "", gender: "", genderId: "" },
        step4: { insurancePeriod: "" },
    });

    useEffect(() => {
        const fetchApiData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_BASE_URL}/user/immigrationMedical/getArguments`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': i18n.language
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                setApiData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiData();
    }, [i18n.language]);

    useEffect(() => {
        const prefilledId = localStorage.getItem("foreigners_id_prefill");
        if (prefilledId) {
            setUserData(prev => ({
                ...prev,
                step2: {
                    ...prev.step2,
                    identification: prefilledId
                }
            }));
            localStorage.removeItem("foreigners_id_prefill");
        }
    }, []);

    const handleInputChange = (step, field, value) => {
        setIsInvalid(false);

        if (step === "step2" && field === "nationality") {
            const selectedCountry = apiData.countries.find(country => country.name === value);
            setUserData((prevData) => ({
                ...prevData,
                step2: {
                    ...prevData.step2,
                    nationality: value,
                    nationalityId: selectedCountry ? selectedCountry.id : ""
                },
            }));
        } else if (step === "step3" && field === "gender") {
            const selectedGender = apiData.genders.find(gender => gender.name === value);
            setUserData((prevData) => ({
                ...prevData,
                step3: {
                    ...prevData.step3,
                    gender: value,
                    genderId: selectedGender ? selectedGender.id : ""
                },
            }));
        } else {
            setUserData((prevData) => ({
                ...prevData,
                [step]: { ...prevData[step], [field]: value },
            }));
        }
    };

    const isStepValid = (step) => {
        const stepData = userData[`step${step + 1}`];

        if (step === 2) {
            const birthday = stepData.birthday;
            if (birthday) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const birthDate = new Date(birthday);
                if (birthDate > today) {
                    return false;
                }
            }
        }

        return Object.values(stepData).every((value) => {
            if (typeof value === 'object' && value !== null) {
                if (step === 1 && value.nationalityId) {
                    return value.nationalityId.trim() !== "";
                }
                if (step === 2 && value.genderId) {
                    return value.genderId.trim() !== "";
                }
                return Object.values(value).every(v => v && v.toString().trim() !== "");
            }
            return value && value.toString().trim() !== "";
        });
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
        setError('');

        try {
            const submissionData = {
                date_birth: userData.step3.birthday,
                identification: userData.step2.identification,
                first_name: userData.step1.firstName,
                last_name: userData.step1.lastName,
                gender: userData.step3.genderId,
                country_id: userData.step2.nationalityId
            };

            const response = await fetch(`${API_BASE_URL}/user/immigrationMedical/getQuotes`, {
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

            localStorage.setItem('foreignersQuoteData', JSON.stringify({
                userData,
                apiData,
                quotes: result.quotes || []
            }));

            navigate("/get-a-quote-foreigners/proceed");
        } catch (error) {
            console.error('Error submitting quote:', error);
            setError(error.message || 'Failed to get quotes. Please try again.');
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
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-lg font-semibold text-red-600">{error}</div>
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
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-14 vsm:w-20 sm:w-32 md:w-[170px] lg:w-[214px] h-[15px] rounded-[5px]
          ${index < currentStep ? "bg-orange-400" : "bg-gray-300"}
          ${index === currentStep ? "ml-[70px] md:ml-16" : ""}`}
                            ></div>
                        ))}
                        <span
                            className="absolute transition_all"
                            style={{
                                left: `calc(${currentStep * 24}%)`,
                            }}
                        >
                            <Icons.QuotePersonIcon />
                        </span>
                    </div>
                </div>

                <div className="my-10 flex flex-wrap justify-center items-center gap-5">
                    {currentStep === 0 && (
                        <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
                            <Icons.QuoteProfileIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('foreigners_quote_page.steps.step1.title1')}
                            </h1>
                            <TravelInput
                                type="text"
                                placeholder={t('foreigners_quote_page.steps.step1.placeholder_name')}
                                value={userData.step1.firstName}
                                onChange={(e) =>
                                    handleInputChange("step1", "firstName", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step1.firstName}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('foreigners_quote_page.steps.step1.title2')}
                            </h1>
                            <TravelInput
                                type="text"
                                placeholder={t('foreigners_quote_page.steps.step1.placeholder_lastname')}
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
                                {t('foreigners_quote_page.steps.step2.title1')}
                            </h1>
                            <TravelSelect
                                placeholder={t('foreigners_quote_page.steps.step2.placeholder_nationality')}
                                value={userData.step2.nationality}
                                onChange={(e) =>
                                    handleInputChange("step2", "nationality", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step2.nationalityId}
                                options={apiData.countries?.map(country => country.name) || []}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('foreigners_quote_page.steps.step2.title2')}
                            </h1>
                            <TravelInput
                                type="text"
                                placeholder={t('foreigners_quote_page.steps.step2.placeholder_identification')}
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
                                {t('foreigners_quote_page.steps.step3.title1')}
                            </h1>
                            <TravelInput
                                type="date"
                                placeholder={t('foreigners_quote_page.steps.step3.placeholder_birthday')}
                                value={userData.step3.birthday}
                                onChange={(e) =>
                                    handleInputChange("step3", "birthday", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step3.birthday}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('foreigners_quote_page.steps.step3.title2')}
                            </h1>
                            <TravelSelect
                                placeholder={t('foreigners_quote_page.steps.step3.placeholder_gender')}
                                value={userData.step3.gender}
                                onChange={(e) =>
                                    handleInputChange("step3", "gender", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step3.genderId}
                                options={apiData.genders?.map(gender => gender.name) || []}
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="flex flex-col justify-center items-center gap-10">
                            <Icons.QuoteCalenderIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t('foreigners_quote_page.steps.step4.title')}
                            </h1>
                            <TravelInput
                                type="date"
                                placeholder={t('foreigners_quote_page.steps.step4.placeholder_insurance_period')}
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
                        text={t('foreigners_quote_page.buttons.previous')}
                        iconPosition="left"
                        onClick={handlePrevious}
                        isDisabled={currentStep === 0}
                    />

                    {currentStep < totalSteps - 1 ? (
                        <ActionButton
                            text={t('foreigners_quote_page.buttons.next')}
                            iconPosition="right"
                            onClick={handleNext}
                            isNext
                        />
                    ) : (
                        <ActionButton
                            text={isLoading ? "Loading..." : t('foreigners_quote_page.buttons.submit')}
                            iconPosition="right"
                            onClick={handleSubmit}
                            isNext
                            isDisabled={!isStepValid(currentStep) || isLoading}
                        />
                    )}
                </div>

                {error && (
                    <div className="text-red-600 text-center mt-4">
                        {error}
                    </div>
                )}
            </section>
        </main>
    );
};

const TravelInput = ({ placeholder, value, onChange, isInvalid, type = "text", max }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-semibold focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}
      `}
        max={max}
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
        {Array.isArray(options) && options.map((option, idx) => (
            <option key={idx} value={option} className="font-semibold">{option}</option>
        ))}
    </select>
);

const ActionButton = ({ text, iconPosition, onClick, isDisabled, isNext }) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className={`group flex items-center justify-between px-5 sm:px-3 
    ${isNext ? "sm:pl-10" : "sm:pr-10"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
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
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    isInvalid: PropTypes.bool,
    type: PropTypes.string,
    max: PropTypes.string
};

TravelSelect.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    isInvalid: PropTypes.bool
};

ActionButton.propTypes = {
    text: PropTypes.string,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    onClick: PropTypes.func,
    isDisabled: PropTypes.bool,
    isNext: PropTypes.bool
};