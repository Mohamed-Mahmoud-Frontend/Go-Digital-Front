import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import {useTranslation} from "react-i18next";
export const GetQuoteSideBT = ({ url }) => {
    const { t } = useTranslation();
    return (
        <Link
            to={url}
            data-aos="fade-left"
            className="hidden fixed bottom-5 -right-5 sm:flex justify-center items-center w-[150px] h-[55px] lg:w-[213px] lg:h-[65px] text-center lg:text-lg font-extrabold text-primaryColor bg-secondaryColor border border-primaryBgColor/60 rounded-s-[10px] cursor-pointer hover:bg-primaryBgColor active:scale-105"
            style={{ boxShadow: " 0px 4px 4px 0px rgba(0, 0, 0, 0.15)" }}
        >
            {t('hero_products_section.get_quote_button')}
        </Link>
    )
}

GetQuoteSideBT.propTypes = {
    url: PropTypes.string.isRequired,
}