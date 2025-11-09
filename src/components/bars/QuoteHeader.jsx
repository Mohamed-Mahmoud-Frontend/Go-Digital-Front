import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// Icons
import * as Icons from "@/utils/icons.util";
// Image
import Logo from "@/assets/images/logo.png";

export const QuoteHeader = () => {
    const { i18n } = useTranslation();
    const langMenuRef = useRef(null); 
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); 

    const toggleLangMenu = () => {
        setIsLangMenuOpen(!isLangMenuOpen);
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setIsLangMenuOpen(false); 
    };

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

    const handleRefresh = () => {
        window.location.reload(); 
    };

    return (
        <header className="flex justify-between items-center mt-3 vsm:mt-9 mx-8 xl:mx-32">
            <Link to="/">
                <img src={Logo} alt="Go Digital Logo" width={140} />
            </Link>

            <section className="flex items-center gap-3"> 
                
                <span 
                    onClick={handleRefresh} 
                    className="flex justify-center items-center w-10 h-10 rounded-full cursor-pointer transition-all hover:bg-gray-100 hover:animate-spin"
                >
                    <Icons.ReloadIcon className="w-5 h-5 text-gray-600" />
                </span>

                <Link 
                    to="/profile" 
                    className="flex justify-center items-center bg-[#1E3F76]/30 hover:bg-secondaryColor rounded-full w-10 h-10 cursor-pointer transition_all active:scale-125"
                >
                    <Icons.UserIcon className="w-5 h-5" /> 
                </Link>

                <div className="relative" ref={langMenuRef}>
                    <button
                        onClick={toggleLangMenu}
                        className="flex items-center gap-2 px-3 py-2 rounded-full transition_all hover:bg-gray-100"
                    >
                        {i18n.language === 'en' ? (
                            <>
                                <Icons.UKFlagIcon className="w-6 h-6 rounded-full" />
                                <span className="text-sm font-medium hidden vsm:block">English</span>
                            </>
                        ) : (
                            <>
                                <Icons.GreekFlagIcon className="w-6 h-6 rounded-full" />
                                <span className="text-sm font-medium hidden vsm:block">Ελληνικά</span>
                            </>
                        )}
                        <Icons.ToggleArrowIcon className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    {isLangMenuOpen && (
                        <ul className="absolute top-full right-0 bg-white z-50 text-black rounded-xl shadow-xl mt-2 w-44 flex flex-col overflow-hidden border">
                            <li
                                onClick={() => handleLanguageChange('en')}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition_all ${
                                    i18n.language === 'en'
                                        ? 'bg-secondaryColor text-white'
                                        : 'hover:bg-primaryBgColor hover:text-white'
                                }`}
                            >
                                <Icons.UKFlagIcon className="w-6 h-6 rounded-full" />
                                <span>English</span>
                            </li>
                            <li
                                onClick={() => handleLanguageChange('el')}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition_all ${
                                    i18n.language === 'el'
                                        ? 'bg-secondaryColor text-white'
                                        : 'hover:bg-primaryBgColor hover:text-white'
                                }`}
                            >
                                <Icons.GreekFlagIcon className="w-6 h-6 rounded-full" />
                                <span>Ελληνικά</span>
                            </li>
                        </ul>
                    )}
                </div>
                
            </section>
        </header>
    );
};