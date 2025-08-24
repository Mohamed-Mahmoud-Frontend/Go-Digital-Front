import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
// Component
import { Header, ArticleSlider, Contact } from "@/components";
// Icons
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ArticlePage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

        // Fetch article data
        const fetchArticle = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/blog/get?idBlog=${id}`, {
                    headers: {
                        'Accept-Language': i18n.language // 'en' or 'el'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch article');
                }
                const data = await response.json();
                setArticle(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, i18n.language]); // Added i18n.language as dependency

    if (loading) {
        return (
            <>
                <Header />
                <div className="text-center w-full mt-20">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                    <p className="text-gray-500 mt-4">Loading article as of {currentDate}</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="text-center mt-20 text-red-500">Error: {error}</div>
            </>
        );
    }

    if (!article) {
        return (
            <>
                <Header />
                <div className="text-center mt-20">Article not found</div>
            </>
        );
    }

    const products = [
        { label: t('article_page.products.travel'), route: "/get-a-quote-travel" },
        { label: t('article_page.products.foreigners'), route: "/get-a-quote-foreigners" },
        { label: t('article_page.products.intermediaries'), route: "/get-a-quote-intermediaries" },
        { label: t('article_page.products.liability'), route: "/get-a-quote-liability" },
        { label: t('article_page.products.guarantee'), route: "/get-a-quote-guarantee" },
    ];

    return (
        <div>
            <Header />

            <div className='p-5 lg:m-6'>
                <img
                    src={article.fullPathInnerPhotoUrl}
                    alt={article.title}
                    className='w-full h-[200px] vsm:h-[300px] lg:h-[600px] object-cover rounded-3xl'
                />
            </div>

            <section className='flex flex-col-reverse lg:flex-row justify-center items-start vsm:px-5 mx-5 pt-5 vsm:mt-6 gap-8'>
                <aside className="bg-primaryBgColor p-5 w-fit rounded-3xl flex-shrink-0">
                    <h1 className='text-white text-2xl text-center font-bold my-3'>{t('article_page.header.title')}</h1>
                    <span className='flex lg:flex-col gap-5 lg:gap-3 flex-wrap mt-5'>
                        {products.map((product) =>
                            <Link
                                to={product.route}
                                key={product.label}
                                className="flex w-full max-w-[350px] mx-auto px-3 gap-3 items-center h-20 bg-secondaryColor rounded-full"
                                style={{ boxShadow: "inset 0 4px 4px rgba(0, 0, 0, 0.2)" }}
                            >
                                <span className="flex justify-center items-center bg-secondaryBgColor text-secondaryColor rounded-full p-3">
                                    <Icons.PopUpPlaneIcon />
                                </span>
                                <h3 className="text-primaryColor text-sm vsm:text-base font-bold text-left">{product.label}</h3>
                            </Link>
                        )}
                    </span>
                </aside>

                <article className='flex flex-col gap-5 flex-grow'>
                    <h1 className='text-3xl vsm:text-4xl lg:text-5xl 2xl:text-7xl font-bold text-secondaryColor'>{article.title}</h1>
                    <div className="prose max-w-none">
                        <div
                            className="text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm vsm:text-base">Published on:</span>
                        <span className="text-sm vsm:text-base">{article.date}</span>
                    </div>
                </article>
            </section>

            {/* Recommended Articles Section */}
            <ArticleSlider
                title={t('article_page.slider.title')}
                subTitle={t('article_page.slider.subTitle')}
                url="/blog/travel"
                articleId={id}
            />

            <section
                className="flex flex-col-reverse md:flex-row justify-center md:justify-evenly items-center bg-secondaryColor text-center md:text-left rounded-3xl p-5 m-6 lg:mx-20 md:rounded-[58px] text-primaryColor py-6 md:py-12 xl:h-[590px]"
                style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.1)" }}
            >
                <aside className="flex flex-col justify-center items-center md:items-start gap-8 h-full">
                    <span>
                        <h1 data-aos="zoom-in" className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold max-w-[774px]">
                            {t('article_page.footer.title')}
                        </h1>
                        <h2 data-aos="zoom-in" className="text-sm sm:text-xl lg:text-[22px] max-w-[572px] mt-10">
                            {t('article_page.footer.subtitle')}
                        </h2>
                    </span>
                    <aside className="flex flex-col justify-center items-center md:justify-stretch md:items-start gap-5 mt-8 xl:mt-0">
                        <ul className="flex flex-col gap-1 list-disc text-sm sm:text-xl lg:text-[22px] list-inside">
                            {t('article_page.footer.list', { returnObjects: true }).map((item, index) => (
                                <li key={index} data-aos="fade-right">{item}</li>
                            ))}
                        </ul>
                        <span className="flex gap-5">
                            <Link to="/get-a-quote-travel">
                                <button
                                    className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-sm vsm:text-base sm:text-lg font-bold hover:bg-primaryColor hover:text-secondaryColor transition_all active:scale-110"
                                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                                >
                                    {t('article_page.footer.get_quote_button')}
                                </button>
                            </Link>
                            <Link to="/products/travel">
                                <button
                                    className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-sm vsm:text-base sm:text-lg font-bold hover:bg-primaryColor hover:text-secondaryColor transition_all active:scale-110"
                                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                                >
                                    {t('article_page.footer.more_info_button')}
                                </button>
                            </Link>
                        </span>
                    </aside>
                </aside>
                <span className="p-5" data-aos="fade-left">
                    <Icons.AirPlaneIcon />
                </span>
            </section>

            <Contact />
        </div>
    );
};