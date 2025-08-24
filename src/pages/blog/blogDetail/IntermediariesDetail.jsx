import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
// Component
import { Header, Contact } from "@/components";
// Icons
import * as Icons from "@/utils/icons.util";
// Images
import Symbol from "@/assets/images/icon.png";
import { useTranslation } from "react-i18next";
import useBlogArticles from "@/hooks/useBlogArticles";

export const IntermediariesDetail = () => {
    const { t } = useTranslation();
    const { articles, loading, error } = useBlogArticles(2); // Category ID 2 for Professional Liability
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // Set current date in a nice format
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        setCurrentDate(now.toLocaleDateString('en-US', options));
    }, []);

    return (
        <>
            <Header />

            {/* Hero Section */}
            <section className="bg-secondaryColor mx-6 lg:mx-20 rounded-3xl md:rounded-[58px]">
                {/* First Hero Section [Logo & Titles] */}
                <span
                    className="flex flex-col justify-center items-center bg-primaryBgColor text-center rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12 md:max-h-[590px]"
                    style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
                >
                    {/* Hero Section Logo */}
                    <img data-aos="fade-in" src={Symbol} alt="Go Digital Icon" className="w-[100px] md:w-[199px]" />
                    {/* Hero Section Title */}
                    <h1 data-aos="zoom-in" className="max-w-[806px] mx-5 tiny:text-2xl vsm:text-4xl md:text-6xl font-semibold vsm:leading-[51.96px] md:leading-[81.96px]">
                        {t('intermediaries_detail.hero_section.title')}
                    </h1>
                </span>

                {/* Professional Liability */}
                <span className="flex justify-center items-center gap-10 rounded-3xl md:rounded-[58px] py-4 md:py-8 mx-5 md:mx-20 text-primaryColor">
                    <span data-aos="zoom-in" className="flex flex-col justify-center items-center gap-4 md:gap-7">
                        <Icons.PlaneIcon />
                        <h3 className="font-bold md:text-3xl text-center">{t('intermediaries_detail.hero_section.insurance_title')}</h3>
                        <p className="text-center text-lg max-w-[519px]">{t('intermediaries_detail.hero_section.insurance_subtitle')}</p>
                    </span>
                </span>
            </section>

            {/* Articles Details Section */}
            <section className="flex flex-wrap justify-center gap-5 m-7">
                {loading ? (
                    <div className="text-center w-full">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                        <p className="text-gray-500 mt-4">Loading articles as of {currentDate}</p>
                    </div>
                ) : error ? (
                    <div className="text-center w-full text-red-500">Error loading articles: {error}</div>
                ) : (
                    articles.map((article) => (
                        <div
                            className="relative rounded-3xl sm:rounded-[32px] w-96 h-96 sm:w-[460px] sm:h-[450px] overflow-hidden shadow-lg m-2"
                            style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
                            key={article.id}
                        >
                            {/* image */}
                            <img
                                className="rounded-3xl sm:rounded-[32px] w-96 h-96 sm:w-[510px] sm:h-[500px] object-cover"
                                src={article.fullPathInnerPhotoUrl}
                                alt={article.title}
                            />
                            {/* gradient white color */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent rounded-3xl sm:rounded-[32px]">
                                <span className="absolute flex flex-col gap-3 bottom-4 left-4 text-black">
                                    <h3 data-aos="fade-right" className="text-lg font-bold max-w-[446px] text-[28px]">{article.title}</h3>
                                    <p data-aos="fade-right" className="text-sm max-w-[446px] text-[22px] font-semibold leading-[26.63px]">
                                        {article.content}
                                    </p>
                                    <Link data-aos="fade-right" to={`/articles/${article.id}`} className="text-secondaryColor underline">
                                        {t('intermediaries_detail.read_more')}
                                    </Link>
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Footer Section */}
            <section
                className="flex flex-col-reverse md:flex-row justify-center md:justify-evenly items-center bg-secondaryColor text-center md:text-left rounded-3xl p-5 m-6 lg:mx-20 md:rounded-[58px] text-primaryColor py-6 md:py-12 xl:h-[590px]"
                style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.1)" }}
            >
                <aside className="flex flex-col justify-center items-center md:items-start md:justify-around h-full">
                    {/* Head Titles */}
                    <span>
                        <h1 data-aos="zoom-in" className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold max-w-[774px]">
                            {t('intermediaries_detail.footer_section.title')}
                        </h1>
                        <h2 data-aos="zoom-in" className="text-sm sm:text-xl lg:text-[22px] max-w-[572px] mt-10">
                            {t('intermediaries_detail.footer_section.subtitle')}
                        </h2>
                    </span>
                    {/* Quote ,More Info */}
                    <aside className="flex flex-col justify-center items-center md:justify-stretch md:items-start gap-5 mt-8 xl:mt-0">
                        <ul className="flex flex-col gap-1 list-disc text-sm sm:text-xl lg:text-[22px]">
                            {t('intermediaries_detail.footer_section.list', { returnObjects: true }).map((item, index) => (
                                <li key={index} data-aos="fade-right">{item}</li>
                            ))}
                        </ul>

                        {/* Quote Button */}
                        <span className="flex gap-5">
                            <Link to="/get-a-quote-intermediaries">
                                <button
                                    className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-sm vsm:text-base sm:text-lg font-bold hover:bg-primaryColor hover:text-secondaryColor transition_all active:scale-110"
                                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                                >
                                    {t('intermediaries_detail.footer_section.get_quote_button')}
                                </button>
                            </Link>

                            {/* More Info Button */}
                            <Link to="/products/professional-liability-insurance-intermediaries">
                                <button
                                    className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-sm vsm:text-base sm:text-lg font-bold hover:bg-primaryColor hover:text-secondaryColor transition_all active:scale-110"
                                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                                >
                                    {t('intermediaries_detail.footer_section.more_info_button')}
                                </button>
                            </Link>
                        </span>
                    </aside>
                </aside>

                {/* Intermediaries Icon */}
                <span className="p-5" data-aos="fade-left">
                    <Icons.AirPlaneIcon />
                </span>
            </section>

            {/* Contact Section */}
            <Contact />
        </>
    );
};