import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import PropTypes from "prop-types";
// Icons
import * as Icons from "@/utils/icons.util";

// Product options
const products = [
    { key: "travel", route: "/get-a-quote-travel" },
    { key: "foreigners", route: "/get-a-quote-foreigners" },
    { key: "intermediaries", route: "/get-a-quote-intermediaries" },
    { key: "liability", route: "/get-a-quote-liability" },
    { key: "guarantee", route: "/get-a-quote-guarantee" },
];

export const GetQuotePopup = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <main className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <section className="relative bg-[#F1EEEC] rounded-[39px] p-8 shadow-lg w-full max-w-[609px] mx-10">
                <h2 className="text-3xl sm:text-[42px] font-semibold text-center m-6">{t('get_quote_popup.title')}</h2>

                <article className="flex flex-col gap-3">
                    {products.map((product) =>
                        <Link
                            to={product.route}
                            key={product.key}
                            className="flex w-full max-w-[380px] mx-auto px-5 gap-3 items-center h-20 sm:h-[92px] bg-secondaryColor rounded-full"
                            style={{ boxShadow: "inset 0 4px 4px rgba(0, 0, 0, 0.2)" }}
                        >
                            <span className="flex justify-center items-center bg-secondaryBgColor text-secondaryColor rounded-full p-3 sm:p-[14px]">
                                <Icons.PopUpPlaneIcon />
                            </span>
                            <h3 className="text-primaryColor text-sm vsm:text-base sm:text-lg font-bold text-left">{t(`get_quote_popup.products.${product.key}`)}</h3>
                        </Link>
                    )}
                </article>

                {/* Close button */}
                <span
                    onClick={onClose}
                    className="absolute top-7 right-7 cursor-pointer"
                >
                    <Icons.ClosePopUpIcon />
                </span>
            </section>
        </main>
    )
}

GetQuotePopup.propTypes = {
    onClose: PropTypes.func.isRequired,
};