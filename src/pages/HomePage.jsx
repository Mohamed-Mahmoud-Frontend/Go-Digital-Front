// Components
import { Header, HeroSection, HowWorksSection, WhyDigitalSection, ArticleSlider, CoveragesSection, Contact, GetQuote } from "../components";
import { useTranslation } from "react-i18next";

import Icon1 from "@/assets/icons/forWhyDigital/quick.png"
import Icon2 from "@/assets/icons/forWhyDigital/contact.png"
import Icon3 from "@/assets/icons/forWhyDigital/hours.png"
import Icon4 from "@/assets/icons/forWhyDigital/checklist.png"

// Array of objects containing title and description for (services section)
const slidesData = [
    {
        titleKey: "home_page.services_section.slides.0.title",
        descriptionKey: "home_page.services_section.slides.0.description",
        icon: Icon1,
    },
    {
        titleKey: "home_page.services_section.slides.1.title",
        descriptionKey: "home_page.services_section.slides.1.description",
        icon: Icon2,
    },
    {
        titleKey: "home_page.services_section.slides.2.title",
        descriptionKey: "home_page.services_section.slides.2.description",
        icon: Icon3,
    },
    {
        titleKey: "home_page.services_section.slides.3.title",
        descriptionKey: "home_page.services_section.slides.3.description",
        icon: Icon4,
    },
];

export const HomePage = () => {
    const { t } = useTranslation();

    // Translate slidesData dynamically
    const translatedSlidesData = slidesData.map((slide) => ({
        title: t(slide.titleKey),
        description: t(slide.descriptionKey),
        icon: slide.icon,
    }));

    return (
        <>
            <Header />
            <HeroSection />
            <HowWorksSection />
            <WhyDigitalSection />
            <ArticleSlider url="/blog" categoryId={0} />
            {/* Services Section */}
            <CoveragesSection
                title={t('home_page.services_section.title')}
                description={t('home_page.services_section.description')}
                data={translatedSlidesData}
            />
            <Contact />
            <GetQuote />
        </>
    );
};