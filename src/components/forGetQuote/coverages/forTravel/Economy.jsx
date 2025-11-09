import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
// Icons
import * as iconsUtil from "@/utils/icons.util";

export const Economy = ({ id, show, setShow, background = "white", quote, index }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleShow = () => {
        setShow((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleQuoteSelection = () => {
        if (quote) {
            const storedData = JSON.parse(localStorage.getItem('travelQuoteData') || '{}');
            storedData.selectedQuote = quote;
            localStorage.setItem('travelQuoteData', JSON.stringify(storedData));
        }
        navigate("/get-a-quote-travel/proceed");
    };

    const getCoverageValue = (coverage, key) => {
        if (!coverage || !coverage[key]) return 'N/A';
        return coverage[key].value || 'N/A';
    };

    const getCoverageText = (coverage, key) => {
        if (!coverage || !coverage[key]) return 'N/A';
        return coverage[key].text || 'N/A';
    };

    const getCoverageLink = (coverage, key) => {
        if (!coverage || !coverage[key] || !coverage[key].link) return '#'; 
        return coverage[key].link;
    };

    return (
        <section
            className={`bg-${background} w-full overflow-hidden rounded-t-[15px] cursor-pointer transition-all`}
            style={{ boxShadow: "0px -2px 4px 0px rgba(65, 72, 225, 0.15)" }}
            onClick={handleShow}
        >
            <header className="w-full flex justify-between px-10 items-center vsm:text-xl font-semibold text-secondaryColor pt-7 pb-5">
                <h1>{quote?.name || `Plan ${index + 1}`}</h1>
                <p>{t('hero_products_section.total')} {quote?.currency || '€'}{quote?.price || '0.00'}</p>
            </header>
            <hr className="border border-[#FACABC] mx-5" />

            {show && <p className="text-center text-[9px] vsm:text-sm p-1">Click on each icon to learn more about the cover</p>}

            {/* Row 1 */}
            <div className="flex justify-around items-center p-5">
                <a
                    href={getCoverageLink(quote?.coverage, 'cancellation')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                >
                    <iconsUtil.CancellationIcon />
                    <p className="flex flex-col justify-center items-center text-black">
                        {getCoverageText(quote?.coverage, 'cancellation')}
                        <span className="font-medium">{getCoverageValue(quote?.coverage, 'cancellation')}</span>
                    </p>
                </a>
                <a
                    href={getCoverageLink(quote?.coverage, 'medical')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                >
                    <iconsUtil.MedicIcon />
                    <p className="flex flex-col justify-center items-center text-black">
                        {getCoverageText(quote?.coverage, 'medical')}
                        <span className="font-medium">{getCoverageValue(quote?.coverage, 'medical')}</span>
                    </p>
                </a>
                <a
                    href={getCoverageLink(quote?.coverage, 'baggage')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                >
                    <iconsUtil.BaggageIcon />
                    <p className="flex flex-col justify-center items-center text-black">
                        {getCoverageText(quote?.coverage, 'baggage')}
                        <span className="font-medium">{getCoverageValue(quote?.coverage, 'baggage')}</span>
                    </p>
                </a>
            </div>

            {show && (
                <Fragment>
                    {/* Row 2 */}
                    <div className="flex justify-around items-center p-5">
                        <a
                            href={getCoverageLink(quote?.coverage, 'accident')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                        >
                            <iconsUtil.PersonalAccidentIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {getCoverageText(quote?.coverage, 'accident')}
                                <span className="font-medium">{getCoverageValue(quote?.coverage, 'accident')}</span>
                            </p>
                        </a>
                        <a
                            href={getCoverageLink(quote?.coverage, 'delay')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                        >
                            <iconsUtil.TravelDelayIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {getCoverageText(quote?.coverage, 'delay')}
                                <span className="font-medium">{getCoverageValue(quote?.coverage, 'delay')}</span>
                            </p>
                        </a>
                        <a
                            href={getCoverageLink(quote?.coverage, 'possessions')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-20 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                        >
                            <iconsUtil.PersonalPossessionsIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {getCoverageText(quote?.coverage, 'possessions')}
                                <span className="font-medium">{getCoverageValue(quote?.coverage, 'possessions')}</span>
                            </p>
                        </a>
                    </div>

                    {/* Row 3 */}
                    <div className="flex justify-around items-center p-5">
                        <a
                            href={getCoverageLink(quote?.coverage, 'money')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-28 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                        >
                            <iconsUtil.PersonalMoneyIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {getCoverageText(quote?.coverage, 'money')}
                                <span className="font-medium">{getCoverageValue(quote?.coverage, 'money')}</span>
                            </p>
                        </a>
                        <a
                            href={getCoverageLink(quote?.coverage, 'liability')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-28 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                        >
                            <iconsUtil.PersonalLiabilityIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {getCoverageText(quote?.coverage, 'liability')}
                                <span className="font-medium">{getCoverageValue(quote?.coverage, 'liability')}</span>
                            </p>
                        </a>
                        <a
                            href={getCoverageLink(quote?.coverage, 'expenses')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center w-28 vsm:w-auto vsm:max-w-[133px] text-secondaryColor hover:text-black"
                        >
                            <iconsUtil.LegalExpensesIcon />
                            <p className="flex flex-col justify-center items-center text-black">
                                {getCoverageText(quote?.coverage, 'expenses')}
                                <span className="font-medium">{getCoverageValue(quote?.coverage, 'expenses')}</span>
                            </p>
                        </a>
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleQuoteSelection}
                            className="group flex items-center justify-between bg-white w-4/5 my-5 px-5 pl-8 h-12 sm:h-14 text-sm vsm:text-base font-medium border rounded-[27.5px] shadow-md transition-all text-black"
                        >
                            Next
                            <span className="flex justify-center items-center bg-secondaryColor w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45">
                                <iconsUtil.QuoteArrowIcon />
                            </span>
                        </button>
                    </div>
                </Fragment>
            )}
        </section>
    );
};

Economy.propTypes = {
    id: PropTypes.string.isRequired,
    show: PropTypes.object.isRequired,
    setShow: PropTypes.func.isRequired,
    background: PropTypes.string,
    quote: PropTypes.object,
    index: PropTypes.number.isRequired
};