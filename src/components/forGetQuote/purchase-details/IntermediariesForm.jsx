import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components"; 
import { CountryCodeSelect } from "../../CountryCodeSelect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const IntermediariesForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        identification: "",
        firstName: "",
        lastName: "",
        email: "",
        mobileExtension: "+30", // (جديد) قيمة افتراضية
        mobileNumber: "",
        phoneExtension: "+30", // (جديد) قيمة افتراضية
        phoneNumber: "",
        address: "",
        tin: "",
        taxOffice: "",
        chamber: "",
        licenceNumber: "",
        questions: []
    });

    // Fetch API data on component mount
    useEffect(() => {
        if (isOpen) {
            fetchApiData();
        }
    }, [isOpen]);

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
            setFormData(prev => ({
                ...prev,
                questions: data.questions.map(question => ({
                    id: question.id,
                    answer: "",
                    textarea: ""
                }))
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Pre-fill user details if available
    useEffect(() => {
        if (userDetails && isOpen) {
            setFormData(prev => ({
                ...prev,
                identification: userDetails.identification || userDetails.id_passport || "",
                firstName: userDetails.first_name || userDetails.name || "",
                lastName: userDetails.last_name || userDetails.surname || "",
                email: userDetails.email || "",
                // (جديد) تم تعديل اللوجيك ليحتفظ بالقيمة الافتراضية
                mobileExtension: userDetails.mobile_extension || userDetails.phone_extension || prev.mobileExtension,
                mobileNumber: userDetails.mobile_number || userDetails.phone || "",
                phoneExtension: userDetails.phone_extension || userDetails.mobile_extension || prev.phoneExtension,
                phoneNumber: userDetails.phone_number || userDetails.phone || "",
                address: userDetails.address || "",
                tin: userDetails.tin || userDetails.tax_id || "",
                taxOffice: userDetails.tax_office || "",
                chamber: userDetails.chamber || "",
                licenceNumber: userDetails.licence_number || userDetails.registration_number || ""
            }));
        }
    }, [userDetails, isOpen]);

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

    const handlePhoneCodeChange = (code) => {
        setFormData((prevData) => ({
            ...prevData,
            phoneExtension: code,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedQuote) {
            setError('No quote selected');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Get the original quote data from localStorage
            const storedData = localStorage.getItem('intermediariesQuoteData');
            if (!storedData) {
                throw new Error('No quote data found');
            }

            const quoteData = JSON.parse(storedData);

            // Prepare submission data
            const submissionData = {
                // Original quote data
                firm_established: quoteData.userData.step2.firmEstablished,
                agent_type: quoteData.userData.step1.agentTypeId,
                type: quoteData.userData.step2.typeId,
                agent_count: 1,
                gross_insured: parseInt(quoteData.userData.step3.grossInsured) || 50000,
                gross_insured_current: parseInt(quoteData.userData.step3.grossInsuredCurrent) || 50000,
                insured_type: "individual",
                start_date: quoteData.userData.step1.startDate,
                questions: quoteData.userData.step4.questions.map(question => ({
                    id: question.id.toString(),
                    answer: question.answer || "no",
                    textarea: question.textarea || ""
                })),
                dates_of_birthday: [quoteData.userData.step1.dateBirthday],

                // Quote details
                plan_id: selectedQuote.id,
                plan_duration: selectedQuote.duration || 1,

                // Holder details
                holder_identification: formData.identification,
                holder_first_name: formData.firstName,
                holder_last_name: formData.lastName,
                holder_email: formData.email,
                holder_mobile_number: formData.mobileNumber,
                holder_mobile_number_ext: formData.mobileExtension,
                holder_phone_number: formData.phoneNumber,
                holder_phone_number_ext: formData.phoneExtension,
                holder_address: formData.address,
                holder_tin: formData.tin,
                holder_tax_office: formData.taxOffice,
                holder_chamber: formData.chamber,
                holder_licence_number: formData.licenceNumber
            };

            const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/acceptQuote`, {
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
                throw new Error(errorData.message || 'Failed to submit acceptance');
            }

            const result = await response.json();

            if (result.success && result.formUrl) {
                // Navigate to payment gateway in the same window
                window.location.href = result.formUrl;
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.message || 'Failed to submit form. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if all required fields are filled
    const isFormValid = formData.identification && formData.firstName && formData.lastName &&
        formData.email && formData.mobileExtension && formData.mobileNumber &&
        formData.phoneExtension && formData.phoneNumber && formData.address &&
        formData.tin && formData.taxOffice && formData.chamber && formData.licenceNumber;

    if (isLoading) {
        return (
            <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
            <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] md:max-w-none mx-5 md:w-[800px] text-center px-5  max-h-[90vh] overflow-y-scroll no-scrollbar">
                <button onClick={onClose} className="absolute top-7 right-7">
                    <iconsUtil.CloseFormIcon />
                </button>

                <Fragment>
                    <div>
                        <header>
                            <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("intermediaries_form.header")}</h1>
                            <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("intermediaries_form.subheader")}</h2>
                        </header>
                        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

                        {/* Form for personal details */}
                        <form className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="identification"
                                placeholder="Identification"
                                value={formData.identification}
                                onChange={handleChange}
                                required
                                className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                            />
                            <span className="flex gap-3 max-w-[476px] mx-auto">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />

                            {/* (جديد) Mobile Extension + Number */}
                            <div className="flex items-center justify-center gap-3 w-full sm:max-w-[476px] mx-auto">
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
                                    placeholder="Mobile Number"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                />
                            </div>

                            {/* (جديد) Phone Extension + Number */}
                            <div className="flex items-center justify-center gap-3 w-full sm:max-w-[476px] mx-auto">
                                <div className="w-[110px]">
                                    <CountryCodeSelect
                                        value={formData.phoneExtension}
                                        onChange={handlePhoneCodeChange}
                                        isInvalid={!formData.phoneExtension}
                                    />
                                </div>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                />
                            </div>

                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="tin"
                                placeholder="TIN"
                                value={formData.tin}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="taxOffice"
                                placeholder="Tax Office"
                                value={formData.taxOffice}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="chamber"
                                placeholder="Chamber"
                                value={formData.chamber}
                                onChange={handleChange}
                                required
                                className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                            />
                            <input
                                type="text"
                                name="licenceNumber"
                                placeholder="Licence Number"
                                value={formData.licenceNumber}
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
                            disabled={!isFormValid || isLoading}
                            className={`w-full mx-auto max-w-[540px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 ${isFormValid && !isLoading ? "bg-orange-500" : "bg-gray-300"}`}
                        >
                            {isLoading ? "Submitting..." : t("intermediaries_form.buttons.submit")}
                        </button>
                    </div>
                </Fragment>

            </div>
        </div>
    );
}

IntermediariesForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedQuote: PropTypes.object,
    userDetails: PropTypes.object
};