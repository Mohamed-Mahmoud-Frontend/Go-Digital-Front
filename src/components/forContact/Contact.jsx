import Symbol from "@/assets/images/icon.png"; // Images
import * as Icons from "@/utils/icons.util"; // Icons
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Contact = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        town: '',
        is_client: null,
        request_theme_id: '',
        message: '',
        policy_accept: false,
        newsletter_accept: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Request type options
    const requestTypes = [
        { id: "1", text: "Policy Renewal", text_el: "Ανανέωση Συμβολαίου" },
        { id: "2", text: "Policy Issuance", text_el: "Έκδοση Συμβολαίου" },
        { id: "3", text: "Technical Issue", text_el: "Τεχνικό Πρόβλημα" },
        { id: "4", text: "Claim", text_el: "Απαίτηση" },
        { id: "5", text: "General Information", text_el: "Γενικές Πληροφορίες" }
    ];

    // Fetch user details when signed in
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserDetails();
        }
    }, [isAuthenticated]);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
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
            setFormData(prev => ({
                ...prev,
                first_name: data.first_name || data.name || "",
                last_name: data.last_name || data.surname || "",
                email: data.email || "",
                phone_number: data.mobile_number || data.phone || "",
                town: data.town || data.city || "",
            }));
        } catch (error) {
            console.error('Error fetching user details:', error);
            // Don't show error, just continue with empty fields
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleClientSelection = (isClient) => {
        setFormData(prev => ({
            ...prev,
            is_client: isClient
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Convert boolean values to "0" or "1" strings
            const apiData = {
                ...formData,
                is_client: formData.is_client === true ? "1" : "0",
                policy_accept: formData.policy_accept ? "1" : "0",
                newsletter_accept: formData.newsletter_accept ? "1" : "0"
            };

            // Prepare headers
            const headers = {
                'Content-Type': 'application/json',
                'Accept-Language': i18n.language
            };

            // Add Authorization header if user is authenticated
            if (isAuthenticated) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}/user/contact`, {
                method: 'POST',
                headers,
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact form');
            }

            setSuccess(true);
            // Reset form
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone_number: '',
                town: '',
                is_client: null,
                request_theme_id: '',
                message: '',
                policy_accept: false,
                newsletter_accept: false
            });
        } catch (error) {
            console.error('Contact form submission error:', error);
            setError('Συνέβη κάποιο σφάλμα κατά την αποστολή της φόρμας. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="grid grid-cols-1 xl:grid-cols-2 gap-8 mx-6 lg:mx-20 my-10">

            {/* Details Section */}
            <section
                className="flex flex-col justify-center items-start p-7 sm:p-14 w-full bg-primaryBgColor text-left rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12"
                style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
            >
                {/* Hero Section Logo */}
                <img data-aos="fade-in" src={Symbol} alt="Go Digital Icon" className="w-[150px]" />
                {/* Hero Section Titles */}
                <h1 className="text-4xl md:text-5xl font-semibold mb-8">{t('contact_section.title')}</h1>
                <h2 className="text-sm vsm:text-base">
                    {t('contact_section.subtitle')}
                </h2>
                <h3 className="my-5 text-sm vsm:text-base md:text-[22px] font-semibold">
                    {t('contact_section.description')}
                </h3>
                <p className="flex gap-2 underline items-center font-bold mb-2">
                    <a href={'#'}>{t('contact_section.policy_text')}</a>
                </p>
                <p className="flex gap-2 underline items-center font-bold mb-2">
                    <a href={'#'}>{t('contact_section.terms_text')}</a>
                </p>
                <p className="flex gap-2 underline items-center font-bold mb-2">
                    <a href={'#'}>{t('contact_section.complaints_text')}</a>
                </p>
                <p className="flex gap-2 items-center font-bold mb-2 mt-10 md:mt-20">
                    <Icons.PhoneIcon />
                    210 8934675
                </p>
                <p className="flex gap-2 items-center font-bold mb-2">
                    <Icons.MailIcon />
                    info@godigitalinsurance.gr
                </p>
            </section>

            {/* Form Section*/}
            <section
                className="flex flex-col justify-center items-start p-7 sm:p-14 w-full bg-[#F5F5F5] text-black text-left rounded-3xl md:rounded-[58px]  py-6 md:py-12"
                style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
            >
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                    <span className="flex gap-3 w-full mx-auto">
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder={t('contact_section.form.name')}
                            required
                            className="h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                        />
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder={t('contact_section.form.surname')}
                            required
                            className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                        />
                    </span>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('contact_section.form.email')}
                        required
                        className="h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                    />
                    <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder={t('contact_section.form.phone')}
                        required
                        className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                    />
                    <input
                        type="text"
                        name="town"
                        value={formData.town}
                        onChange={handleInputChange}
                        placeholder={t('contact_section.form.city')}
                        required
                        className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                    />

                    {/* =========== بداية التعديل =========== */}

                    {/* Request Type Dropdown (بقى لوحده) */}
                    <div className="flex gap-3 w-full mx-auto">
                        <select
                            name="request_theme_id"
                            value={formData.request_theme_id}
                            onChange={handleInputChange}
                            required
                            className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                        >
                            <option value="" disabled>{t('contact_section.form.request_type')}</option>
                            {requestTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {i18n.language === 'el' ? type.text_el : type.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 w-full mx-auto">
                        <span className="flex gap-3 w-full">
                            <button
                                type="button"
                                className={`rounded-2xl w-fit text-nowrap px-4 h-[50px] text-[#C3C3C3] bg-white border border-[#C3C3C3]`}
                                style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.15)' }}
                            >
                                {t('contact_section.form.customer')}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleClientSelection(true)}
                                className={`rounded-2xl w-full h-[50px] ${formData.is_client === true ? 'bg-[#F15D2A] text-white' : 'text-[#C3C3C3] bg-white'} border border-[#C3C3C3]`}
                                style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.15)' }}
                            >
                                {t('contact_section.form.yes')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClientSelection(false)}
                                className={`rounded-2xl w-full h-[50px] ${formData.is_client === false ? 'bg-[#F15D2A] text-white' : 'text-[#C3C3C3] bg-white'} border border-[#C3C3C3]`}
                                style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.15)' }}
                            >
                                {t('contact_section.form.no')}
                            </button>
                        </span>
                    </div>


                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t('contact_section.form.message')}
                        className="w-full p-4 border border-[#C3C3C3] rounded-[10px] outline-none"
                    />

                    {/* Consent Checkboxes */}
                    <div className="flex flex-col gap-4 mt-4">
                        <label className="flex items-start gap-3 text-xs">
                            <input
                                type="checkbox"
                                name="policy_accept"
                                checked={formData.policy_accept}
                                onChange={handleCheckboxChange}
                                required
                                className="mt-0.5 accent-[#F15D2A]"
                            />
                            <span>
                                Δηλώνω ότι συναινώ ρητά και ανεπιφύλακτα στην επεξεργασία των προσωπικών μου δεδομένων από την GODIGITAL για τον σκοπό διαχείρισης του συγκεκριμένου αιτήματος μου.
                            </span>
                        </label>
                        <label className="flex items-start gap-3 text-xs">
                            <input
                                type="checkbox"
                                name="newsletter_accept"
                                checked={formData.newsletter_accept}
                                onChange={handleCheckboxChange}
                                className="mt-0.5 accent-[#F15D2A]"
                            />
                            <span>
                                Συμφωνώ να λαμβάνω το Ενημερωτικό Δελτίο και αποδέχομαι την Πολιτική Προστασίας Προσωπικών Δεδομένων της GODIGITAL.
                            </span>
                        </label>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mx-auto max-w-[540px] h-[65px] text-white font-bold text-xl py-2 px-4 rounded-md m-6 bg-secondaryColor hover:bg-primaryBgColor transition-all disabled:opacity-50"
                        style={{ boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)' }}
                    >
                        {isLoading ? 'Αποστολή...' : t('contact_section.form.submit')}
                    </button>
                </form>
            </section>
        </main>
    )
}