import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// Icons
import * as iconsUtil from "@/utils/icons.util";
// Components
import { QuoteHeader, TravelForm, LoadingSpinner, LoginPopup, RegisterPopup, OtpPopup } from "@/components";
// Hooks
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TravelProceed = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Authentication popup states
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
    const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');

    // Load stored quote data on component mount
    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = () => {
        try {
            const storedData = localStorage.getItem('travelQuoteData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Set the selected quote
                if (parsedData.selectedQuote) {
                    setSelectedQuote(parsedData.selectedQuote);
                } else if (parsedData.quotes && parsedData.quotes.length > 0) {
                    setSelectedQuote(parsedData.quotes[0]);
                }
                // Set user details from the stored data
                setUserDetails(parsedData.userData);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
            setError('Failed to load quote data');
        } finally {
            setIsLoading(false);
        }
    };

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
            <Fragment>
                <QuoteHeader />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-lg font-semibold text-red-600">{error}</div>
                </div>
            </Fragment>
        );
    }

    if (!selectedQuote || !userDetails) {
        return (
            <Fragment>
                <QuoteHeader />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-lg font-semibold">No quote data found</div>
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

            {/* Quote Header Component */}
            <QuoteHeader />

            {/* Horizontal Rule */}
            <hr className="border mx-10 my-1" />

            {/* Main Content */}
            <main className="Inter_font flex flex-col lg:flex-row justify-center items-baseline gap-7 my-10 mx-5">

                {/* Insurance Details Section */}
                <section
                    className="w-full lg:w-auto 2xl:w-[778px] bg-[#FFEFEA] rounded-3xl"
                    style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                >
                    <h1 className="hidden sm:block max-w-[683px] text-2xl sm:text-3xl text-left font-medium m-8">
                        {t("travel_proceed.header.desktop")}
                    </h1>
                    <h1 className="sm:hidden max-w-[683px] text-2xl lg:text-3xl text-left font-medium m-7">
                        {t("travel_proceed.header.mobile")}
                    </h1>

                    <hr className="border border-[#FACABC] mx-5" />

                    <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 sm:px-14">
                        {/* Insurance Company */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.CompanyIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("travel_proceed.insurance_company")}
                                </h1>
                                <h2 className="text-sm sm:text-base">HDI Global Specialty SE</h2>
                            </span>
                        </article>

                        {/* Insurance Period */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.PeriodIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("travel_proceed.insurance_period")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step2.startDate} to {userDetails.step2.endDate}</h2>
                            </span>
                        </article>

                        <hr className="border border-[#FACABC] w-full" />

                        {/* Travel Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.TravellingFromIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("travel_proceed.travelling_from")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step1.fromCountry}</h2>
                            </span>
                        </article>

                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.TravellingToIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("travel_proceed.travelling_to")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step1.toCountry}</h2>
                            </span>
                        </article>

                        <hr className="border border-[#FACABC] w-full" />

                        {/* Traveler Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.TravelerIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("travel_proceed.traveler")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step3.insuredType} ({userDetails.step4.persons.length} {userDetails.step4.persons.length === 1 ? 'person' : 'persons'})</h2>
                            </span>
                        </article>

                        <hr className="border border-[#FACABC] w-full" />

                        {/* Total Amount */}
                        <h1 className="text-2xl sm:text-4xl text-center font-semibold text-secondaryColor w-full">
                            {t("travel_proceed.total")} {selectedQuote.currency || '€'}{selectedQuote.price || "0.00"}
                        </h1>

                        {/* Proceed Button */}
                        <button
                            onClick={openModal}
                            className="text-center sm:text-xl font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
                            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                        >
                            {t("travel_proceed.proceed_button")}
                        </button>
                    </div>
                </section>

                {/* Cover Details Section */}
                <section
                    className="w-full lg:w-auto 2xl:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
                    style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                >
                    <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
                        <h1 className="max-w-[683px] text-2xl lg:text-3xl text-left font-medium">
                            {selectedQuote.name || t("travel_proceed.cover")}
                        </h1>
                        <iconsUtil.DownloadIcon />
                    </div>

                    <hr className="border border-[#FACABC] mx-5" />

                    {/* Cover Details Rows */}
                    <div className="flex justify-around items-center p-5">
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.CancellationIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.cancellation?.text || t("travel_proceed.covers.cancellation")}
                                <span className="font-medium">{selectedQuote.coverage?.cancellation?.value || "2500€"}</span>
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.MedicIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.medical?.text || t("travel_proceed.covers.medical")}
                                <span className="font-medium">{selectedQuote.coverage?.medical?.value || "195€"}</span>
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.BaggageIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.baggage?.text || t("travel_proceed.covers.baggage")}
                                <span className="font-medium">{selectedQuote.coverage?.baggage?.value || "195€"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-around items-center p-5">
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.PersonalAccidentIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.accident?.text || t("travel_proceed.covers.personal_accident")}
                                <span className="font-medium">{selectedQuote.coverage?.accident?.value || "2500€"}</span>
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.TravelDelayIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.delay?.text || t("travel_proceed.covers.travel_delay")}
                                <span className="font-medium">{selectedQuote.coverage?.delay?.value || "195€"}</span>
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.PersonalPossessionsIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.possessions?.text || t("travel_proceed.covers.personal_possessions")}
                                <span className="font-medium">{selectedQuote.coverage?.possessions?.value || "195€"}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-around items-center p-5">
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-28 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.PersonalMoneyIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.money?.text || t("travel_proceed.covers.personal_money")}
                                <span className="font-medium">{selectedQuote.coverage?.money?.value || "2500€"}</span>
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-28 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.PersonalLiabilityIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.liability?.text || t("travel_proceed.covers.personal_liability")}
                                <span className="font-medium">{selectedQuote.coverage?.liability?.value || "195€"}</span>
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-28 vsm:w-auto vsm:max-w-[133px] text-secondaryColor">
                            <iconsUtil.LegalExpensesIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {selectedQuote.coverage?.expenses?.text || t("travel_proceed.covers.legal_expenses")}
                                <span className="font-medium">{selectedQuote.coverage?.expenses?.value || "195€"}</span>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            {/* Modal Component */}
            <TravelForm
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedQuote={selectedQuote}
                userDetails={userDetails}
            />
        </Fragment>
    );
};