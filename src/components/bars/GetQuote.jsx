import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import {useTranslation} from "react-i18next";

export const GetQuote = ({ url }) => {
    const { t } = useTranslation();
    return (
        <footer className="flex sm:hidden sticky bottom-0 justify-center items-center h-14 bg-primaryBgColor">
            <Link to={url}>
                <button
                    className="w-28 h-9 rounded-lg text-sm font-bold bg-secondaryColor text-primaryColor hover:text-secondaryColor hover:bg-primaryColor transition_all active:scale-110"
                    style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                >
                    {t('hero_products_section.get_quote_button')}
                </button>
            </Link>
        </footer>
    )
}

GetQuote.propTypes = {
    url: PropTypes.string.isRequired,
}