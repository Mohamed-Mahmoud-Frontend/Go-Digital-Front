import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
// Components
import { ImageSlider, LoadingImage } from "../../components";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ArticleSlider = ({
    title,
    subTitle,
    url,
    directionStyle = "lg:flex-row lg:pl-32",
    buttonStyle = "bg-secondaryColor hover:bg-primaryBgColor",
    backgroundStyle = "bg-primaryBgColor right-0 rounded-s-[58px]",
    direction,
    articleId,
    categoryId,
    noBtn = false
}) => {
    const { t, i18n } = useTranslation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                let endpoint;
                if (articleId) {
                    endpoint = `${API_BASE_URL}/blog/getRecommendations?idBlog=${articleId}`;
                } else if (categoryId !== undefined) {
                    endpoint = `${API_BASE_URL}/blog/list/`;
                } else {
                    throw new Error('Either articleId or categoryId must be provided');
                }

                const response = await fetch(endpoint, {
                    headers: {
                        'Accept-Language': i18n.language // 'en' or 'el'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch articles');
                }
                const data = await response.json();

                // Handle different response structures
                if (articleId) {
                    setArticles(data.blogs || []);
                } else {
                    // Get blogs for the specified category from the list endpoint
                    setArticles(data.blogs?.[categoryId]?.blogs || []);
                }
            } catch (err) {
                console.error('Error fetching articles:', err);
                setError(err.message);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [articleId, categoryId, i18n.language]);

    // Ensure articles is an array before mapping
    const slidesData = Array.isArray(articles) ? articles.map(article => ({
        imgSrc: article.fullPathInnerPhotoUrl,
        title: article.title,
        subTitle: article.content,
        readMoreUrl: `/articles/${article.id}`
    })) : [];

    return (
        <section className={`${directionStyle} flex flex-col justify-end lg:justify-center gap-10 items-center my-8 sm:my-16 lg:my-40 overflow-hidden`}>
            <aside className="flex flex-col w-3/4 lg:w-[311px] mb-12 lg:mb-0">
                {/* Titles */}
                <h1 data-aos="zoom-in" className="font-bold text-3xl sm:text-[40px]">{title || t('article_slider.title')}</h1>
                <h2 data-aos="zoom-in" className="sm:text-[22px] sm:leading-[26.63px] my-3 sm:my-8 lg:w-[311px]">{subTitle || t('article_slider.subTitle')}</h2>
                {/* More Button */}
                {!noBtn && (
                    <Link to={url}>
                        <button
                            className={`${buttonStyle} w-32 sm:w-[213px] h-12 sm:h-[65px] rounded-[10px] sm:text-lg text-primaryColor font-bold transition_all active:scale-110`}
                            style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                            data-aos="zoom-in"
                        >
                            {t('article_slider.more_button')}
                        </button>
                    </Link>
                )}
            </aside>

            {/* Slider Background*/}
            <span className={`${backgroundStyle} absolute w-11/12 lg:w-3/5 h-[480px] mb-0 sm:mb-1 lg:mb-10 sm:h-[620px] lg:h-[693px] -z-30`}></span>

            {/* Dynamic Slider Component */}
            {loading ? (
                <LoadingImage />
            ) : error ? (
                <div className="text-center text-red-500">Error loading articles: {error}</div>
            ) : slidesData.length === 0 ? (
                <div className="text-center text-gray-500">No articles found</div>
            ) : (
                <ImageSlider slides={slidesData} direction={direction} />
            )}
        </section>
    );
};

ArticleSlider.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
    url: PropTypes.string.isRequired,
    directionStyle: PropTypes.string,
    buttonStyle: PropTypes.string,
    backgroundStyle: PropTypes.string,
    direction: PropTypes.string,
    articleId: PropTypes.string,
    categoryId: PropTypes.number,
    noBtn: PropTypes.bool
};