import { useTranslation } from 'react-i18next';

const styles = {
    paragraphStyle: `flex justify-center items-center text-primaryColor border border-primaryColor p-1 rounded-[20px] w-full h-[121.159px] text-sm vsm:text-base md:text-lg font-medium hover:text-secondaryColor hover:border-secondaryColor cursor-pointer transition_all`
}

export const WarrantiesSection = () => {
    const { t } = useTranslation();

    return (
        <section className="bg-primaryBgColor rounded-3xl lg:rounded-[58px] text-center mt-10 md:mt-[139px] mx-7 lg:mx-20 p-5 vsm:p-8 lg:p-12">
            {/* Head Titles */}
            <h1 data-aos="zoom-in" className="font-extrabold text-2xl leading-[50px] sm:text-[40px] text-primaryColor">
                {t('warranties_section.title')}
            </h1>

            {/* Warranties for desktop and tablet view */}
            <article className="hidden md:flex flex-col justify-center items-center gap-5 mt-16 mb-10">
                <span className="flex flex-col sm:flex-row justify-around gap-5 w-full">
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.0')}</p>
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.1')}</p>
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.2')}</p>
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.3')}</p>
                </span>
                <span className="flex flex-col sm:flex-row justify-around gap-5 w-full">
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.4')}</p>
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.5')}</p>
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.6')}</p>
                    <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.7')}</p>
                </span>
            </article>

            {/* Warranties custom arrangement for mobile view */}
            <article className="flex md:hidden flex-col justify-center items-center gap-5 my-10">
                <div className="flex flex-col md:flex-row justify-around gap-5 w-full">
                    <span className="flex gap-3">
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.0')}</p>
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.1')}</p>
                    </span>
                    <span className="flex gap-3">
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.2')}</p>
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.3')}</p>
                    </span>
                </div>
                <div className="flex flex-col md:flex-row justify-around gap-5 w-full">
                    <span className="flex gap-3">
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.4')}</p>
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.5')}</p>
                    </span>
                    <span className="flex gap-3">
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.6')}</p>
                        <p data-aos="zoom-in" className={styles.paragraphStyle}>{t('warranties_section.warranties.7')}</p>
                    </span>
                </div>
            </article>
        </section>
    )
}