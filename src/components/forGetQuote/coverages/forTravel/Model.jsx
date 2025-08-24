import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
// Icons
import * as iconsUtil from "@/utils/icons.util";

// Modal component for displaying detailed information
export const Model = ({ show, onClose, icon, title, description }) => {
    const { t } = useTranslation();

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all">
            <aside className="bg-white p-5 rounded-2xl shadow-lg mx-12 vsm:max-w-md w-full overflow-hidden">
                {/* Close button */}
                <div className="flex justify-end items-end">
                    <button onClick={onClose} className="text-[#FACABC] hover:text-secondaryColor z-50">
                        <iconsUtil.ModelCloseIcon />
                    </button>
                </div>

                {/* Icon and Title */}
                <div className="my-4">
                    <div className="flex justify-center scale-[2] vsm:scale-[2.5] text-secondaryColor">
                        {icon}
                    </div>
                    <h2 className="Inter_font vsm:text-xl font-semibold text-center mt-4 vsm:mt-10">{title}</h2>

                    {/* Description */}
                    <p className="Inter_font text-center max-w-[350px] text-xs vsm:text-base mt-3 mx-auto">
                        {description}
                    </p>
                </div>

                {/* Contact Button */}
                <div className="text-center mt-4">
                    <Link to="/contact" className="border border-secondaryColor text-secondaryColor text-xs vsm:text-base font-bold px-4 vsm:px-7 py-2 vsm:py-3 rounded-lg">
                        {t("model.contact_button")}
                    </Link>
                </div>
            </aside>
        </div>
    );
};

Model.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
};