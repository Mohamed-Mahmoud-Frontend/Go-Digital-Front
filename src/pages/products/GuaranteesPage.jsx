import React from "react";
import { Link } from "react-router-dom";
// Components
import { Header, HeroProductsSection, CircleDashed, CoveragesSection, CircleGray, ArticleSlider, SuccessRectangle, WarrantiesSection, Contact, GetQuote, GetQuoteSideBT } from "../../components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";
// Guarantees Circle Dashed Icons
import Icon1 from "@/assets/icons/forCircleDashed/information.png"
import Icon2 from "@/assets/icons/forCircleDashed/personal.png"
import Icon3 from "@/assets/icons/forCircleDashed/email.png"
// Guarantees Why Digital Icons
import Icon11 from "@/assets/icons/forWhyDigital/quick.png"
import Icon22 from "@/assets/icons/forWhyDigital/contact.png"
import Icon33 from "@/assets/icons/forWhyDigital/checklist.png"
// Guarantees Services Icons
import Icon111 from "@/assets/icons/forWhyDigital/quick.png"
import Icon222 from "@/assets/icons/forWhyDigital/contact.png"
import Icon333 from "@/assets/icons/forWhyDigital/checklist.png"
import Icon444 from "@/assets/icons/forWhyDigital/quick.png"
import Icon555 from "@/assets/icons/forWhyDigital/contact.png"

export const GuaranteesPage = () => {
    const { t } = useTranslation();

    const rawSlidesData = t('guarantees_page.coverages_section.slides', { returnObjects: true });
    const services = t('guarantees_page.services_section.services', { returnObjects: true });
    const steps = t('guarantees_page.how_works_section.steps', { returnObjects: true });

    // Add icons to slidesData
    const slidesData = rawSlidesData.map((slide, index) => {
        const icons = [Icon111, Icon222, Icon333, Icon444, Icon555];
        return {
            ...slide,
            icon: icons[index]
        };
    });

    return (
        <>
            <Header />

            <HeroProductsSection
                headTitle={t('guarantees_page.hero_section.headTitle')}
                Subtitle={t('guarantees_page.hero_section.subtitle')}
                url="/get-a-quote-guarantee"
            >
                <h3 data-aos="fade-right" className="text-sm sm:text-base lg:text-[22px] font-bold">
                    {t('guarantees_page.hero_section.cta_text')}
                </h3>
                <div data-aos="fade-right" className="relative w-full max-w-[450px] xl:max-w-[680px]">
                    <select defaultValue="" className="w-full appearance-none h-14 md:h-[74px] bg-white border border-gray-300 text-sm vsm:text-base font-bold rounded-[10px] text-[#7D7D7D] py-2 px-4 pr-10 shadow focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="" disabled hidden>
                            {t('guarantees_page.hero_section.select_placeholder')}
                        </option>
                        <option value="1">{t('guarantees_page.hero_section.select_options.option1')}</option>
                        <option value="2">{t('guarantees_page.hero_section.select_options.option2')}</option>
                        <option value="3">{t('guarantees_page.hero_section.select_options.option3')}</option>
                    </select>
                    <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                        <Icons.SelectArrowIcon />
                    </span>
                </div>
            </HeroProductsSection>

            <section className="mb-0 sm:mb-24">
                <h1 data-aos="zoom-in" className="text-center text-2xl lg:text-[40px] font-bold my-10 sm:my-12">
                    {t('guarantees_page.how_works_section.title')}
                </h1>
                <div data-aos="fade-right" className="flex flex-col sm:flex-row items-start vsm:items-stretch max-w-[1202px] mx-20 vsm:mx-10 xl:m-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <CircleDashed title={step}>
                                {index === 0 && <img src={Icon1} alt="Icon1" className="w-full h-full p-5" />}
                                {index === 1 && <img src={Icon2} alt="Icon2" className="w-full h-full p-5" />}
                                {index === 2 && <img src={Icon3} alt="Icon3" className="w-full h-full p-5" />}
                            </CircleDashed>
                            {index < steps.length - 1 && (
                                <span className="w-0 h-10 mx-14 vsm:m-auto sm:w-full sm:h-0 border-[2px] border-secondaryColor border-dashed"></span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <WarrantiesSection />

            <CoveragesSection
                title={t('guarantees_page.coverages_section.title')}
                description={t('guarantees_page.coverages_section.description')}
                data={slidesData}
            />

            <section className="bg-secondaryBgColor rounded-3xl lg:rounded-[58px] text-center mt-10 mx-7 lg:mx-20 p-5 vsm:p-8 lg:p-12">
                <h1 data-aos="zoom-in" className="font-extrabold text-3xl sm:text-[40px]">
                    {t('guarantees_page.services_section.title')}
                </h1>
                <h2 data-aos="zoom-in" className="max-w-[911px] mt-3 font-medium text-xs tiny:text-lg sm:text-[22px] sm:leading-[30.05px] mx-auto">
                    {t('guarantees_page.services_section.description')}
                </h2>
                <div data-aos="fade-right" className="flex flex-wrap gap-2 vsm:gap-5 items-start justify-evenly mt-10 md:mt-[91px]">
                    {services.map((service, index) => {
                        const icons = [Icon11, Icon22, Icon33];
                        return (
                            <CircleGray key={index} circleColor="secondaryColor" textColor="primaryBgColor" icon={icons[index]}>
                                {service.title}
                                <p className="font-normal mt-2 vsm:mt-5 text-center">{service.description}</p>
                            </CircleGray>
                        )
                    })}
                </div>
                <Link to="/get-a-quote-guarantee">
                    <button
                        className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-base sm:text-lg font-bold mt-8 sm:mt-16 hover:bg-secondaryColor hover:text-primaryColor transition_all active:scale-110"
                        style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                        data-aos="zoom-in"
                    >
                        {t('guarantees_page.get_quote_button')}
                    </button>
                </Link>
            </section>

            <section className="bg-secondaryColor mx-7 lg:mx-20 rounded-b-3xl md:rounded-b-[58px] rounded-t-[30px] md:rounded-t-[70px] my-5 md:my-20">
                <div
                    className="flex flex-col justify-center items-center bg-secondaryBgColor text-center rounded-3xl md:rounded-[58px] py-12 h-[200px]"
                    style={{ boxShadow: "0px 10px 10px 0px #8E240026" }}
                >
                    <h1 data-aos="zoom-in" className="max-w-[683px] text-3xl sm:text-[40px] font-bold leading-[54.64px]">
                        {t('guarantees_page.why_section.title')}
                    </h1>
                    <h2 data-aos="zoom-in" className="mt-5 mb-6 mx-2 sm:text-[22px] sm:leading-[30.05px]">
                        {t('guarantees_page.why_section.subtitle')}
                    </h2>
                </div>
                <div data-aos="fade-right" className="flex flex-wrap gap-3 vsm:gap-5 justify-center xl:justify-evenly items-center rounded-3xl md:rounded-b-[58px] text-center py-10 sm:py-16 mx-1 vsm:mx-4 xl:mx-20">
                    {t('guarantees_page.why_section.features', { returnObjects: true }).map((feature, index) => (
                        <SuccessRectangle key={index}>{feature}</SuccessRectangle>
                    ))}
                </div>
            </section>

            <ArticleSlider
                subTitle={t('guarantees_page.article_slider.subTitle')}
                url="/blog/guarantees"
                categoryId={5}
            />

            <Contact />

            <GetQuote url="/get-a-quote-guarantee" />
            <GetQuoteSideBT url="/get-a-quote-guarantee" />
        </>
    );
};