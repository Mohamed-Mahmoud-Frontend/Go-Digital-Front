import { ClosePopUpIcon } from '@/utils/icons.util';
import { PropTypes } from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RegisterPopup = ({ handleLoginPopupClose, onSwitchToOtp }) => {
    const { i18n } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        surname: '',
        phone: '',
        phone_extension: '30', // Default to Greece
        address: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors

        try {
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({
                    ...formData,
                    phone: formData.phone_extension + formData.phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error messages from the API
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

            // Registration successful, switch to OTP verification
            onSwitchToOtp(formData.email);
        } catch (error) {
            console.error('Registration error:', error);
            setError('Συνέβη κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
        }
    };

    return (
        <div className="py-9 px-24 max-w-[890px] w-full relative bg-[#F1EEEC] rounded-[39px]">
            <span className="absolute top-9 right-8 w-6" onClick={() => handleLoginPopupClose(false)}>
                <ClosePopUpIcon />
            </span>

            <h2 className="text-center justify-start text-black text-4xl font-semibold max-w-[430px] mx-auto">Λογαριασμός</h2>
            <h3 className="text-2xl font-bold mt-10 px-2">Δημιουργία Λογαριασμού</h3>
            <p className="text-lg font-medium mt-2 px-2">Συμπλήρωσε τα στοιχεία σου για να δημιουργήσεις τον λογαριασμό σου!</p>

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center items-end mt-4">
                <span className="flex gap-6 w-full">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Όνομα"
                        className="rounded-[10px] border border-stone-300 w-full px-8 py-5"
                    />
                    <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        placeholder="Επώνυμο"
                        className="rounded-[10px] border border-stone-300 w-full px-8 py-5"
                    />
                </span>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E-mail"
                    className="rounded-[10px] border border-stone-300 w-full px-8 py-5"
                />

                <span className="flex gap-4 w-full">
                    <input
                        type="text"
                        name="phone_extension"
                        value={formData.phone_extension}
                        onChange={handleInputChange}
                        placeholder="+30 (Greece)"
                        className="rounded-[10px] border border-stone-300 text-[#707070] w-full max-w-32 text-center py-5"
                    />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Τηλέφωνο"
                        className="rounded-[10px] border border-stone-300 w-full px-8 py-5"
                    />
                </span>

                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Διεύθυνση"
                    className="rounded-[10px] border border-stone-300 w-full px-8 py-5"
                />

                <div className="mt-6 w-full">
                    <button
                        type="submit"
                        className="w-full h-16 bg-[#F15D2A] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] text-white text-lg font-bold mt-6 hover:bg-[#F15D2A]/80 transition-all duration-300"
                    >
                        Δημιουργία
                    </button>
                </div>
            </form>
        </div>
    )
}

RegisterPopup.propTypes = {
    handleLoginPopupClose: PropTypes.func.isRequired,
    onSwitchToOtp: PropTypes.func.isRequired,
}