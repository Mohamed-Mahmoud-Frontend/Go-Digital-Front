import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// Icons
import * as iconsUtil from "@/utils/icons.util";
// Components
import { QuoteHeader, LoginPopup, RegisterPopup, OtpPopup } from "@/components";
// Hooks
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "../../ui/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const GuaranteeProceed = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isAcceptingQuote, setIsAcceptingQuote] = useState(false);
    // Success modal state
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Authentication popup states
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
    const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');

    // Fetch quotes from API
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                // Get guarantee data from localStorage
                const guaranteeData = localStorage.getItem('guaranteeData');
                if (!guaranteeData) {
                    setError('No guarantee data found. Please go back and complete the form.');
                    setIsLoading(false);
                    return;
                }

                const data = JSON.parse(guaranteeData);

                const response = await fetch(`${API_BASE_URL}/user/bondInsurance/getQuotes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': i18n.language
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch quotes');
                }

                const responseData = await response.json();
                setQuotes(responseData.quotes || []);

                // Set the first quote as selected by default
                if (responseData.quotes && responseData.quotes.length > 0) {
                    setSelectedQuote(responseData.quotes[0]);
                }
            } catch (error) {
                console.error('Error fetching quotes:', error);
                setError('Failed to fetch quotes. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuotes();
    }, [i18n.language]);

    const handleLoginPopupClose = () => {
        setIsLoginPopupOpen(false);
        setIsRegisterPopupOpen(false);
        setIsOtpPopupOpen(false);
    };

    const handleSwitchToRegister = () => {
        setIsLoginPopupOpen(false);
        setIsRegisterPopupOpen(true);
        setIsOtpPopupOpen(false);
    };

    const handleSwitchToLogin = () => {
        setIsRegisterPopupOpen(false);
        setIsOtpPopupOpen(false);
        setIsLoginPopupOpen(true);
    };

    const handleSwitchToOtp = (email) => {
        setIsRegisterPopupOpen(false);
        setIsLoginPopupOpen(false);
        setIsOtpPopupOpen(true);
        setOtpEmail(email);
    };

    // Success modal handlers
    const openSuccessModal = () => {
        setIsSuccessModalOpen(true);
    };

    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        // Navigate to home page when modal is closed
        navigate('/');
    };

    const handleAcceptQuote = async () => {
        if (!isAuthenticated) {
            setIsLoginPopupOpen(true);
            return;
        }

        if (!selectedQuote) {
            setError('Please select a quote first.');
            return;
        }

        try {
            setIsAcceptingQuote(true);

            // Get guarantee data from localStorage
            const guaranteeData = localStorage.getItem('guaranteeData');
            if (!guaranteeData) {
                throw new Error('No guarantee data found');
            }

            const data = JSON.parse(guaranteeData);

            // Prepare the accept quote request
            const acceptData = {
                ...data,
                plan_id: selectedQuote.id,
                plan_duration: selectedQuote.duration
            };

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/user/bondInsurance/acceptQuote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify(acceptData)
            });

            if (!response.ok) {
                throw new Error('Failed to accept quote');
            }

            const responseData = await response.json();

            if (responseData.status) {
                // Show success modal instead of navigating
                openSuccessModal();
            } else {
                throw new Error('Quote acceptance failed');
            }
        } catch (error) {
            console.error('Error accepting quote:', error);
            setError('Failed to accept quote. Please try again.');
        } finally {
            setIsAcceptingQuote(false);
        }
    };

    // Listen for login success to automatically accept quote
    useEffect(() => {
        const handleLoginSuccess = async () => {
            if (isAuthenticated && selectedQuote) {
                // Auto-accept quote after successful login
                await handleAcceptQuote();
            }
        };

        window.addEventListener('loginSuccess', handleLoginSuccess);
        return () => {
            window.removeEventListener('loginSuccess', handleLoginSuccess);
        };
    }, [isAuthenticated, selectedQuote]);

    if (isLoading) {
        return (
            <Fragment>
                <QuoteHeader />
                <div className="flex justify-center items-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </Fragment>
        );
    }

    if (error) {
        return (
            <Fragment>
                <QuoteHeader />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-lg font-semibold text-red-600">{error}</div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            {/* Authentication Popups */}
            {isLoginPopupOpen && (
                <div className="fixed flex items-center justify-center top-0 left-0 w-full h-full bg-black bg-opacity-30 z-50">
                    <LoginPopup
                        handleLoginPopupClose={handleLoginPopupClose}
                        onSwitchToRegister={handleSwitchToRegister}
                        onSwitchToOtp={handleSwitchToOtp}
                    />
                </div>
            )}

            {isRegisterPopupOpen && (
                <div className="fixed flex items-center justify-center top-0 left-0 w-full h-full bg-black bg-opacity-30 z-50">
                    <RegisterPopup
                        handleLoginPopupClose={handleLoginPopupClose}
                        onSwitchToOtp={handleSwitchToOtp}
                    />
                </div>
            )}

            {isOtpPopupOpen && (
                <div className="fixed flex items-center justify-center top-0 left-0 w-full h-full bg-black bg-opacity-30 z-50">
                    <OtpPopup
                        handleLoginPopupClose={handleLoginPopupClose}
                        email={otpEmail}
                        onSwitchToLogin={handleSwitchToLogin}
                    />
                </div>
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
                    <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg mx-5 text-center px-5">
                        {/* Close button */}
                        <button onClick={closeSuccessModal} className="absolute top-4 right-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="11.5" fill="white" stroke="#C3C3C3" />
                                <path
                                    d="M16.8536 7.14642C16.6584 6.95119 16.3418 6.95119 16.1466 7.14642L12.5 10.793L8.85341 7.14642C8.65819 6.95119 8.34165 6.95119 8.14642 7.14642C7.95119 7.34165 7.95119 7.65819 8.14642 7.85341L11.793 11.5L8.14643 15.1466C7.9512 15.3418 7.9512 15.6583 8.14643 15.8536C8.34166 16.0488 8.6582 16.0488 8.85342 15.8536L12.5 12.207L16.1466 15.8536C16.3418 16.0488 16.6584 16.0488 16.8536 15.8536C17.0488 15.6583 17.0488 15.3418 16.8536 15.1466L13.207 11.5L16.8536 7.85341C17.0488 7.65819 17.0488 7.34165 16.8536 7.14642Z"
                                    fill="#F15B2E"
                                />
                            </svg>
                        </button>

                        <div className="flex flex-col justify-center items-center my-8 text-center">
                            <iconsUtil.QuoteSmileIcon />
                            <h1 className="my-4 text-2xl font-bold text-primaryBgColor">
                                {t("guarantee_proceed.success_modal.title") || "Τελευταίο Βήμα!"}
                            </h1>
                            <h2 className="max-w-[365.75px] font-semibold text-primaryBgColor mx-auto">
                                {t("guarantee_proceed.success_modal.message") || "Η αίτησή σας έχει υποβληθεί επιτυχώς! Θα επικοινωνήσουμε μαζί σας σύντομα."}
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Header Component */}
            <QuoteHeader />

            {/* Horizontal Rule */}
            <hr className="border mx-10 my-1" />

            {/* Main Content */}
            <main className="Inter_font flex justify-center items-baseline gap-7 my-10 mx-5">
                {/* Quote Details Section */}
                <section
                    className="relative w-full lg:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
                    style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                >
                    <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
                        <h1 className="max-w-[683px] text-xl sm:text-2xl lg:text-3xl text-left font-medium">
                            {selectedQuote?.name || t("guarantee_proceed.header")}
                        </h1>
                        <iconsUtil.DownloadIcon />
                    </div>

                    <hr className="border border-[#FACABC] mx-5" />

                    {/* Quote Details */}
                    <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8">
                        <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start w-full">
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-secondaryColor">
                                        Description:
                                    </h2>
                                    <p className="text-base text-gray-700">
                                        {selectedQuote?.description}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-secondaryColor">
                                        Duration:
                                    </h2>
                                    <p className="text-base text-gray-700">
                                        {selectedQuote?.duration} month(s)
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="absolute -bottom-36 p-5 w-full bg-white border-none">
                        {/* Accept Button */}
                        <button
                            onClick={handleAcceptQuote}
                            disabled={isAcceptingQuote}
                            className="text-center sm:text-xl pt-2 font-bold bg-secondaryColor hover:bg-secondaryColor/70 disabled:bg-gray-400 text-white rounded-[30px] py-3 w-full transition-all"
                            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                        >
                            {isAcceptingQuote ? 'Processing...' : (t("guarantee_proceed.accept_button") || "Accept Quote")}
                        </button>
                    </div>
                </section>

                {/* Quote Selection Section */}
                {
                    quotes.length > 1 && (
                        <section className="w-full lg:w-[400px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE] p-6">
                            <h2 className="text-xl font-semibold text-secondaryColor mb-4">
                                {t("guarantee_proceed.select_quote") || "Select Quote"}
                            </h2>
                            <div className="space-y-3">
                                {quotes.map((quote) => (
                                    <div
                                        key={quote.id}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedQuote?.id === quote.id
                                            ? "border-secondaryColor bg-white"
                                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                                            }`}
                                        onClick={() => setSelectedQuote(quote)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-secondaryColor">
                                                    {quote.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Duration: {quote.duration} month(s)
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {quote.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                }
            </main >
        </Fragment >
    );
};