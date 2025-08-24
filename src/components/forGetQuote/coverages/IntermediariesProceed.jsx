import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// Icons
import * as iconsUtil from "@/utils/icons.util";
// Components
import { QuoteHeader, IntermediariesForm, LoadingSpinner } from "@/components";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const IntermediariesProceed = () => {
    const { t, i18n } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Load stored quote data on component mount
    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = () => {
        try {
            const storedData = localStorage.getItem('intermediariesQuoteData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Set the first quote as selected (you can modify this logic as needed)
                if (parsedData.quotes && parsedData.quotes.length > 0) {
                    setSelectedQuote(parsedData.quotes[0]);
                }
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
            setError('Failed to load quote data');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user is authenticated and fetch user details
    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Fetch user details from the /user/details endpoint
                const response = await fetch(`${API_BASE_URL}/user/details`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept-Language': i18n.language
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUserDetails(userData);
                } else {
                    // Set basic user details if API call fails
                    setUserDetails({
                        identification: "",
                        first_name: "",
                        last_name: "",
                        email: "",
                        mobile_extension: "",
                        mobile_number: "",
                        phone_extension: "",
                        phone_number: "",
                        address: "",
                        tin: "",
                        tax_office: "",
                        chamber: "",
                        licence_number: ""
                    });
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                // Set basic user details on error
                setUserDetails({
                    identification: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    mobile_extension: "",
                    mobile_number: "",
                    phone_extension: "",
                    phone_number: "",
                    address: "",
                    tin: "",
                    tax_office: "",
                    chamber: "",
                    licence_number: ""
                });
            }
        }
    };

    const openModal = () => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            // Show authentication popup (you can implement this based on your auth system)
            alert('Please login to proceed');
            return;
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

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

    if (!selectedQuote) {
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
                        <h1 className="max-w-[683px] text-xl sm:text-2xl lg:text-3xl font-medium text-left">
                            {selectedQuote.name || t("intermediaries_proceed.header")}
                        </h1>
                        <iconsUtil.DownloadIcon />
                    </div>

                    <hr className="border border-[#FACABC] mx-5" />

                    {/* Cover Details Rows */}
                    <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8">
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
                                    {coverageItem.description && coverageItem.description.length > 0 && (
                                        <div className="text-sm sm:text-base">
                                            {coverageItem.description.map((desc, descIndex) => (
                                                <p key={descIndex} className="mb-1">{desc}</p>
                                            ))}
                                        </div>
                                    )}
                                </span>
                            </article>
                        ))}
                    </div>

                    <div className="absolute -bottom-36 p-5 w-full bg-white border-none">
                        {/* Total Amount */}
                        <h1 className="text-2xl py-2 sm:text-4xl text-center font-semibold text-secondaryColor w-full">
                            {t("intermediaries_proceed.total")} {selectedQuote.currency || '€'}{selectedQuote.price || "175.00"}
                        </h1>

                        {/* Proceed Button */}
                        <button
                            onClick={openModal}
                            className="text-center sm:text-xl font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
                            style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                        >
                            {t("intermediaries_proceed.proceed_button")}
                        </button>
                    </div>
                </section>
            </main>
            {/* Modal Component */}
            <IntermediariesForm
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedQuote={selectedQuote}
                userDetails={userDetails}
            />
        </Fragment>
    );
};