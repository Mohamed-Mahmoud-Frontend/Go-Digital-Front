import { useTranslation } from 'react-i18next';
import { ArticleSlider } from "../../components";

export const SlidesSection = () => {
    const { t } = useTranslation();

    return (
        <>
            {/* Εγγυητικές RTL SLide */}
            <ArticleSlider
                title={t('slides_section.latest_articles.title')}
                subTitle={t('slides_section.latest_articles.subTitle')}
                url="/blog/all"
                directionStyle="lg:flex-row-reverse lg:pr-32"
                buttonStyle="bg-primaryBgColor hover:bg-secondaryColor"
                backgroundStyle="bg-secondaryColor left-0 rounded-e-[58px]"
                direction="rtl"
                categoryId={0}
                noBtn={true}
            />

            {/* Travel LTR SLide */}
            <ArticleSlider
                title={t('slides_section.travel.title')}
                subTitle={t('slides_section.travel.subTitle')}
                url="/blog/travel"
                categoryId={1}
            />

            {/* Εγγυητικές RTL SLide */}
            <ArticleSlider
                title={t('slides_section.guarantees.title')}
                subTitle={t('slides_section.guarantees.subTitle')}
                url="/blog/guarantees"
                directionStyle="lg:flex-row-reverse lg:pr-32"
                buttonStyle="bg-primaryBgColor hover:bg-secondaryColor"
                backgroundStyle="bg-secondaryColor left-0 rounded-e-[58px]"
                direction="rtl"
                categoryId={5}
            />

            {/* Ευθύνης Οδικού Μεταφορέα LTR SLide */}
            <ArticleSlider
                title={t('slides_section.road_carrier.title')}
                subTitle={t('slides_section.road_carrier.subTitle')}
                url="/blog/road-carrier-professional-liability"
                categoryId={4}
            />

            {/* Προσωπικών Ατυχημάτων Αλλοδαπών RTL SLide */}
            <ArticleSlider
                title={t('slides_section.medical_foreigners.title')}
                subTitle={t('slides_section.medical_foreigners.subTitle')}
                url="/blog/medical-insurance-foreigners"
                directionStyle="lg:flex-row-reverse lg:pr-32"
                buttonStyle="bg-primaryBgColor hover:bg-secondaryColor"
                backgroundStyle="bg-secondaryColor left-0 rounded-e-[58px]"
                direction="rtl"
                categoryId={3}
            />

            {/* Ευθύνης Ασφαλιστικών Διαμεσολαβητών LTR SLide */}
            <ArticleSlider
                title={t('slides_section.liability_intermediaries.title')}
                subTitle={t('slides_section.liability_intermediaries.subTitle')}
                url="/blog/professional-liability-insurance-intermediaries"
                categoryId={2}
            />
        </>
    )
}