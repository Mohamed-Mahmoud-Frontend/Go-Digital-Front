// Images
import Symbol from "@/assets/images/icon.png"
// Icons
import * as Icons from "@/utils/icons.util"
import { useTranslation } from 'react-i18next';

export const HeroBlogSection = () => {
    const { t } = useTranslation();

    return (
        <main className="bg-secondaryColor mx-6 lg:mx-20 rounded-3xl md:rounded-[58px]">

            {/* First Hero Section [Logo & Titles] */}
            <section
                className="flex flex-col justify-center items-center bg-primaryBgColor text-center rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12 md:max-h-[590px]"
                style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
            >
                {/* Hero Section Logo */}
                <img data-aos="fade-in" src={Symbol} alt="Go Digital Icon" className="w-[100px] md:w-[199px]" />
                {/* Hero Section Titles */}
                <h1 className="max-w-[806px] mx-5 tiny:text-2xl vsm:text-4xl md:text-6xl font-semibold vsm:leading-[51.96px] md:leading-[81.96px]">{t('hero_blog_section.title')}</h1>
                <h2 className="mt-5 mb-6 mx-5 max-w-[519px] text-xs vsm:text-base md:text-[22px] vsm:leading-[30.05px]">{t('hero_blog_section.subtitle')}</h2>
            </section>

            {/* Arrow */}
            <section className="flex justify-center items-center gap-10 rounded-3xl md:rounded-[58px] py-4 md:py-8 mx-5 md:mx-20">
                <span className="text-primaryBgColor"><Icons.BottomArrowIcon /></span>
            </section>

        </main>
    )
}