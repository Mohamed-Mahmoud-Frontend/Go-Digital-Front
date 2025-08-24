import { useTranslation } from 'react-i18next';
// Component
import { CircleDashed } from "@/components"
// Icons
import Icon1 from "@/assets/icons/forCircleDashed/information.png"
import Icon2 from "@/assets/icons/forCircleDashed/packages.png"
import Icon3 from "@/assets/icons/forCircleDashed/online.png"
import Icon4 from "@/assets/icons/forCircleDashed/contract.png"

export const HowWorksSection = () => {
    const { t } = useTranslation();

    return (
        <main className="mb-0 sm:mb-24">
            <h1 data-aos="zoom-in" className="text-center text-2xl lg:text-[40px] font-bold my-10 sm:my-12">{t('how_works_section.title')}</h1>
            <section data-aos="fade-right" className="flex flex-col sm:flex-row items-start vsm:items-stretch max-w-[1202px] mx-20 vsm:mx-10 xl:m-auto">
                <CircleDashed title={t('how_works_section.step1')}>
                    <img src={Icon1} alt="Icon1" className="w-full h-full p-5" />
                </CircleDashed>
                {/* Dashed Line */}
                <span className="w-0 h-10 mx-14 vsm:m-auto sm:w-full sm:h-0 border-[2px] border-secondaryColor border-dashed"></span>

                <CircleDashed title={t('how_works_section.step2')}>
                    <img src={Icon2} alt="Icon2" className="w-full h-full p-5" />
                </CircleDashed>
                {/* Dashed Line */}
                <span className="w-0 h-10 mx-14 vsm:m-auto sm:w-full sm:h-0 border-[2px] border-secondaryColor border-dashed"></span>

                <CircleDashed title={t('how_works_section.step3')}>
                    <img src={Icon3} alt="Icon3" className="w-full h-full p-5" />
                </CircleDashed>
                {/* Dashed Line */}
                <span className="w-0 h-10 mx-14 vsm:m-auto sm:w-full sm:h-0 border-[2px] border-secondaryColor border-dashed"></span>

                <CircleDashed title={t('how_works_section.step4')}>
                    <img src={Icon4} alt="Icon4" className="w-full h-full p-5" />
                </CircleDashed>
            </section>
        </main>
    )
}