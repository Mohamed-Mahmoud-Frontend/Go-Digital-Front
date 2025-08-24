import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// Icons
import * as iconsUtil from "@/utils/icons.util";
// Components
import { QuoteHeader, LiabilityForm, LoginPopup, RegisterPopup, OtpPopup } from "@/components";
// Hooks
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "../../ui/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const LiabilityProceed = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);

    // Authentication popup states
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
    const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [userDetails, setUserDetails] = useState(null);

    // Fetch quotes from API
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                // Get vehicles data from localStorage
                const vehiclesData = localStorage.getItem('liabilityVehicles');
                if (!vehiclesData) {
                    setError('No vehicles data found. Please go back and add vehicles.');
                    setIsLoading(false);
                    return;
                }

                const vehicles = JSON.parse(vehiclesData);

                const response = await fetch(`${API_BASE_URL}/user/transportOperators/getQuotes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': i18n.language
                    },
                    body: JSON.stringify({
                        vehicles: vehicles
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch quotes');
                }

                const data = await response.json();
                setQuotes(data.quotes || []);

                // Set the first quote as selected by default
                if (data.quotes && data.quotes.length > 0) {
                    setSelectedQuote(data.quotes[0]);
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

    // Fetch user details if authenticated
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
            setUserDetails(data);
            return data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw error;
        }
    };

    const handleLoginPopupClose = () => {
        setIsLoginPopupOpen(false);
        setIsRegisterPopupOpen(false);
        setIsOtpPopupOpen(false);
        // The auth state will update automatically via the loginSuccess event
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

    const openModal = async () => {
        if (isAuthenticated) {
            // User is authenticated, fetch user details and open form
            try {
                await fetchUserDetails();
                setIsModalOpen(true);
            } catch (error) {
                console.error('Failed to fetch user details:', error);
                // If fetching user details fails, show login popup
                setIsLoginPopupOpen(true);
            }
        } else {
            // User is not authenticated, show login popup
            setIsLoginPopupOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Listen for login success to automatically open the form
    useEffect(() => {
        const handleLoginSuccess = async () => {
            if (isAuthenticated && !isModalOpen) {
                try {
                    await fetchUserDetails();
                    setIsModalOpen(true);
                } catch (error) {
                    console.error('Failed to fetch user details after login:', error);
                }
            }
        };

        window.addEventListener('loginSuccess', handleLoginSuccess);
        return () => {
            window.removeEventListener('loginSuccess', handleLoginSuccess);
        };
    }, [isAuthenticated, isModalOpen]);

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
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg font-semibold text-red-600">{error}</div>
            </div>
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

            {/* Quote Header Component */}
            <QuoteHeader />

            {/* Horizontal Rule */}
            <hr className="border mx-10 my-1" />

            {/* Main Content */}
            <main className="Inter_font flex justify-center items-baseline gap-7 my-10 mx-5">
                {/* Cover Details Section */}
                <section
                    className="relative w-full lg:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
                    style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                >
                    <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
                        <h1 className="max-w-[683px] text-xl sm:text-2xl lg:text-3xl text-left font-medium">
                            {selectedQuote?.name || t("liability_proceed.header")}
                        </h1>
                        <iconsUtil.DownloadIcon />
                    </div>

                    <hr className="border border-[#FACABC] mx-5" />

                    {/* Cover Details Rows */}
                    <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8">
                        {selectedQuote?.covers?.map((cover, index) => (
                            <article key={index} className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                                <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                                    {cover.limit}
                                </p>
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                        {cover.name}
                                    </h1>
                                    <h2 className="text-sm sm:text-base">
                                        {cover.description}
                                    </h2>
                                </span>
                            </article>
                        ))}
                    </div>

                    <div className="absolute -bottom-36 p-5 w-full bg-white border-none">
                        {/* Total Amount */}
                        <h1 className="text-2xl py-2 sm:text-4xl text-center font-semibold text-secondaryColor w-full">
                            {t("liability_proceed.total")} {selectedQuote?.currency}{selectedQuote?.price?.toFixed(2)}
                        </h1>

                        {/* Proceed Button */}
                        <button
                            onClick={openModal}
                            className="text-center sm:text-xl pt-2 font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
                            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                        >
                            {t("liability_proceed.proceed_button")}
                        </button>
                    </div>
                </section>

                {/* Quote Selection Section */}
                {quotes.length > 1 && (
                    <section className="w-full lg:w-[400px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE] p-6">
                        <h2 className="text-xl font-semibold text-secondaryColor mb-4">
                            {t("liability_proceed.select_quote") || "Select Quote"}
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
                                                Duration: {quote.duration} months
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-secondaryColor">
                                                {quote.currency}{quote.price?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Modal Component */}
            <LiabilityForm
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedQuote={selectedQuote}
                userDetails={userDetails}
            />
        </Fragment>
    );
};