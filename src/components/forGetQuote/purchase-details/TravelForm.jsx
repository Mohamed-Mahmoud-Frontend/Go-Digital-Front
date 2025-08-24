import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import * as iconsUtil from "@/utils/icons.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TravelForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        identification: "",
        email: "",
        mobileCountryCode: "",
        mobileNumber: "",
        phoneCountryCode: "",
        phoneNumber: "",
        address: "",
    });

    // Fetch user details when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUserDetails();
        }
    }, [isOpen]);

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

            // Auto-fill form with user details
            setFormData(prevData => ({
                ...prevData,
                name: data.first_name || data.name || "",
                surname: data.last_name || data.surname || "",
                identification: data.identification || data.id_passport || "",
                email: data.email || "",
                mobileCountryCode: data.mobile_extension || data.phone_extension || "",
                mobileNumber: data.mobile_number || data.phone || "",
                phoneCountryCode: data.phone_extension || data.mobile_extension || "",
                phoneNumber: data.phone || data.mobile_number || "",
                address: data.address || "",
            }));
        } catch (error) {
            console.error('Error fetching user details:', error);
            // Don't show error, just continue with empty fields
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Get stored data
            const storedData = JSON.parse(localStorage.getItem('travelQuoteData') || '{}');

            // Prepare submission data according to API requirements
            const submissionData = {
                from_country: storedData.submissionData?.from_country || "",
                to_country: storedData.submissionData?.to_country || "",
                start_date: storedData.submissionData?.start_date || "",
                end_date: storedData.submissionData?.end_date || "",
                insured_type: storedData.submissionData?.insured_type || "",
                persons: storedData.submissionData?.persons?.map((person, index) => ({
                    date_birth: person.date_birth,
                    fullName: userDetails?.step4?.persons[index]?.name || "",
                    identification: userDetails?.step4?.persons[index]?.identification || ""
                })) || [],
                insured_identification: formData.identification,
                holder_identification: formData.identification,
                holder_first_name: formData.name,
                holder_last_name: formData.surname,
                holder_email: formData.email,
                holder_phone_number: formData.phoneNumber,
                holder_phone_number_ext: formData.phoneCountryCode,
                holder_mobile_number: formData.mobileNumber,
                holder_mobile_number_ext: formData.mobileCountryCode,
                holder_address: formData.address,
                plan_id: selectedQuote?.id || 0,
                plan_duration: selectedQuote?.duration || 1
            };

            const response = await fetch(`${API_BASE_URL}/user/travelInsurance/acceptQuote`, {
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
                throw new Error(errorData.message || 'Failed to submit travel insurance');
            }

            const result = await response.json();

            if (result.success && result.formUrl) {
                // Redirect to payment gateway
                window.open(result.formUrl, '_self');
                onClose();
            } else {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (error) {
            console.error('Travel form submission error:', error);
            setError('Συνέβη κάποιο σφάλμα κατά την αποστολή της φόρμας. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if all required fields are filled
    const isFormValid =
        formData.name &&
        formData.surname &&
        formData.identification &&
        formData.email &&
        formData.mobileCountryCode &&
        formData.mobileNumber &&
        formData.phoneCountryCode &&
        formData.phoneNumber &&
        formData.address;

    return (
        <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
            <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] md:max-w-none mx-5 md:w-[800px] text-center px-5">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-7 right-7">
                    <iconsUtil.CloseFormIcon />
                </button>

                <header>
                    <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("travel_form.step1.header")}</h1>
                    <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("travel_form.step1.subheader")}</h2>
                </header>
                <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

                <h3 className="my-5 font-semibold text-secondaryColor">{t("travel_form.step1.progress.personal_details")}</h3>

                {error && (
                    <div className="w-full p-4 mb-4 text-red-600 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="w-full p-4 mb-4 text-green-600 bg-green-100 rounded-lg">
                        Η φόρμα στάλθηκε επιτυχώς!
                    </div>
                )}

                {/* Form for personal details */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        name="name"
                        placeholder={t("travel_form.step1.placeholders.name")}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                    />
                    <input
                        type="text"
                        name="surname"
                        placeholder={t("travel_form.step1.placeholders.surname")}
                        value={formData.surname}
                        onChange={handleChange}
                        required
                        className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                    />
                    <input
                        type="text"
                        name="identification"
                        placeholder="Identification Number"
                        value={formData.identification}
                        onChange={handleChange}
                        required
                        className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                    />

                    <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                        {/* Mobile country code input and mobile number input */}
                        <input
                            type="text"
                            name="mobileCountryCode"
                            placeholder="+30"
                            value={formData.mobileCountryCode}
                            onChange={handleChange}
                            required
                            className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                        />
                        <input
                            type="tel"
                            name="mobileNumber"
                            placeholder="Mobile Number"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            required
                            className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                        />
                    </div>

                    <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                        {/* Phone country code input and phone number input */}
                        <input
                            type="text"
                            name="phoneCountryCode"
                            placeholder="+30"
                            value={formData.phoneCountryCode}
                            onChange={handleChange}
                            required
                            className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                        />
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                        />
                    </div>

                    <input
                        type="email"
                        name="email"
                        placeholder={t("travel_form.step1.placeholders.email")}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder={t("travel_form.step1.placeholders.address")}
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                    />
                </form>

                {/* Submit button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid || isLoading}
                    className={`w-full mx-auto max-w-[540px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 ${isFormValid && !isLoading ? "bg-orange-500" : "bg-gray-300"}`}
                >
                    {isLoading ? 'Αποστολή...' : t("travel_form.step1.next_button")}
                </button>
            </div>
        </div>
    );
};

TravelForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedQuote: PropTypes.object,
    userDetails: PropTypes.object,
};