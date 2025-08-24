import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
// Components
import { QuoteHeader, LoadingSpinner } from "@/components";
// Icons
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const IntermediariesQuote = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const totalSteps = 4; // Total number of steps
    const [currentStep, setCurrentStep] = useState(0); // Current active step
    const [isInvalid, setIsInvalid] = useState(false); // Track invalid inputs
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiData, setApiData] = useState({
        questions: [],
        categories: [],
        types: []
    });

    const [userData, setUserData] = useState({
        step1: { agentType: "", agentTypeId: "", dateBirthday: "", startDate: "" },
        step2: { firmEstablished: "", type: "", typeId: "" },
        step3: { grossInsured: "", grossInsuredCurrent: "" },
        step4: { questions: [] },
    });

    // Fetch API data on component mount
    useEffect(() => {
        fetchApiData();
    }, []);

    const fetchApiData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/getArguments`, {
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

    // Handle input change for specific fields in each step
    const handleInputChange = (step, field, value) => {
        setIsInvalid(false);

        // Special handling for agent type to store both name and ID
        if (step === "step1" && field === "agentType") {
            const selectedCategory = apiData.categories.find(cat => cat.name === value);
            setUserData((prevData) => ({
                ...prevData,
                step1: {
                    ...prevData.step1,
                    agentType: value,
                    agentTypeId: selectedCategory ? selectedCategory.id : ""
                },
            }));
        } else if (step === "step2" && field === "type") {
            // Special handling for type to store both name and ID
            const selectedType = apiData.types.find(type => type.name === value);
            setUserData((prevData) => ({
                ...prevData,
                step2: {
                    ...prevData.step2,
                    type: value,
                    typeId: selectedType ? selectedType.id : ""
                },
            }));
        } else {
            setUserData((prevData) => ({
                ...prevData,
                [step]: { ...prevData[step], [field]: value },
            }));
        }
    };

    // Handle question answer change
    const handleQuestionAnswerChange = (questionId, answer) => {
        setUserData((prevData) => ({
            ...prevData,
            step4: {
                ...prevData.step4,
                questions: prevData.step4.questions.map(q =>
                    q.id === questionId ? { ...q, answer } : q
                )
            }
        }));
    };

    // Handle question textarea change
    const handleQuestionTextareaChange = (questionId, value) => {
        setUserData((prevData) => ({
            ...prevData,
            step4: {
                ...prevData.step4,
                questions: prevData.step4.questions.map(q =>
                    q.id === questionId ? { ...q, textarea: value } : q
                )
            }
        }));
    };

    // Initialize questions when step 4 is reached
    useEffect(() => {
        if (currentStep === 3 && apiData.questions.length > 0) {
            const initialQuestions = apiData.questions.map(question => ({
                id: question.id,
                answer: "",
                textarea: ""
            }));
            setUserData(prevData => ({
                ...prevData,
                step4: { questions: initialQuestions }
            }));
        }
    }, [currentStep, apiData.questions]);

    // Validate input for the current step
    const isStepValid = (step) => {
        const stepData = userData[`step${step + 1}`];

        if (step === 0) {
            // Step 1: Validate date of birth must be today or in the past
            const dateBirthday = stepData.dateBirthday;
            if (dateBirthday) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day
                const birthDate = new Date(dateBirthday);
                if (birthDate > today) {
                    return false;
                }
            }
        }

        if (step === 1) {
            // Step 2: Validate firm established date must be today or in the past
            const firmEstablished = stepData.firmEstablished;
            if (firmEstablished) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day
                const firmDate = new Date(firmEstablished);
                if (firmDate > today) {
                    return false;
                }
            }
        }

        if (step === 3) {
            // Step 4: Validate questions
            return stepData.questions.every(question => {
                if (!question.answer) return false;

                const apiQuestion = apiData.questions.find(q => q.id === question.id);
                if (!apiQuestion) return true;

                if (question.answer === "yes" && apiQuestion.mustTextareaYes) {
                    return question.textarea?.trim() !== "";
                }
                if (question.answer === "no" && apiQuestion.mustTextareaNo) {
                    return question.textarea?.trim() !== "";
                }
                return true;
            });
        }

        return Object.values(stepData).every((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                // For step1, check agentTypeId instead of agentType
                if (step === 0 && value.agentTypeId) {
                    return value.agentTypeId.trim() !== "";
                }
                // For step2, check typeId instead of type
                if (step === 1 && value.typeId) {
                    return value.typeId.trim() !== "";
                }
                return Object.values(value).every(v => v && v.toString().trim() !== "");
            }
            return value && value.toString().trim() !== "";
        });
    };

    // Proceed to the next step after validation
    const handleNext = () => {
        if (isStepValid(currentStep)) {
            setCurrentStep((prev) => prev + 1);
            setIsInvalid(false);
        } else {
            setIsInvalid(true);
        }
    };

    // Return to the previous step
    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        setIsInvalid(false);
    };

    // Submit the data and get quotes
    const handleSubmit = async () => {
        if (!isStepValid(currentStep)) {
            setIsInvalid(true);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Prepare questions data
            const questionsData = userData.step4.questions.map(question => ({
                id: question.id.toString(),
                answer: question.answer || "no",
                textarea: question.textarea || ""
            }));

            // Prepare submission data
            const submissionData = {
                firm_established: userData.step2.firmEstablished,
                agent_type: userData.step1.agentTypeId,
                type: userData.step2.typeId,
                agent_count: 1, // Always 1 as specified
                gross_insured: parseInt(userData.step3.grossInsured) || 50000,
                gross_insured_current: parseInt(userData.step3.grossInsuredCurrent) || 50000,
                insured_type: "individual", // Default value
                start_date: userData.step1.startDate,
                questions: questionsData,
                dates_of_birthday: [userData.step1.dateBirthday]
            };

            const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/getQuotes`, {
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

            // Store the data in localStorage for the next step
            localStorage.setItem('intermediariesQuoteData', JSON.stringify({
                userData,
                apiData,
                quotes: result.quotes || []
            }));

            // Navigate to the proceed page
        navigate("/get-a-quote-intermediaries/proceed");
        } catch (error) {
            console.error('Error submitting quote:', error);
            setError(error.message || 'Failed to get quotes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if textarea should be shown for a question
    const shouldShowTextarea = (question) => {
        const apiQuestion = apiData.questions.find(q => q.id === question.id);
        if (!apiQuestion) return false;

        return (question.answer === "yes" && apiQuestion.mustTextareaYes) ||
            (question.answer === "no" && apiQuestion.mustTextareaNo);
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
            {/* Header */}
            <QuoteHeader />

            {/* Progress Bar */}
            <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
                <div className="flex flex-col justify-center items-center my-10">
                    <div className="flex items-center gap-3 relative w-full">
                        {/* Progress Bar Steps */}
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-14 vsm:w-20 sm:w-32 md:w-[170px] lg:w-[214px] h-[15px] rounded-[5px]
                    ${index < currentStep ? "bg-orange-400" : "bg-gray-300"}
                    ${index === currentStep ? "ml-[70px] md:ml-16" : ""}`}
                            ></div>
                        ))}
                        {/* Plane Icon with Animation */}
                        <span
                            className="absolute transition_all"
                            style={{
                                left: `calc(${currentStep * 24}%)`, // Adjusts plane's position dynamically based on the current step
                            }}
                        >
                            <Icons.QuotePersonIcon />
                        </span>
                    </div>
                </div>

                {/* Step Forms */}
                <div className="my-10 flex flex-wrap justify-center items-center gap-5">
                    {/* Step 1 */}
                    {currentStep === 0 && (
                        <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
                            <Icons.QuoteProfileIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Agent Type
                            </h1>
                            <TravelSelect
                                placeholder="Select Agent Type"
                                value={userData.step1.agentType}
                                onChange={(e) =>
                                    handleInputChange("step1", "agentType", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step1.agentTypeId}
                                options={apiData.categories.map(cat => cat.name)}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Date of Birth
                            </h1>
                            <TravelInput
                                type="date"
                                placeholder="Select Date of Birth"
                                value={userData.step1.dateBirthday}
                                onChange={(e) =>
                                    handleInputChange("step1", "dateBirthday", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step1.dateBirthday}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Start Date
                            </h1>
                            <TravelInput
                                type="date"
                                placeholder="Select Start Date"
                                value={userData.step1.startDate}
                                onChange={(e) =>
                                    handleInputChange("step1", "startDate", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step1.startDate}
                            />
                        </div>
                    )}

                    {/* Step 2 */}
                    {currentStep === 1 && (
                        <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
                            <Icons.QuoteCardIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Firm Established
                            </h1>
                            <TravelInput
                                type="date"
                                placeholder="Select Firm Established Date"
                                value={userData.step2.firmEstablished}
                                onChange={(e) =>
                                    handleInputChange("step2", "firmEstablished", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step2.firmEstablished}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Type
                            </h1>
                            <TravelSelect
                                placeholder="Select Type"
                                value={userData.step2.type}
                                onChange={(e) =>
                                    handleInputChange("step2", "type", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step2.typeId}
                                options={apiData.types.map(type => type.name)}
                            />
                        </div>
                    )}

                    {/* Step 3 */}
                    {currentStep === 2 && (
                        <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
                            <Icons.QuoteBirthIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Gross Insured
                            </h1>
                            <TravelInput
                                type="number"
                                placeholder="Enter Gross Insured Amount"
                                value={userData.step3.grossInsured}
                                onChange={(e) =>
                                    handleInputChange("step3", "grossInsured", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step3.grossInsured}
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                Gross Insured Current
                            </h1>
                            <TravelInput
                                type="number"
                                placeholder="Enter Gross Insured Current Amount"
                                value={userData.step3.grossInsuredCurrent}
                                onChange={(e) =>
                                    handleInputChange("step3", "grossInsuredCurrent", e.target.value)
                                }
                                isInvalid={isInvalid && !userData.step3.grossInsuredCurrent}
                            />
                        </div>
                    )}

                    {/* Step 4 - Questions */}
                    {currentStep === 3 && (
                        <div className="flex flex-col justify-center items-center gap-5 sm:gap-10 max-w-4xl">


                            {apiData.questions.map((apiQuestion, index) => {
                                const question = userData.step4.questions.find(q => q.id === apiQuestion.id);
                                if (!question) return null;

                                return (
                                    <div key={apiQuestion.id} className="w-full max-w-2xl">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold mb-3">
                                                {index + 1}. <span dangerouslySetInnerHTML={{ __html: apiQuestion.question }} />
                                            </h3>

                                            {/* Answer buttons */}
                                            <div className="flex gap-4 mb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionAnswerChange(apiQuestion.id, "yes")}
                                                    className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none ${question.answer === "yes" ? "bg-secondaryColor text-white" : "bg-gray-200"
                                                        }`}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionAnswerChange(apiQuestion.id, "no")}
                                                    className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none ${question.answer === "no" ? "bg-secondaryColor text-white" : "bg-gray-200"
                                                        }`}
                                                >
                                                    No
                                                </button>
                                            </div>

                                            {/* Conditional textarea */}
                                            {shouldShowTextarea(question) && (
                                                <textarea
                                                    value={question.textarea || ""}
                                                    onChange={(e) => handleQuestionTextareaChange(apiQuestion.id, e.target.value)}
                                                    placeholder="Please provide additional details..."
                                                    required
                                                    className="w-full h-[100px] px-4 py-3 border border-[#C3C3C3] rounded-[10px] outline-none resize-none"
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-3 vsm:gap-10 my-5">
                    {/* Previous Button */}
                    <ActionButton
                        text={t('intermediaries_quote_page.buttons.previous')}
                        iconPosition="left"
                        onClick={handlePrevious}
                        isDisabled={currentStep === 0}
                    />

                    {/* Next or Submit Button */}
                    {currentStep < totalSteps - 1 ? (
                        <ActionButton
                            text={t('intermediaries_quote_page.buttons.next')}
                            iconPosition="right"
                            onClick={handleNext}
                            isNext
                        />
                    ) : (
                        <ActionButton
                            text={isLoading ? "Loading..." : t('intermediaries_quote_page.buttons.submit')}
                            iconPosition="right"
                            onClick={handleSubmit}
                            isNext
                            isDisabled={!isStepValid(currentStep) || isLoading}
                        />
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-600 text-center mt-4">
                        {error}
                    </div>
                )}
            </section>
        </main>
    );
};

// Reusable Input Component with Dynamic Border
const TravelInput = ({ placeholder, value, onChange, isInvalid, type = "text", max }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-semibold focus:outline-none
            ${isInvalid ? "border-secondaryColor border-2  animate-pulse" : "border-[#C3C3C3]"}
            ${value ? "text-black border-black" : "text-[#C3C3C3]"}
            `}
        max={max}
    />
);

// Reusable Select Component for Dropdown
const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
    <select
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-semibold focus:outline-none 
            ${isInvalid ? "border-secondaryColor border-2  animate-pulse" : "border-[#C3C3C3]"}
            ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
    >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option, idx) => (
            <option key={idx} value={option} className="font-semibold">{option}</option>
        ))}
    </select>
);

// Reusable Button Component
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
                ${isDisabled ? "bg-gray-300" : "bg-black"}`} // Change background to black when not disabled
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

// PropTypes validation
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