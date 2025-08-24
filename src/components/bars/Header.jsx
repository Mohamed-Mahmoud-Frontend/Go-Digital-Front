import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { LoginPopup, RegisterPopup, OtpPopup } from '../../components';
// Icons
import * as Icons from "@/utils/icons.util";
// Image
import Logo from "@/assets/images/logo.png";
// Hooks
import { useAuth } from "@/hooks/useAuth";

// Define routes for each link
const routes = {
    home: "/",
    products: "/products",
    blog: "/blog",
    contact: "/contact",
};

// Submenu items for "products"
const productSubmenu = [
    { key: "travel", path: "/products/travel" },
    { key: "guarantees", path: "/products/guarantees" },
    { key: "roadCarrier", path: "/products/road-carrier-professional-liability" },
    { key: "medicalForeigners", path: "/products/medical-insurance-foreigners" },
    { key: "liabilityIntermediaries", path: "/products/professional-liability-insurance-intermediaries" },
];

export const Header = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const submenuRef = useRef(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu visibility
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false); // Submenu visibility
    const [active, setActive] = useState(""); // State for active menu item
    const [activeSubmenu, setActiveSubmenu] = useState(""); // State for active submenu item
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
    const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');

    // Toggle the mobile menu visibility
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Toggle submenu visibility
    const toggleSubmenu = () => {
        setIsSubmenuOpen(!isSubmenuOpen);
    };

    // Close submenu when a submenu item is clicked
    const handleSubmenuItemClick = () => {
        setIsSubmenuOpen(false);
    };

    // Close submenu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (submenuRef.current && !submenuRef.current.contains(event.target)) {
                setIsSubmenuOpen(false);
            }
        };

        if (isSubmenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSubmenuOpen]);

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

    // Change language between English and Greek
    const changeLanguage = () => {
        const newLang = i18n.language === 'en' ? 'el' : 'en';
        i18n.changeLanguage(newLang);
    };

    // Update `active` state based on current location
    useEffect(() => {
        // Check if current path matches any of the main routes
        const currentRoute = Object.keys(routes).find(
            (key) => routes[key] === location.pathname
        );

        // Check if current path matches any product submenu item
        const activeSubItem = productSubmenu.find(
            (item) => item.path === location.pathname
        );

        if (activeSubItem) {
            setActive("products"); // Highlight main menu
            setActiveSubmenu(activeSubItem.key); // Highlight the submenu item
        } else if (currentRoute) {
            setActive(currentRoute);
            setActiveSubmenu(""); // Clear submenu highlight
        } else {
            setActive("");
            setActiveSubmenu(""); // Clear all highlights
        }
    }, [location]);

    return (
        <>
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

            <header className="flex justify-between md:justify-around items-center mt-3 mb-2 vsm:mt-9 vsm:mb-5 mx-8 md:mx-5">
                {/* Logo */}
                <img src={Logo} alt="Go Digital Logo" width={140} />

                {/* Navigation Links */}
                <ul
                    className={`absolute top-24 right-5 bg-white shadow-lg rounded-lg flex flex-col gap-1 md:gap-4 items-start p-1 md:p-5 font-semibold transition_all
                ${isMenuOpen ? "opacity-100 pointer-events-auto visible shadow-inner border md:border-none" : "invisible md:visible pointer-events-none md:pointer-events-auto opacity-0 "}
                md:static md:opacity-100 md:translate-x-0 md:flex md:flex-row md:gap-2 lg:gap-7 xl:gap-14 md:p-0 md:bg-transparent md:shadow-none`}
                >
                    {/* Main navigation */}
                    {Object.keys(routes).map((navKey, index) => {
                        const navLabel = t(`nav.${navKey}`);

                        return (
                            <li
                                key={index}
                                className="flex w-full md:w-auto rounded md:rounded-3xl cursor-pointer transition_all relative md:active:scale-110"
                                onClick={() => navKey === "products" && toggleSubmenu()}
                                ref={navKey === "products" ? submenuRef : null}
                            >
                                {/* Main Links */}
                                {navKey === "products" ? (
                                    <span className={`flex items-center gap-1 px-4 py-2 rounded md:rounded-3xl transition_all ${active === navKey || isSubmenuOpen
                                        ? "bg-secondaryColor text-white"
                                        : "hover:bg-primaryBgColor hover:text-white"
                                        }`}>
                                        {navLabel} <Icons.ToggleArrowIcon />
                                    </span>
                                ) : (
                                    <Link
                                        to={routes[navKey]}
                                        className={`${active === navKey ? "bg-secondaryColor text-white" : "hover:bg-primaryBgColor hover:text-white"} flex w-full px-4 py-2 rounded md:rounded-3xl transition_all`}
                                    >
                                        {navLabel}
                                    </Link>
                                )}

                                {/* Submenu for Products */}
                                {navKey === "products" && isSubmenuOpen && (
                                    <ul className="absolute top-full -right-1 md:-left-10 bg-white z-50 text-black rounded-3xl shadow-xl mt-2 text-sm w-[325px] flex flex-col overflow-hidden" ref={submenuRef}>
                                        {productSubmenu.map((item, subIndex) => (
                                            <Link
                                                to={item.path}
                                                key={subIndex}
                                                onClick={handleSubmenuItemClick}
                                                className={`${activeSubmenu === item.key ? "bg-secondaryColor text-white" : ""} p-3 border-b border-secondaryColor/20 transition_all hover:bg-secondaryColor hover:text-white`}
                                            >
                                                {t(`products.${item.key}`)}
                                            </Link>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* Right section */}
                <section className="flex items-center gap-3 vsm:gap-5">
                    {/* User Profile Icon */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">
                                {user?.name} {user?.surname}
                            </span>
                            <Link to="/profile" className="flex justify-center items-center bg-secondaryColor hover:bg-primaryBgColor rounded-full w-10 h-10 cursor-pointer transition_all active:scale-125">
                                <Icons.UserIcon />
                            </Link>
                        </div>
                    ) : (
                        <Link to="/profile" onClick={(e) => {
                            e.preventDefault();
                            setIsLoginPopupOpen(true);
                        }} className="flex justify-center items-center bg-secondaryColor hover:bg-primaryBgColor rounded-full w-10 h-10 cursor-pointer transition_all active:scale-125">
                            <Icons.UserIcon />
                        </Link>
                    )}

                    {/* Language Switch */}
                    <span className="flex items-center gap-1 cursor-pointer w-12 vsm:w-auto" onClick={changeLanguage}>
                        {i18n.language != "en" ? <Icons.GreekFlagIcon /> : <Icons.UKFlagIcon />}
                    </span>

                    {/* Hamburger Icon for Mobile */}
                    <span
                        className="md:hidden flex items-center cursor-pointer active:scale-110"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <Icons.CloseIcon /> : <Icons.MenuIcon />}
                    </span>
                </section>
            </header>
        </>
    );
};