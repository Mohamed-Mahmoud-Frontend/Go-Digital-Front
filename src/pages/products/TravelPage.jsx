import React, { useState, useEffect } from "react"; 
import {  useNavigate } from "react-router-dom"; 
// Components
import { Header, HeroProductsSection, CircleDashed, CoveragesSection, CircleGray, ArticleSlider, SuccessRectangle, Contact, GetQuote, GetQuoteSideBT } from "@/components";
import { useTranslation } from "react-i18next";
// Icons
import * as Icons from "@/utils/icons.util";
// Travel Circle Dashed Icons
import Icon1 from "@/assets/icons/forCircleDashed/travel.png"
import Icon2 from "@/assets/icons/forCircleDashed/packages.png"
import Icon3 from "@/assets/icons/forCircleDashed/online.png"
import Icon4 from "@/assets/icons/forCircleDashed/contract.png"
// Travel Coverages Icons
import Icon11 from "@/assets/icons/forWhyDigital/quick.png"
import Icon22 from "@/assets/icons/forWhyDigital/contact.png"
import Icon33 from "@/assets/icons/forWhyDigital/hours.png"
import Icon44 from "@/assets/icons/forWhyDigital/checklist.png"
// Travel Services Icons
import Icon111 from "@/assets/icons/forWhyDigital/quick.png"
import Icon222 from "@/assets/icons/forWhyDigital/contact.png"
import Icon333 from "@/assets/icons/forWhyDigital/hours.png"
import Icon444 from "@/assets/icons/forWhyDigital/checklist.png"

