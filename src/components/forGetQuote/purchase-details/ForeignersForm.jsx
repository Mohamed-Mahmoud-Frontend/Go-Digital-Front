import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components";
import { CountryCodeSelect } from "../../CountryCodeSelect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ForeignersForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
    const { t, i18n } = useTranslation();
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        // Step 1 - Person the service is bought for
        startDate: "",
        identification: "",
        firstName: "",
        lastName: "",
        mobileExtension: "+30", // (جديد)
        mobileNumber: "",
        address: "",

        // Step 2 - Questions from API
        questions: [],

        // Step 3 - User account details
        userIdentification: "",
        userFirstName: "",
        userLastName: "",
        userEmail: "",
        userMobileExtension: "+30", // (جديد)
        userMobileNumber: "",
        userAddress: "",
        userTin: "",
        userTaxOffice: "",
    });

    // Fetch questions from API
    useEffect(() => {
        if (isOpen && step === 2) {
            fetchQuestions();
        }
    }, [isOpen, step]);

    // Pre-fill form with data from previous screen
    useEffect(() => {
        if (userDetails && isOpen) {
            setFormData(prevData => ({
                ...prevData,
                startDate: userDetails.step4.insurancePeriod || "",
                identification: userDetails.step2.identification || "",
                firstName: userDetails.step1.firstName || "",
                lastName: userDetails.step1.lastName || "",
            }));
        }
    }, [userDetails, isOpen]);

    // Fetch user details for step 3
    useEffect(() => {
        if (isOpen && step === 3) {
            fetchUserDetails();
        }
    }, [isOpen, step]);

    const fetchQuestions = async () => {
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
                throw new Error('Failed to fetch questions');
            }

            const data = await response.json();
            setQuestions(data.questions || []);

            // Initialize questions in form data
            setFormData(prevData => ({
                ...prevData,
                questions: data.questions.map(question => ({
                    id: question.id,
                    answer: "",
                    textarea: ""
                }))
            }));
        } catch (error) {
            console.error('Error fetching questions:', error);
            setError('Failed to load questions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${API_BASE_URL}/user/details`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': i18n.language
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const data = await response.json();

            // Auto-fill user details
            setFormData(prevData => ({
                ...prevData,
                userIdentification: data.identification || data.id_passport || "",
                userFirstName: data.first_name || data.name || "",
                userLastName: data.last_name || data.surname || "",
                userEmail: data.email || "",
                // (جديد) تعديل اللوجيك للحفاظ على القيمة الافتراضية
                userMobileExtension: data.mobile_extension || data.phone_extension || prevData.userMobileExtension,
                userMobileNumber: data.mobile_number || data.phone || "",
                userAddress: data.address || "",
                userTin: data.tin || data.tax_id || "",
                userTaxOffice: data.tax_office || "",
            }));
        } catch (error) {
            console.error('Error fetching user details:', error);
            // Don't show error, just continue with empty fields
        }
    };

    if (!isOpen) return null;

    // Handle input changes in the form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleMobileCodeChange = (code) => {
        setFormData((prevData) => ({
            ...prevData,
            mobileExtension: code,
        }));
    };

    const handleUserMobileCodeChange = (code) => {
        setFormData((prevData) => ({
            ...prevData,
            userMobileExtension: code,
        }));
    };

    // Handle question answer change
    const handleQuestionAnswerChange = (questionId, answer) => {
        setFormData((prevData) => ({
            ...prevData,
            questions: prevData.questions.map(q =>
                q.id === questionId ? { ...q, answer } : q
            )
        }));
    };

    // Handle question textarea change
    const handleQuestionTextareaChange = (questionId, value) => {
        setFormData((prevData) => ({
            ...prevData,
            questions: prevData.questions.map(q =>
                q.id === questionId ? { ...q, textarea: value } : q
            )
        }));
    };

    // Handle next step
    const handleNext = () => {
        if (step === 1 && isStep1Valid) {
            setStep(2);
        } else if (step === 2 && isStep2Valid()) { // (تصحيح) الدالة دي لازم تتنادى
            setStep(3);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1 || step === 2) {
            handleNext();
            return;
        }

        if (!isStep3Valid) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Get the original quote data from localStorage
            const storedData = localStorage.getItem('foreignersQuoteData');
            if (!storedData) {
                throw new Error('No quote data found');
            }

            const quoteData = JSON.parse(storedData);

            // Prepare questions data
            const questionsData = formData.questions.map(question => ({
                id: question.id.toString(),
                answer: question.answer || "no",
                textarea: question.textarea || ""
            }));

            // Prepare submission data
            const submissionData = {
                // Original quote data (person being insured)
                date_birth: quoteData.userData.step3.birthday,
                identification: quoteData.userData.step2.identification,
                first_name: quoteData.userData.step1.firstName,
                last_name: quoteData.userData.step1.lastName,
                gender: quoteData.userData.step3.genderId,
                country_id: quoteData.userData.step2.nationalityId,

                // Person details (service is bought for) - from step 1
                mobile_number: formData.mobileNumber,
                mobile_number_ext: formData.mobileExtension,
                address: formData.address,
                start_date: formData.startDate,

                // User account details (holder) - from step 3
                holder_identification: formData.userIdentification,
                holder_first_name: formData.userFirstName,
                holder_last_name: formData.userLastName,
                holder_email: formData.userEmail,
                holder_mobile_number: formData.userMobileNumber,
                holder_mobile_number_ext: formData.userMobileExtension,
                holder_address: formData.userAddress,
                holder_tax_office: formData.userTaxOffice,
                holder_tin: formData.userTin,

                // Questions from step 2
                questions: questionsData,

                // Quote details
                plan_id: selectedQuote?.id,
                plan_duration: selectedQuote?.duration || 12
            };

            const response = await fetch(`${API_BASE_URL}/user/immigrationMedical/acceptQuote`, {
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

    // Check if step 1 is valid
    const isStep1Valid = formData.startDate && formData.identification &&
        formData.firstName && formData.lastName && formData.mobileExtension &&
        formData.mobileNumber && formData.address;

    // Check if step 2 is valid
    const isStep2Valid = () => {
        if (formData.questions.length === 0) return false;

        return formData.questions.every(question => {
            if (!question.answer) return false;

            const apiQuestion = questions.find(q => q.id === question.id);
            if (!apiQuestion) return true;

            if (question.answer === "yes" && apiQuestion.mustTextareaYes) {
                return question.textarea?.trim() !== "";
            }
            if (question.answer === "no" && apiQuestion.mustTextareaNo) {
                return question.textarea?.trim() !== "";
            }
            return true;
        });
    };

    // Check if step 3 is valid
    const isStep3Valid = formData.userIdentification && formData.userFirstName &&
        formData.userLastName && formData.userEmail && formData.userMobileExtension &&
        formData.userMobileNumber && formData.userAddress && formData.userTin &&
        formData.userTaxOffice;

    // Check if textarea should be shown for a question
    const shouldShowTextarea = (question) => {
        const apiQuestion = questions.find(q => q.id === question.id);
        if (!apiQuestion) return false;

        return (question.answer === "yes" && apiQuestion.mustTextareaYes) ||
            (question.answer === "no" && apiQuestion.mustTextareaNo);
    };

    return (
        <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
            <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] md:max-w-none mx-5 md:w-[800px] text-center px-5 max-h-[90vh] overflow-y-scroll no-scrollbar">
                <button onClick={onClose} className="absolute top-7 right-7">
                    <iconsUtil.CloseFormIcon />
                </button>

                {step === 1 && (
                    <Fragment>
                        <header>
                            <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("foreigners_form.header")}</h1>
                            <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("foreigners_form.subheader")}</h2>
                        </header>
                        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

                        {/* Progress bar */}
                        <div className="flex gap-5 items-center justify-center w-full text-center">
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-[#C3C3C3]"></div>
                            <div className="h-[10px] w-28 rounded-md bg-[#C3C3C3]"></div>
                        </div>

                        <h3 className="my-5 font-semibold text-secondaryColor">{t("foreigners_form.subheader")}</h3>

                        {/* Form for person details */}
                        <form className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="startDate"
                                placeholder={t("foreigners_form.placeholders.start_date")}
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                            />
                            <input
                                type="text"
                                name="identification"
                                placeholder={t("foreigners_form.placeholders.id_passport")}
                                value={formData.identification}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <span className="flex gap-3 max-w-[476px] mx-auto">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder={t("foreigners_form.placeholders.name")}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder={t("foreigners_form.placeholders.surname")}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                            </span>

                            {/* (جديد) Mobile Extension + Number (Step 1) */}
                            <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                <div className="w-[110px]">
                                    <CountryCodeSelect
                                        value={formData.mobileExtension}
                                        onChange={handleMobileCodeChange}
                                        isInvalid={!formData.mobileExtension}
                                    />
                                </div>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    placeholder={t("foreigners_form.placeholders.mobile_number")}
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                />
                            </div>

                            <input
                                type="text"
                                name="address"
                                placeholder={t("foreigners_form.placeholders.address")}
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                        </form>

                        {/* Next button */}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!isStep1Valid}
                            className={`w-full mx-auto max-w-[540px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 ${isStep1Valid ? "bg-orange-500" : "bg-gray-300"}`}
                        >
                            {t("foreigners_form.buttons.next")}
                        </button>
                    </Fragment>
                )}

                {step === 2 && (
                    <Fragment>
                        <header>
                            <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("foreigners_form.header")}</h1>
                            <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("foreigners_form.subheader")}</h2>
                        </header>
                        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

                        {/* Progress bar */}
                        <div className="flex gap-5 items-center justify-center w-full text-center">
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-[#C3C3C3]"></div>
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
                                <h3 className="mt-5 font-semibold text-secondaryColor">{t("foreigners_form.subheader")}</h3>

                                {/* Display questions */}
                                {formData.questions.map((question, index) => {
                                    const apiQuestion = questions.find(q => q.id === question.id);
                                    if (!apiQuestion) return null;

                                    return (
                                        <div key={question.id} className="max-w-[500px] mx-auto text-left px-4 mb-6">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold mb-3">
                                                    {index + 1}. <span dangerouslySetInnerHTML={{ __html: apiQuestion.question }} />
                                                </h3>

                                                {/* Answer buttons */}
                                                <div className="flex gap-4 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuestionAnswerChange(apiQuestion.id, "yes")}
                                                        className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none ${question.answer === "yes" ? "bg-secondaryColor text-white" : "bg-gray-200"}`}
                                                    >
                                                        {t("foreigners_form.buttons.yes")}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuestionAnswerChange(apiQuestion.id, "no")}
                                                        className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none ${question.answer === "no" ? "bg-secondaryColor text-white" : "bg-gray-200"}`}
                                                    >
                                                        {t("foreigners_form.buttons.no")}
                                                    </button>
                                                </div>

                                                {/* Conditional textarea */}
                                                {shouldShowTextarea(question) && (
                                                    <textarea
                                                        value={question.textarea || ""}
                                                        onChange={(e) => handleQuestionTextareaChange(apiQuestion.id, e.target.value)}
                                                        placeholder={t('foreigners_form.placeholders.additionalDetails')}
                                                        required
                                                        className="w-full h-[100px] px-4 py-3 border border-[#C3C3C3] rounded-[10px] outline-none resize-none"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Next button */}
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!isStep2Valid()}
                                    className={`w-full mx-auto max-w-[540px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 ${isStep2Valid() ? "bg-orange-500" : "bg-gray-300"}`}
                                >
                                    {t("foreigners_form.buttons.next")}
                                </button>
                            </>
                        )}
                    </Fragment>
                )}

                {step === 3 && (
                    <Fragment>
                        <header>
                            <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("foreigners_form.header")}</h1>
                            <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("foreigners_form.subheader")}</h2>
                        </header>
                        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

                        {/* Progress bar */}
                        <div className="flex gap-5 items-center justify-center w-full text-center">
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                            <div className="h-[10px] w-28 rounded-md bg-secondaryColor"></div>
                        </div>

                        <h3 className="mt-5 font-semibold text-secondaryColor">{t("foreigners_form.step3.subheader")}</h3>
                        <p className="max-w-[476px] text-center mx-auto">Επιλέξτε εδώ για να εισαχθοούν τα στοιχεία του ασφαλιζόμενου προσώπου.</p>
                        <button className="w-14 h-7 bg-white rounded-3xl shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] border border-red-500 text-sm my-3">ΕΔΩ</button>
                        {/* Form for user account details */}
                        <form className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="userIdentification"
                                placeholder={t("foreigners_form.placeholders.id_passport")}
                                value={formData.userIdentification}
                                onChange={handleChange}
                                required
                                className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                            />
                            <span className="flex gap-3 max-w-[476px] mx-auto">
                                <input
                                    type="text"
                                    name="userFirstName"
                                    placeholder={t("foreigners_form.placeholders.name")}
                                    value={formData.userFirstName}
                                    onChange={handleChange}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="userLastName"
                                    placeholder={t("foreigners_form.placeholders.surname")}
                                    value={formData.userLastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                            </span>
                            <input
                                type="email"
                                name="userEmail"
                                placeholder={t("foreigners_form.placeholders.user_email")}
                                value={formData.userEmail}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />

                            {/* (جديد) User Mobile Extension + Number (Step 3) */}
                            <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                <div className="w-[110px]">
                                    <CountryCodeSelect
                                        value={formData.userMobileExtension}
                                        onChange={handleUserMobileCodeChange}
                                        isInvalid={!formData.userMobileExtension}
                                    />
                                </div>
                                <input
                                    type="tel"
                                    name="userMobileNumber"
                                    placeholder={t("foreigners_form.placeholders.primary_phone")}
                                    value={formData.userMobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                />
                            </div>

                            <input
                                type="text"
                                name="userAddress"
                                placeholder={t("foreigners_form.placeholders.address")}
                                value={formData.userAddress}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="userTin"
                                placeholder={t("foreigners_form.placeholders.tax_id")}
                                value={formData.userTin}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="userTaxOffice"
                                placeholder={t("foreigners_form.placeholders.tax_office")}
                                value={formData.userTaxOffice}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                        </form>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-600 text-center mt-4">
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isStep3Valid || isSubmitting}
                            className={`w-full mx-auto max-w-[540px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 ${isStep3Valid && !isSubmitting ? "bg-orange-500" : "bg-gray-300"}`}
                        >
                            {isSubmitting ? "Submitting..." : t("foreigners_form.buttons.submit")}
                        </button>
                    </Fragment>
                )}
            </div>
        </div>
    );
};

ForeignersForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedQuote: PropTypes.object,
    userDetails: PropTypes.object
};