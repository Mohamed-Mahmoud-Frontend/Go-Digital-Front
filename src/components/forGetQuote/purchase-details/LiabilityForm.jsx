import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const LiabilityForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
    const { t, i18n } = useTranslation();
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        idPassport: "",
        name: "",
        surname: "",
        email: "",
        primaryCountryCode: "",
        primaryPhoneNumber: "",
        address: "",
        taxId: "",
        taxOffice: "",
        medicalCondition: "",
        startDate: "",
        questionTextarea: "",
    });

    // Fetch questions from API
    useEffect(() => {
        if (isOpen && step === 2) {
            fetchQuestions();
        }
    }, [isOpen, step]);

    // Pre-fill form with user details when available
    useEffect(() => {
        if (userDetails && isOpen) {
            setFormData(prevData => ({
                ...prevData,
                name: userDetails.first_name || userDetails.name || "",
                surname: userDetails.last_name || userDetails.surname || "",
                email: userDetails.email || "",
                address: userDetails.address || "",
                // Add other fields as they become available from the API
            }));
        }
    }, [userDetails, isOpen]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/user/transportOperators/getArguments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const data = await response.json();
            setQuestions(data.questions || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setError('Failed to load questions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // If the modal is not open, return null
    if (!isOpen) return null;

    // Handle input changes in the form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle medical condition change
    const handleMedicalConditionChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            medicalCondition: value,
            questionTextarea: ""
        }));
    };

    // Handle next step
    const handleNext = () => {
        if (step === 1 && isFormValid) {
            setStep(2);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            handleNext();
            return;
        }

        if (!isStep2Valid) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Get vehicles data from localStorage
            const vehiclesData = localStorage.getItem('liabilityVehicles');
            if (!vehiclesData) {
                throw new Error('No vehicles data found');
            }

            const vehicles = JSON.parse(vehiclesData);

            // Prepare questions data
            const questionsData = questions.map(question => ({
                id: question.id,
                answer: formData.medicalCondition,
                textarea: formData.questionTextarea || ""
            }));

            // Prepare submission data
            const submissionData = {
                start_date: formData.startDate || new Date().toISOString().split('T')[0],
                vehicles: vehicles,
                holder_first_name: formData.name,
                holder_last_name: formData.surname,
                holder_address: formData.address,
                holder_mobile_number_ext: formData.primaryCountryCode,
                holder_mobile_number: formData.primaryPhoneNumber,
                holder_tax_office: formData.taxOffice,
                holder_tin: formData.taxId,
                holder_email: formData.email,
                holder_identification: formData.idPassport,
                plan_id: selectedQuote?.id || 3,
                plan_duration: selectedQuote?.duration || 12,
                questions: questionsData
            };

            const response = await fetch(`${API_BASE_URL}/user/transportOperators/acceptQuote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit quote');
            }

            const result = await response.json();

            if (result.success && result.formUrl) {
                // Redirect to payment gateway
                window.open(result.formUrl, '_self');
                onClose();
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
            setError(error.message || 'Failed to submit quote. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if all required fields are filled for step 1
    const isFormValid =
        formData.idPassport &&
        formData.name &&
        formData.surname &&
        formData.email &&
        formData.primaryCountryCode &&
        formData.primaryPhoneNumber &&
        formData.address &&
        formData.taxId &&
        formData.taxOffice;

    // Check if step 2 is valid
    const isStep2Valid = () => {
        if (formData.medicalCondition === "" || questions.length === 0) {
            return false;
        }

        // Check if textarea is required based on the answer
        const currentQuestion = questions[0];
        if (currentQuestion) {
            if (formData.medicalCondition === "yes" && currentQuestion.mustTextareaYes) {
                return formData.questionTextarea.trim() !== "";
            }
            if (formData.medicalCondition === "no" && currentQuestion.mustTextareaNo) {
                return formData.questionTextarea.trim() !== "";
            }
        }

        return true;
    };

    // Check if textarea should be shown
    const shouldShowTextarea = () => {
        if (questions.length === 0) return false;
        const currentQuestion = questions[0];
        return (formData.medicalCondition === "yes" && currentQuestion.mustTextareaYes) ||
            (formData.medicalCondition === "no" && currentQuestion.mustTextareaNo);
    };

    return (
        <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
            <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg  w-full max-w-[560px] md:max-w-none mx-5 md:w-[800px] text-center px-5 max-h-[90vh] overflow-y-scroll no-scrollbar">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-7 right-7">
                    <iconsUtil.CloseFormIcon />
                </button>

                {step === 1 && (
                    <div>
                        <header>
                            <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("liability_form.header")}</h1>
                            <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("liability_form.subheader")}</h2>
                        </header>

                        {/* Progress bar */}
                        <div className="flex gap-5 items-center justify-center w-full text-center my-4">
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-[#C3C3C3]"></div>
                        </div>

                        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />
                        <h3 className="my-2 font-semibold text-secondaryColor">{t("liability_form.progress.personal_details")}</h3>

                        {/* Form for personal details */}
                        <form className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="idPassport"
                                placeholder={t("liability_form.placeholders.id_passport")}
                                value={formData.idPassport}
                                onChange={handleChange}
                                required
                                className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                            />
                            <span className="flex gap-3 max-w-[476px] mx-auto">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={t("liability_form.placeholders.name")}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="surname"
                                    placeholder={t("liability_form.placeholders.surname")}
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder={t("liability_form.placeholders.email")}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />

                            <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                {/* Country code input and phone number input */}
                                <input
                                    type="text"
                                    name="primaryCountryCode"
                                    placeholder="+30"
                                    value={formData.primaryCountryCode}
                                    onChange={handleChange}
                                    required
                                    className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                                />
                                <input
                                    type="tel"
                                    name="primaryPhoneNumber"
                                    placeholder={t("liability_form.placeholders.primary_phone")}
                                    value={formData.primaryPhoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                />
                            </div>

                            <input
                                type="text"
                                name="address"
                                placeholder={t("liability_form.placeholders.address")}
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="taxId"
                                placeholder={t("liability_form.placeholders.tax_id")}
                                value={formData.taxId}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="taxOffice"
                                placeholder={t("liability_form.placeholders.tax_office")}
                                value={formData.taxOffice}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />

                            {/* Next button */}
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!isFormValid}
                                className={`w-full sm:max-w-[476.442px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 mx-auto ${isFormValid ? "bg-orange-500" : "bg-gray-300"
                                    }`}
                            >
                                {t("liability_form.next_button") || "Next"}
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="overflow-y-auto max-h-[90vh]">
                        <header>
                            <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("liability_form.header")}</h1>
                            <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("liability_form.subheader")}</h2>
                        </header>
                        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

                        {/* Progress bar */}
                        <div className="flex gap-5 items-center justify-center w-full text-center">
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <LoadingSpinner />
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="text-lg font-semibold text-red-600">{error}</div>
                            </div>
                        ) : (
                            <>

                                {/* Display question HTML content */}
                                {questions.length > 0 && questions[0]?.question && (
                                    <div
                                        className="my-4 max-w-[500px] mx-auto text-left px-4"
                                        dangerouslySetInnerHTML={{ __html: questions[0].question }}
                                    />
                                )}

                                {/* Medical condition buttons */}
                                <div className="flex justify-center gap-4 my-8">
                                    <button
                                        type="button"
                                        onClick={() => handleMedicalConditionChange("yes")}
                                        className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none ${formData.medicalCondition === "yes" ? "bg-secondaryColor text-white" : "bg-gray-200"
                                            }`}
                                    >
                                        {t("liability_form.buttons.yes") || "Yes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleMedicalConditionChange("no")}
                                        className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none ${formData.medicalCondition === "no" ? "bg-secondaryColor text-white" : "bg-gray-200"
                                            }`}
                                    >
                                        {t("liability_form.buttons.no") || "No"}
                                    </button>
                                </div>

                                {/* Conditional textarea */}
                                {shouldShowTextarea() && (
                                    <div className="max-w-[476px] mx-auto mb-6">
                                        <textarea
                                            name="questionTextarea"
                                            value={formData.questionTextarea}
                                            onChange={handleChange}
                                            placeholder="Please provide additional details..."
                                            required
                                            className="w-full h-[100px] px-4 py-3 border border-[#C3C3C3] rounded-[10px] outline-none resize-none"
                                        />
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isStep2Valid() || isSubmitting}
                                    className={`w-full sm:max-w-[476.442px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 mx-auto ${isStep2Valid() && !isSubmitting ? "bg-orange-500" : "bg-gray-300"
                                        }`}
                                >
                                    {isSubmitting ? "Submitting..." : (t("liability_form.submit_button") || "Submit")}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

LiabilityForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedQuote: PropTypes.object,
    userDetails: PropTypes.object
};
