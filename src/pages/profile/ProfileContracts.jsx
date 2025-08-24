import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
// Components
import { Header, ProtectedRoute } from "@/components";
// Images
import Symbol from "@/assets/images/icon.png";
// Icons
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

// Styles for all inputs
const styles = {
    buttonStyle: "w-full h-14 vsm:h-16 rounded-[10px] border-2 hover:bg-secondaryColor hover:text-white border-secondaryColor bg-primaryColor text-secondaryColor text-xs tiny:text-base sm:text-lg font-bold transition_all active:scale-105"
};

export const ProfileContracts = () => {
    const { t } = useTranslation();
    const [activeButton, setActiveButton] = useState("active"); // State to track the active button
    const [productButton, setProductButton] = useState(null); // State to track the product button clicked

    // Function to handle button click
    const handleButtonClick = (buttonType) => {
        setActiveButton(buttonType);
    };

    // Function to handle product button click
    const handleProductButtonClick = (buttonName) => {
        setProductButton(buttonName);
    };

    return (
        <ProtectedRoute>
            <Fragment>
                <Header />

                {/* Hero Section */}
                <section
                    className="flex flex-col justify-center items-center bg-primaryBgColor text-center m-6 lg:mx-20 rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12"
                    style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
                >
                    {/* Hero Section Logo */}
                    <img data-aos="fade-in" src={Symbol} alt="Go Digital Icon" className="w-[100px] md:w-[199px]" />
                    {/* User Name */}
                    <h1 className="max-w-[806px] mx-5 tiny:text-2xl vsm:text-4xl md:text-5xl font-semibold vsm:leading-[51.96px] md:leading-[81.96px]">Mohamed Mohamed</h1>
                </section>

                <section className="flex justify-center gap-3 vsm:gap-5 items-center m-6 lg:mx-20">
                    <button
                        className={`w-full h-14 sm:h-[65px] rounded-[10px] text-xs tiny:text-base sm:text-lg font-bold mt-5 transition_all active:scale-105 ${activeButton === "active" ? "bg-secondaryColor text-primaryColor" : "bg-[#C3C3C3] text-primaryColor"
                            }`}
                        onClick={() => handleButtonClick("active")}
                    >
                        {t('profile_contracts_page.buttons.active_contracts')}
                    </button>
                    <button
                        className={`w-full h-14 sm:h-[65px] rounded-[10px] text-xs tiny:text-base sm:text-lg font-bold mt-5 transition_all active:scale-105 ${activeButton === "inactive" ? "bg-secondaryColor text-primaryColor" : "bg-[#C3C3C3] text-primaryColor"
                            }`}
                        onClick={() => handleButtonClick("inactive")}
                    >
                        {t('profile_contracts_page.buttons.inactive_contracts')}
                    </button>
                </section>

                {/* Button Product Section */}
                {productButton ? (
                    <section className="flex flex-col justify-center items-center text-center my-5 m-6 lg:mx-20">
                        <h2 className="text-4xl my-5 font-bold text-secondaryColor">{productButton}</h2>
                        <div className="w-full bg-[#FDE5DE] rounded-[15px]">
                            <article
                                className="flex justify-between items-center text-xl font-semibold text-secondaryColor p-5 rounded-t-[15px]"
                                style={{ boxShadow: "0px -2px 4px 0px rgba(65, 72, 225, 0.15)" }}
                            >
                                <p>{t('profile_contracts_page.contract_dates')}</p>
                                <Link to="/profile-contract/details" className="flex justify-center items-center gap-5">
                                    {t('profile_contracts_page.view_button')}
                                    <Icons.ViewIcon />
                                </Link>
                            </article>
                            <article
                                className="flex justify-between bg-white items-center text-xl font-semibold text-secondaryColor p-5 rounded-[15px]"
                                style={{ boxShadow: "0px -2px 4px 0px rgba(65, 72, 225, 0.15)" }}
                            >
                                <p>{t('profile_contracts_page.contract_dates')}</p>
                                <Link to="/profile-contract/details" className="flex justify-center items-center gap-5">
                                    {t('profile_contracts_page.view_button')}
                                    <Icons.ViewIcon />
                                </Link>
                            </article>
                        </div>
                    </section>
                ) : (
                    <section className="flex flex-col justify-center items-center gap-5 my-5 m-6 lg:mx-20">
                        <button className={styles.buttonStyle} onClick={() => handleProductButtonClick(t('profile_contracts_page.products.travel'))}>
                            {t('profile_contracts_page.products.travel')}
                        </button>
                        <button
                            className={styles.buttonStyle}
                            onClick={() => handleProductButtonClick(t('profile_contracts_page.products.intermediaries_liability'))}
                        >
                            {t('profile_contracts_page.products.intermediaries_liability')}
                        </button>
                        {/* Contact Button */}
                        <button
                            className="w-44 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] text-xs tiny:text-base sm:text-lg font-bold mt-5 border-2 border-secondaryColor bg-primaryColor text-secondaryColor hover:bg-secondaryColor hover:text-white transition_all active:scale-105"
                            style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                        >
                            {t('profile_contracts_page.buttons.contact')}
                        </button>
                    </section>
                )}
            </Fragment>
        </ProtectedRoute>
    );
};