// (جديد) تعريف الرابط الأساسي للـ API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TravelPage = () => {
    const { t, i18n } = useTranslation(); // (جديد) إضافة i18n
    const navigate = useNavigate(); // (جديد)

    // (جديد) States لإدارة الداتا والـ Prefill
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    // (ملاحظة: يمكنك إضافة state للخطأ إذا أردت)

    // (جديد) جلب قائمة الدول من الـ API
    useEffect(() => {
        const fetchApiData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/user/travelInsurance/getArguments`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': i18n.language
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch travel insurance data');
                }

                const data = await response.json();
                setDestinationOptions(data.countries || []);
            } catch (error) {
                console.error('Error fetching travel insurance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiData();
    }, [i18n.language]);

    // (جديد) قراءة القيمة المحفوظة من localStorage عند تحميل الصفحة
    useEffect(() => {
        const savedValue = localStorage.getItem("travel_destination_prefill");
        if (savedValue) {
            setSelectedDestination(savedValue);
        }
    }, []);

    // (جديد) دالة لحفظ القيمة المختارة في الـ state والـ localStorage
    const handleDestinationChange = (e) => {
        const value = e.target.value;
        setSelectedDestination(value);
        localStorage.setItem("travel_destination_prefill", value); // حفظ الـ ID
    };

    // (جديد) دالة للانتقال لصفحة الفورم
    const handleGetQuoteClick = () => {
        // يمكن إضافة (validation) هنا إذا أردت
        navigate("/get-a-quote-travel");
    };

    const rawSlidesData = t('travel_page.coverages_section.slides', { returnObjects: true });
    const services = t('travel_page.services_section.services', { returnObjects: true });
    const steps = t('travel_page.how_works_section.steps', { returnObjects: true });

    const slidesData = rawSlidesData.map((slide, index) => {
        const icons = [Icon111, Icon222, Icon333, Icon444];
        return {
            ...slide,
            icon: icons[index]
        };
    });

    return (
        <>
            <Header />

            <HeroProductsSection
                headTitle={t('travel_page.hero_section.headTitle')}
                Subtitle={t('travel_page.hero_section.subtitle')}
                url="/get-a-quote-travel" // هذا الزر سينتقل مباشرة
            >
                <span>
                    <h3 data-aos="fade-right" className="text-sm vsm:text-base lg:text-[22px] font-bold">{t('travel_page.hero_section.destination_title')}</h3>
                    <h4 data-aos="fade-right" className="text-sm vsm:text-base lg:text-[22px]">{t('travel_page.hero_section.destination_subtitle')}</h4>
                </span>
                <div data-aos="fade-right" className="relative w-full max-w-[450px] xl:max-w-[680px]">
                    {/* (تم التعديل) --- القائمة المنسدلة الديناميكية --- */}
                    {isLoading ? (
                        <div className="h-14 md:h-[74px] bg-gray-200 border border-gray-300 rounded-[10px] animate-pulse" />
                    ) : (
                        <select
                            value={selectedDestination}
                            onChange={handleDestinationChange}
                            className="w-full appearance-none h-14 md:h-[74px] bg-white border border-gray-300 text-sm vsm:text-base font-bold rounded-[10px] text-[#7D7D7D] py-2 px-4 pr-10 shadow focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            <option value="" disabled hidden>{t('travel_page.hero_section.select_placeholder')}</option>
                            {/* (جديد) ملء القائمة من الـ API */}
                            {destinationOptions.map((country) => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                        <Icons.SelectArrowIcon />
                    </span>
                </div>
            </HeroProductsSection>

            {/* ... (باقي كود الصفحة بدون تغيير) ... */}
            <section className="mb-0 sm:mb-24">
                <h1 data-aos="zoom-in" className="text-center text-2xl lg:text-[40px] font-bold my-10 sm:my-12">{t('travel_page.how_works_section.title')}</h1>
                <div data-aos="fade-right" className="flex flex-col sm:flex-row items-start vsm:items-stretch max-w-[1202px] mx-20 vsm:mx-10 xl:m-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <CircleDashed title={step}>
                                {index === 0 && <img src={Icon1} alt="Icon1" className="w-full h-full p-5" />}
                                {index === 1 && <img src={Icon2} alt="Icon2" className="w-full h-full p-5" />}
                                {index === 2 && <img src={Icon3} alt="Icon3" className="w-full h-full p-5" />}
                                {index === 3 && <img src={Icon4} alt="Icon4" className="w-full h-full p-5" />}
                            </CircleDashed>
                            {index < steps.length - 1 && (
                                <span className="w-0 h-10 mx-14 vsm:m-auto sm:w-full sm:h-0 border-[2px] border-secondaryColor border-dashed"></span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>
            <CoveragesSection
                title={t('travel_page.coverages_section.title')}
                description={t('travel_page.coverages_section.description')}
                data={slidesData}
            />
            <section className="bg-secondaryBgColor rounded-3xl lg:rounded-[58px] text-center mt-10 mx-7 lg:mx-20 p-5 vsm:p-8 lg:p-12">
                <h1 data-aos="zoom-in" className="font-extrabold text-3xl sm:text-[40px]">{t('travel_page.services_section.title')}</h1>
                <h2 data-aos="zoom-in" className="max-w-[911px] mt-3 font-medium text-xs tiny:text-lg sm:text-[22px] sm:leading-[30.05px] mx-auto">{t('travel_page.services_section.description')}</h2>
                <div data-aos="fade-right" className="flex flex-wrap gap-2 vsm:gap-5 items-start justify-evenly mt-10 md:mt-[91px]">
                    {services.map((service, index) => {
                        const icons = [Icon11, Icon22, Icon33, Icon44];
                        return (
                            <CircleGray key={index} circleColor="secondaryColor" textColor="primaryBgColor" icon={icons[index]}>
                                {service.title}
                                <p className="font-normal mt-2 vsm:mt-5 text-center">{service.description}</p>
                            </CircleGray>
                        );
                    })}
                </div>
                {/* (تم التعديل) ربط الزر بالدالة الجديدة */}
                <button
                    onClick={handleGetQuoteClick}
                    className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-base sm:text-lg font-bold mt-8 sm:mt-16 hover:bg-secondaryColor hover:text-primaryColor transition_all active:scale-110"
                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                    data-aos="zoom-in"
                >
                    {t('travel_page.get_quote_button')}
                </button>
            </section>
            <section className="bg-secondaryColor mx-7 lg:mx-20 rounded-b-3xl md:rounded-b-[58px] rounded-t-[30px] md:rounded-t-[70px] my-5 md:my-20">
                <div
                    className="flex flex-col justify-center items-center bg-secondaryBgColor text-center rounded-3xl md:rounded-[58px] py-12 h-[200px]"
                    style={{ boxShadow: "0px 10px 10px 0px #8E240026" }}
                >
                    <h1 data-aos="zoom-in" className="max-w-[683px] text-3xl sm:text-[40px] font-bold leading-[54.64px]">{t('travel_page.why_section.title')}</h1>
                    <h2 data-aos="zoom-in" className="mt-5 mb-6 mx-2 sm:text-[22px] sm:leading-[30.05px]">{t('travel_page.why_section.subtitle')}</h2>
                </div>
                <div data-aos="fade-right" className="flex flex-wrap gap-3 vsm:gap-5 justify-center xl:justify-evenly items-center rounded-3xl md:rounded-b-[58px] text-center py-10 sm:py-16 mx-1 vsm:mx-4 xl:mx-20">
                    {t('travel_page.why_section.features', { returnObjects: true }).map((feature, index) => (
                        <SuccessRectangle key={index}>{feature}</SuccessRectangle>
                    ))}
                </div>
            </section>
            <ArticleSlider
                subTitle={t('travel_page.article_slider.subTitle')}
                url="/blog/travel"
                categoryId={1}
            />
            <Contact />
            <GetQuote url="/get-a-quote-travel" />
            <GetQuoteSideBT url="/get-a-quote-travel" />
        </>
    );
};