import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useBlogArticles = (categoryId) => {
    const { i18n } = useTranslation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/blog/list/`, {
                    headers: {
                        'Accept-Language': i18n.language // 'en' or 'el'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch articles');
                }
                const data = await response.json();

                // Get blogs for the specified category
                setArticles(data.blogs?.[categoryId]?.blogs || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [categoryId, i18n.language]);

    return { articles, loading, error };
};

export default useBlogArticles; 