import { ClosePopUpIcon } from '@/utils/icons.util';
import { PropTypes } from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const LoginPopup = ({ handleLoginPopupClose, onSwitchToRegister, onSwitchToOtp }) => {
    const { i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/user/getOTP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Το email δεν βρέθηκε. Παρακαλώ ελέγξτε το email σας ή δημιουργήστε νέο λογαριασμό.');
                } else {
                    setError(data.message || 'Συνέβη κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
                }
                return;
            }

            // Email found, switch to OTP verification
            onSwitchToOtp(email);
        } catch (error) {
            console.error('Login error:', error);
            setError('Συνέβη κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-9 px-24 max-w-[890px] w-full relative bg-[#F1EEEC] rounded-[39px]">
            <span className="absolute top-9 right-8 w-6" onClick={() => handleLoginPopupClose(false)}>
                <ClosePopUpIcon />
            </span>

            <h2 className="text-center justify-start text-black text-4xl font-semibold max-w-[430px] mx-auto">Είσοδος στον λογαριασμό σου</h2>
            <h3 className="text-2xl font-bold mt-10 px-2">Είσαι υφιστάμενος πελάτης ή έχεις λογαριασμό;</h3>
            <p className="text-lg font-medium mt-2 px-2">Πρόσθεσε τη διεύθυνση ηλεκτρονικού ταχυδρομείου που είναι καταχωρημένος στον λογαριασμό σου και θα λάβεις έναν εξαψήφιο κωδικό για να συνδεθείς με ασφάλεια.</p>

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 justify-center items-end mt-4">
                <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="E-mail"
                    className="rounded-[10px] border border-stone-300 w-full px-8 py-5"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-52 h-16 bg-[#F15D2A] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] text-white text-lg font-bold hover:bg-[#F15D2A]/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Φόρτωση...' : 'Επόμενο'}
                </button>
            </form>

            <div className="mt-6">
                <h3 className="text-2xl font-bold">Δεν έχεις λογαριασμο;</h3>
                <p className="text-lg font-medium mt-1">Μην ανησυχείς! Κάνε κλικ πιο κάτω και δημιούργησε τον λογαριασμό σου σε 1 λεπτό!</p>
                <button
                    onClick={onSwitchToRegister}
                    className="w-full h-16 bg-[#333132] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] text-white text-lg font-bold mt-6 hover:bg-[#333132]/80 transition-all duration-300"
                >
                    Δημιουργία Λογαριασμού
                </button>
            </div>
        </div>
    )
}

LoginPopup.propTypes = {
    handleLoginPopupClose: PropTypes.func.isRequired,
    onSwitchToRegister: PropTypes.func.isRequired,
    onSwitchToOtp: PropTypes.func.isRequired,
}