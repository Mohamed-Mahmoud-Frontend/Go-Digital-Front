import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { LoginPopup, RegisterPopup, OtpPopup } from '../../components';
// Icons
import * as Icons from "@/utils/icons.util"; // <-- تأكد من وجود GlobeIcon, UKFlagIcon, GreekFlagIcon, ToggleArrowIcon
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
    const langMenuRef = useRef(null); 
console.log(i18n.language);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false); 
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); 
    const [active, setActive] = useState(""); 
    const [activeSubmenu, setActiveSubmenu] = useState(""); 
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

    // Toggle language menu visibility
    const toggleLangMenu = () => {
        setIsLangMenuOpen(!isLangMenuOpen);
    };

    // Handle language change from dropdown
    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setIsLangMenuOpen(false); // Close menu on selection
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

    // Close language menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setIsLangMenuOpen(false);
            }
        };

        if (isLangMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLangMenuOpen]);


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

    // Update `active` state based on current location
    useEffect(() => {
        const currentRoute = Object.keys(routes).find(
            (key) => routes[key] === location.pathname
        );
        const activeSubItem = productSubmenu.find(
            (item) => item.path === location.pathname
        );

        if (activeSubItem) {
            setActive("products"); 
            setActiveSubmenu(activeSubItem.key); 
        } else if (currentRoute) {
            setActive(currentRoute);
            setActiveSubmenu(""); 
        } else {
            setActive("");
            setActiveSubmenu(""); 
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

                    {/* (تم التعديل) Language Switch Dropdown */}
                    <div className="relative" ref={langMenuRef}>
                        
                        {/* (جديد) Trigger: Shows current language + flag */}
                        <button
                            onClick={toggleLangMenu}
                            className="flex items-center gap-2 p-2 rounded-md transition_all hover:bg-gray-100"
                        >
                            {/* Dynamically show selected language */}
                            {i18n.language === 'en' ? (
                                <>
                                    <Icons.UKFlagIcon />
                                    <span className="text-sm font-medium hidden vsm:block">English</span>
                                </>
                            ) : (
                                <>
                                    <Icons.GreekFlagIcon />
                                    <span className="text-sm font-medium hidden vsm:block">Ελληνικά</span>
                                </>
                            )}
                            {/* Dropdown Arrow */}
                            <Icons.ToggleArrowIcon className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>

                        {/* Language Dropdown Menu */}
                        {isLangMenuOpen && (
                            <ul className="absolute top-full right-0 bg-white z-50 text-black rounded-xl shadow-xl mt-2 w-44 flex flex-col overflow-hidden border">
                                {/* English Option */}
                                <li
                                    onClick={() => handleLanguageChange('en')}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition_all ${
                                        i18n.language === 'en'
                                            ? 'bg-secondaryColor text-white' // Selected
                                            : 'hover:bg-primaryBgColor hover:text-white'
                                        }`}
                                >
                                    <Icons.UKFlagIcon />
                                    <span>English</span>
                                </li>

                                {/* Greek Option */}
                                <li
                                    onClick={() => handleLanguageChange('el')}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition_all ${
                                        i18n.language === 'el'
                                            ? 'bg-secondaryColor text-white' // Selected
                                            : 'hover:bg-primaryBgColor hover:text-white'
                                        }`}
                                >
                                    <Icons.GreekFlagIcon />
                                    <span>Ελληνικά</span>
                                </li>
                            </ul>
                        )}
                    </div>

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