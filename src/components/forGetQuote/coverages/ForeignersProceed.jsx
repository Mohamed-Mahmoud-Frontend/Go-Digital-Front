import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// Icons
import * as iconsUtil from "@/utils/icons.util";
// Components
import { QuoteHeader, ForeignersForm, LoadingSpinner, LoginPopup, RegisterPopup, OtpPopup } from "@/components";
// Hooks
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ForeignersProceed = () => {
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
            const storedData = localStorage.getItem('foreignersQuoteData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Set the first quote as selected (you can modify this logic as needed)
                if (parsedData.quotes && parsedData.quotes.length > 0) {
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
                    <h1 className="max-w-[683px] vsm:text-xl sm:text-3xl text-left font-medium m-8">
                        {t("foreigners_proceed.header")}
                    </h1>
                    <hr className="border border-[#FACABC] mx-5" />

                    <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 sm:px-14">
                        {/* Insurance Company */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.CompanyIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.insurance_company")}
                                </h1>
                                <h2 className="text-sm sm:text-base">HDI Global Specialty SE</h2>
                            </span>
                        </article>
                        <hr className="border border-[#FACABC] w-full" />

                        {/* Insurance Period */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.PeriodIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.insurance_period")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step4.insurancePeriod}</h2>
                            </span>
                        </article>
                        <hr className="border border-[#FACABC] w-full" />

                        {/* Insured Person Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.PersonIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.insured_person")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step1.firstName} {userDetails.step1.lastName}</h2>
                            </span>
                        </article>
                        <hr className="border border-[#FACABC] w-full" />

                        {/* Nationality Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.TravellingToIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.nationality")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step2.nationality}</h2>
                            </span>
                        </article>
                        <hr className="border border-[#FACABC] w-full" />

                        {/* Identity Card/Passport Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.IDIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.id_passport")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step2.identification}</h2>
                            </span>
                        </article>
                        <hr className="border border-[#FACABC] w-full" />

                        {/* Birth Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.CakeIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.birth_date")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step3.birthday}</h2>
                            </span>
                        </article>
                        <hr className="border border-[#FACABC] w-full" />

                        {/* Gender Details */}
                        <article className="flex gap-4 vsm:gap-7 items-center">
                            <iconsUtil.GenderIcon />
                            <span>
                                <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                    {t("foreigners_proceed.gender")}
                                </h1>
                                <h2 className="text-sm sm:text-base">{userDetails.step3.gender}</h2>
                            </span>
                        </article>
                    </div>
                </section>

                {/* Cover Details Section */}
                <section
                    className="relative w-full lg:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
                    style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                >
                    <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
                        <h1 className="max-w-[683px] text-xl sm:text-2xl lg:text-3xl text-center font-medium">
                            {selectedQuote.name || t("foreigners_proceed.cover")}
                        </h1>
                        <iconsUtil.DownloadIcon />
                    </div>

                    <hr className="border border-[#FACABC] mx-5" />

                    {/* Cover Details Rows */}
                    <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 xl:pt-28 xl:max-h-[705px] xl:overflow-y-scroll overflow-x-hidden">
                        {/* Display coverage items from API */}
                        {selectedQuote.coverage && selectedQuote.coverage.map((coverageItem, index) => (
                            <article key={index} className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start w-full">
                                <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">
                                    {coverageItem.limit ? `${coverageItem.limit}${coverageItem.currency || ''}` : 'Included'}
                                </p>
                                <span className="flex-1">
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">
                                        {Array.isArray(coverageItem.name) ? coverageItem.name[0] : coverageItem.name}
                                    </h1>
                                    {coverageItem.description && Array.isArray(coverageItem.description) && coverageItem.description.length > 0 && (
                                        <div className="text-sm sm:text-base">
                                            {coverageItem.description.map((desc, descIndex) => (
                                                <p key={descIndex} className="mb-1">{desc}</p>
                                            ))}
                                        </div>
                                    )}
                                    {coverageItem.description && !Array.isArray(coverageItem.description) && (
                                        <div className="text-sm sm:text-base">
                                            <p className="mb-1">{coverageItem.description}</p>
                                        </div>
                                    )}
                                </span>
                            </article>
                        ))}
                    </div>

                    {/* Proceed Button */}
                    <div className="absolute -bottom-36 p-5 w-full bg-white border-none">
                        <h1 className="text-2xl py-2 sm:text-4xl text-center font-semibold text-secondaryColor w-full">
                            {t("foreigners_proceed.total")} {selectedQuote.currency || '€'}{selectedQuote.price || "175.00"}
                        </h1>
                        <button
                            onClick={openModal}
                            className="text-center sm:text-xl font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
                            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                        >
                            {t("foreigners_proceed.proceed_button")}
                        </button>
                    </div>
                </section>
            </main>

            {/* Modal Component */}
            <ForeignersForm
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedQuote={selectedQuote}
                userDetails={userDetails}
            />
        </Fragment>
    );
};