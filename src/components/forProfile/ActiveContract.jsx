import { Header, ProtectedRoute } from "@/components";
import * as iconsUtil from "@/utils/icons.util";
import { useTranslation } from 'react-i18next';

export const ActiveContract = () => {
    const { t } = useTranslation();

    return (
        <ProtectedRoute>
            <>
                <Header />
                <main className="Inter_font flex flex-col lg:flex-row justify-center items-baseline gap-7 my-10 mx-5">

                    {/* Insurance Details Section */}
                    <section
                        className="w-full lg:w-auto 2xl:w-[778px] bg-[#FFEFEA] rounded-3xl"
                        style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                    >
                        <h1 className="max-w-[683px] vsm:text-xl sm:text-3xl text-left font-medium m-8">{t('active_contract.title')}</h1>
                        <hr className="border border-[#FACABC] mx-5" />

                        <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 sm:px-14">
                            {/* Insurance Company */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.CompanyIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.insurance_company')}</h1>
                                    <h2 className="text-sm sm:text-base">HDI Global Specialty SE</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Insurance Period */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.PeriodIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.insurance_period')}</h1>
                                    <h2 className="text-sm sm:text-base">12μηνη</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Insured Person */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.PersonIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.insured_person')}</h1>
                                    <h2 className="text-sm sm:text-base">Αμπντούλ</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Nationality */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.TravellingToIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.nationality')}</h1>
                                    <h2 className="text-sm sm:text-base">Άγιος Μαρτίνος</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Identity Card */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.IDIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.identity_card')}</h1>
                                    <h2 className="text-sm sm:text-base">567890</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Birth Date */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.CakeIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.birth_date')}</h1>
                                    <h2 className="text-sm sm:text-base">04/05/1980 (44 χρονών)</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Gender */}
                            <article className="flex gap-4 vsm:gap-7 items-center">
                                <iconsUtil.GenderIcon />
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.gender')}</h1>
                                    <h2 className="text-sm sm:text-base">Αρσενικό</h2>
                                </span>
                            </article>
                        </div>
                    </section>

                    {/* Cover Details Section */}
                    <section
                        className="relative w-full lg:w-[582px] bg-[#FFEFEA] rounded-3xl border border-[#FDE5DE]"
                        style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                    >
                        <div className="flex flex-row-reverse sm:flex-row sm:justify-between justify-end gap-5 items-center m-8">
                            <h1 className="max-w-[683px] text-xl sm:text-2xl lg:text-3xl text-center font-medium">{t('active_contract.coverages')}</h1>
                            <iconsUtil.DownloadIcon />
                        </div>

                        <hr className="border border-[#FACABC] mx-5" />

                        {/* Cover Details Rows */}
                        <div className="flex flex-col gap-6 items-start justify-center py-5 px-4 vsm:px-8 xl:pt-28 xl:max-h-[705px] xl:overflow-y-scroll overflow-x-hidden">
                            {/* Death Coverage */}
                            <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                                <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">500€</p>
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.details.death')}</h1>
                                    <h2 className="text-sm sm:text-base">ΜΕΡΟΣ Β</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Total Disability */}
                            <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                                <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">15.000€</p>
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.details.total_disability')}</h1>
                                    <h2 className="text-sm sm:text-base">Συμμετοχή του ασφαλιζόμενου 20% για κάθε μία απαίτηση</h2>
                                    <ul className="list-disc ml-5 mt-3 list-outside text-sm sm:text-base">
                                        <li>Μόνιμη ολική ανικανότητα από ατύχημα</li>
                                        <li className="mt-3">Μόνιμη μερική ανικανότητα από ατύχημα (ποσοστό με βάση τον πίνακα αποζημίωσης του ασφαλιστηρίου)</li>
                                    </ul>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Hospitalization */}
                            <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                                <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">10.000€</p>
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.details.hospitalization')}</h1>
                                    <h2 className="text-sm sm:text-base">Μόνο εντός δημοσίου νοσοκομείου. Ανώτατο όριο κατά περιστατικό και συνολικά ετησίως έως 10.000€. (συμμετοχή του ασφαλιζόμενου 20% για κάθε μία απαίτηση)</h2>
                                </span>
                            </article>
                            <hr className="border border-[#FACABC] w-full" />

                            {/* Medical Expenses */}
                            <article className="flex flex-col tiny:flex-row gap-4 xl:gap-7 items-start">
                                <p className="flex justify-center items-center w-20 sm:w-[107px] h-[33px] flex-shrink-0 rounded-[10px] bg-white border border-[#facabc66] text-secondaryColor text-center font-semibold sm:text-xl">1.500€</p>
                                <span>
                                    <h1 className="sm:text-lg font-semibold text-secondaryColor">{t('active_contract.details.medical_expenses')}</h1>
                                    <h2 className="text-sm sm:text-base">Μόνο εντός δημοσίου νοσοκομείου. Ανώτατο όριο κατά περιστατικό και συνολικά ετησίως έως 1.500€. (συμμετοχή του ασφαλιζόμενου 20% για κάθε μία απαίτηση)</h2>
                                </span>
                            </article>
                        </div>

                        <div className="absolute -bottom-36 p-5 w-full bg-white border-none">
                            {/* Total Amount */}
                            <h1 className="text-2xl py-2 sm:text-4xl text-center font-semibold text-secondaryColor w-full">{t('active_contract.amount_payed')} €175.00</h1>

                            {/* Proceed Button */}
                            <button
                                className="text-center sm:text-xl font-bold bg-secondaryColor hover:bg-secondaryColor/70 text-white rounded-[30px] py-3 w-full transition-all"
                                style={{ boxShadow: "0px -2px 4px 0px #FFEFEA" }}
                                onClick={() => window.history.back()}
                            >
                                {t('active_contract.back_button')}
                            </button>
                        </div>
                    </section>
                </main>
            </>
        </ProtectedRoute>
    )
}