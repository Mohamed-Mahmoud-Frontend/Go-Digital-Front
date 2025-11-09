import { ClosePopUpIcon } from '@/utils/icons.util';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RegisterPopup = ({ handleLoginPopupClose, onSwitchToOtp }) => {
    const { i18n } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        surname: '',
        phone: '',
        phone_extension: '30',
        address: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handlePhoneChange = (value, country) => {
        const extension = country.dialCode;
        let number = value.slice(extension.length).startsWith('0')
            ? value.slice(extension.length + 1)
            : value.slice(extension.length);

        setFormData(prev => ({
            ...prev,
            phone_extension: extension,
            phone: number
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.phone) {
            setError('Παρακαλώ εισάγετε έγκυρο αριθμό τηλεφώνου.');
            return;
        }

        try {
            const fullPhoneNumber = formData.phone_extension + formData.phone;
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({
                    ...formData,
                    phone: fullPhoneNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    if (data.message?.toLowerCase().includes('email')) {
                        setError('Το email χρησιμοποιείται ήδη. Παρακαλώ χρησιμοποιήστε άλλο email.');
                    } else if (data.message?.toLowerCase().includes('phone')) {
                        setError('Το τηλέφωνο χρησιμοποιείται ήδη. Παρακαλώ χρησιμοποιήστε άλλο τηλέφωνο.');
                    } else {
                        setError(data.message || 'Παρακαλώ ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.');
                    }
                } else {
                    throw new Error(data.message || 'Registration failed');
                }
                return;
            }

            onSwitchToOtp(formData.email);
        } catch (error) {
            console.error('Registration error:', error);
            setError('Συνέβη κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
        }
    };

    return (
        <div className="py-8 px-6 sm:py-9 sm:px-12 md:px-24 max-w-[890px] w-full relative bg-[#F1EEEC] rounded-[39px]">
            <span
                className="absolute top-4 right-4 sm:top-9 sm:right-8 w-6 cursor-pointer"
                onClick={() => handleLoginPopupClose(false)}
            >
                <ClosePopUpIcon />
            </span>

            <h2 className="text-center text-black text-3xl sm:text-4xl font-semibold max-w-[430px] mx-auto pt-4 sm:pt-0">Λογαριασμός</h2>
            <h3 className="text-xl sm:text-2xl font-bold mt-8 px-2">Δημιουργία Λογαριασμού</h3>
            <p className="text-base sm:text-lg font-medium mt-1 px-2 text-gray-700">Συμπλήρωσε τα στοιχεία σου για να δημιουργήσεις τον λογαριασμό σου!</p>

            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg w-full text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Όνομα"
                        className="rounded-[10px] border border-stone-300 w-full px-4 sm:px-6 py-3 sm:py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#F15D2A] focus:border-transparent transition"
                        required
                    />
                    <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        placeholder="Επώνυμο"
                        className="rounded-[10px] border border-stone-300 w-full px-4 sm:px-6 py-3 sm:py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#F15D2A] focus:border-transparent transition"
                        required
                    />
                </div>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E-mail"
                    className="rounded-[10px] border border-stone-300 w-full px-4 sm:px-6 py-3 sm:py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#F15D2A] focus:border-transparent transition"
                    required
                />

                <div className="w-full">
                    <PhoneInput
                        country="gr"
                        value={formData.phone_extension + formData.phone}
                        onChange={handlePhoneChange}
                        inputProps={{
                            name: 'phone_full',
                            required: true,
                        }}
                        placeholder="Τηλέφωνο"
                        enableSearch={true}
                        countryCodeEditable={false}
                        searchPlaceholder="Αναζήτηση..."
                        inputClass="!w-full !h-auto !min-h-[56px] !rounded-[10px] !border !border-stone-300 !pl-[70px] !py-3 sm:!py-4 !text-base !font-medium !outline-none focus:!border-transparent focus:!ring-2 focus:!ring-[#F15D2A]"
                        buttonClass="!h-auto !min-h-[56px] !rounded-l-[10px] !border-r-0 !border-stone-300 !bg-white hover:!bg-gray-50 !p-3 !w-[65px]" 
                        dropdownClass="!rounded-[10px] !shadow-xl !max-h-60 !overflow-y-auto"
                        containerClass="!w-full"
                    />
                </div>

                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Διεύθυνση"
                    className="rounded-[10px] border border-stone-300 w-full px-4 sm:px-6 py-3 sm:py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#F15D2A] focus:border-transparent transition"
                    required
                />

                <button
                    type="submit"
                    className="w-full h-14 sm:h-16 bg-[#F15D2A] rounded-[10px] shadow-md text-white text-lg font-bold hover:bg-[#F15D2A]/90 active:bg-[#F15D2A] transition-all duration-200 mt-6"
                >
                    Δημιουργία
                </button>
            </form>
        </div>
    );
};

RegisterPopup.propTypes = {
    handleLoginPopupClose: PropTypes.func.isRequired,
    onSwitchToOtp: PropTypes.func.isRequired,
};