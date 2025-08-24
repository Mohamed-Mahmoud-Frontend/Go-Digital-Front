import { useState, useRef, useEffect } from 'react';
import { ClosePopUpIcon } from '@/utils/icons.util';
import { PropTypes } from 'prop-types';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const OtpPopup = ({ handleLoginPopupClose, email }) => {
    const { i18n } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    // Auto focus first input when component mounts
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple characters
        setError(''); // Clear error when user types

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        // If all digits are filled, verify OTP
        if (newOtp.every(digit => digit !== '') && index === 5) {
            verifyOtp(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            // Focus the next empty input or the last one if all are filled
            const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
            if (nextEmptyIndex !== -1) {
                inputRefs.current[nextEmptyIndex].focus();
            } else {
                inputRefs.current[5].focus();
            }
            // Verify OTP if all digits are pasted
            if (pastedData.length === 6) {
                verifyOtp(pastedData);
            }
        }
    };

    const verifyOtp = async (otpCode) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({
                    email,
                    otp: otpCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    setError('Λανθασμένος κωδικός OTP. Παρακαλώ δοκιμάστε ξανά.');
                } else if (response.status === 401) {
                    setError('Μη έγκυρη σύνδεση. Παρακαλώ δοκιμάστε ξανά.');
                } else {
                    setError(data.message || 'Συνέβη κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
                }
                // Clear OTP on error
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
                return;
            }

            // Verify we have the token
            if (!data || !data.token) {
                setError('Λανθασμένα δεδομένα από τον διακομιστή. Παρακαλώ δοκιμάστε ξανά.');
                return;
            }

            // Store the JWT token in localStorage
            localStorage.setItem('token', data.token);
            // Store user email for display
            localStorage.setItem('user', JSON.stringify({ email }));

            // Dispatch login success event to update auth state
            window.dispatchEvent(new CustomEvent('loginSuccess'));

            // Close the popup - the auth state will update automatically
            handleLoginPopupClose();
        } catch (error) {
            console.error('OTP verification error:', error);
            setError('Συνέβη κάποιο σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/user/getOTP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to resend OTP');
            }

            // Clear OTP fields
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError('Αποτυχία επαναποστολής κωδικού. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-9 px-24 max-w-[890px] w-full relative bg-[#F1EEEC] rounded-[39px]">
            <span className="absolute top-9 right-8 w-6" onClick={() => handleLoginPopupClose(false)}>
                <ClosePopUpIcon />
            </span>

            <h2 className="text-center justify-start text-black text-4xl font-semibold max-w-[430px] mx-auto">Λογαριασμός</h2>
            <h3 className="text-2xl font-bold mt-28 px-2">Σου ήρθε ο μοναδικός κωδικός!</h3>
            <p className="text-lg font-medium mt-2 px-2">Συμπλήρωσε τον εξαψήφιο κωδικό που σου ήρθε στο E-mail για να κάνεις Log In στον λογαριασμό σου.</p>

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3 justify-center items-end mt-8">
                <div className="flex gap-4 justify-center">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={isLoading}
                            className="w-full h-28 text-center text-2xl font-bold rounded-[10px] border border-stone-300 focus:border-[#F15D2A] focus:outline-none disabled:opacity-50"
                            autoComplete="off"
                        />
                    ))}
                </div>
                <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-lg hover:text-[#F15D2A] transition-all duration-300 underline disabled:opacity-50"
                >
                    Επαναποστολή Κωδικού
                </button>
            </div>

            <div className="mt-20">
                <button
                    onClick={() => handleLoginPopupClose(false)}
                    className="w-full h-16 bg-[#333132] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] text-white text-lg font-bold mt-6 hover:bg-[#333132]/80 transition-all duration-300"
                >
                    Διόρθωση E-mail
                </button>
            </div>
        </div>
    )
}

OtpPopup.propTypes = {
    handleLoginPopupClose: PropTypes.func.isRequired,
    email: PropTypes.string.isRequired,
}