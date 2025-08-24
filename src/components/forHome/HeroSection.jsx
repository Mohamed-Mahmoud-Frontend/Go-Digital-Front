import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next';
// Component
import { PlaneLabel } from "../../components"
// Images
import Symbol from "@/assets/images/icon.png"
import Icon1 from "../../assets/icons/forHero/travel.png"
import Icon2 from "../../assets/icons/forHero/offer.png"
import Icon3 from "../../assets/icons/forHero/liability.png"
import Icon4 from "../../assets/icons/forHero/road.png"
import Icon5 from "../../assets/icons/forHero/guarantee.png"

export const HeroSection = () => {
    const { t } = useTranslation();

    return (
        <main className="bg-secondaryBgColor mx-6 lg:mx-20 rounded-3xl md:rounded-[58px]">

            {/* First Hero Section [Logo & Titles] */}
            <section
                className="flex flex-col justify-center items-center bg-primaryBgColor text-center rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12 md:h-[590px]"
                style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
            >
                {/* Hero Section Logo */}
                <img data-aos="fade-in" src={Symbol} alt="Go Digital Icon" className="w-[100px] md:w-[199px]" />
                {/* Hero Section Titles */}
                <h1 className="max-w-[806px] mx-5 tiny:text-2xl vsm:text-4xl md:text-6xl font-semibold vsm:leading-[51.96px] md:leading-[81.96px]">{t('hero_section.title')}</h1>
                <h2 className="mt-5 mb-6 mx-5 max-w-[693px] text-xs vsm:text-base md:text-[22px] vsm:leading-[30.05px]">{t('hero_section.subtitle')}</h2>
            </section>

            {/* Second Hero Section [Plane Labels] */}
            <section data-aos="fade-right" className="flex flex-wrap justify-center items-center gap-10 rounded-3xl md:rounded-[58px] text-center text-primaryColor pt-8 vsm:pb-8 md:pt-[78px] md:pb-16 mx-5 md:mx-20">
                <Link to="/products/travel">
                    <PlaneLabel icon={Icon1}>{t('hero_section.travel_insurance')}</PlaneLabel>
                </Link>

                <Link to="/products/medical-insurance-foreigners">
                    <PlaneLabel icon={Icon2}>{t('hero_section.medical_insurance_foreigners')}</PlaneLabel>
                </Link>

                <Link to="/products/professional-liability-insurance-intermediaries">
                    <PlaneLabel icon={Icon3}>{t('hero_section.professional_liability_insurance_intermediaries')}</PlaneLabel>
                </Link>

                <Link to="/products/road-carrier-professional-liability">
                    <PlaneLabel icon={Icon4}>{t('hero_section.road_carrier_professional_liability')}</PlaneLabel>
                </Link>

                <Link to="/products/guarantees">
                    <PlaneLabel icon={Icon5} rotateBox="rotate-90" hight="h-[241.8px]" rotateText="-rotate-90">{t('hero_section.guarantees')}</PlaneLabel>
                </Link>
            </section>

        </main>
    )
}