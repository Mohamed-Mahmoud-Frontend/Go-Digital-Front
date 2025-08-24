import { useState } from "react";
import { useTranslation } from 'react-i18next';
// Component
import { CircleGray } from "../../components"
import { GetQuotePopup } from "../custom/GetQuotePopup";
import Icon1 from "../../assets/icons/forWhyDigital/purchase.png"
import Icon2 from "../../assets/icons/forWhyDigital/products.png"
import Icon3 from "../../assets/icons/forWhyDigital/coverage.png"
import Icon4 from "../../assets/icons/forWhyDigital/policy.png"

export const WhyDigitalSection = () => {
    const { t } = useTranslation();
    const [showPopup, setShowPopup] = useState(false);

    return (
        <section className="xl:h-[615px] bg-secondaryColor rounded-3xl lg:rounded-[58px] text-center mt-10 md:mt-36 mx-7 lg:mx-20 p-5 vsm:p-8 lg:p-12">
                {/* Head Titles */}
                <h1 data-aos="zoom-in" className="text-primaryColor font-extrabold text-3xl sm:text-[40px]">{t('why_digital_section.title')}</h1>
                <h2 data-aos="zoom-in" className="max-w-[911px] mt-3 text-primaryColor font-medium text-xs tiny:text-lg sm:text-[22px] sm:leading-[30.05px] mx-auto">{t('why_digital_section.subtitle')}</h2>

                {/* Circles */}
                <section data-aos="fade-right" className="flex flex-wrap gap-2 vsm:gap-5 items-start justify-evenly mt-10 md:mt-[91px]">
                    <CircleGray icon={Icon1}>{t('why_digital_section.feature1')}</CircleGray>
                    <CircleGray icon={Icon2}>{t('why_digital_section.feature2')}</CircleGray>
                    <CircleGray icon={Icon3}>{t('why_digital_section.feature3')}</CircleGray>
                    <CircleGray icon={Icon4}>{t('why_digital_section.feature4')}</CircleGray>
                </section>

                {/* Quote Button */}
                <button
                    className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-base sm:text-lg font-bold mt-8 sm:mt-16 hover:bg-primaryColor hover:text-secondaryColor transition_all active:scale-110"
                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                    onClick={() => setShowPopup(true)} // Open popup
                    data-aos="zoom-in"
                >
                    {t('why_digital_section.get_quote')}
                </button>

                {/* Show Popup */}
                {showPopup && <GetQuotePopup onClose={() => setShowPopup(false)} />}
            </section>
    )
}