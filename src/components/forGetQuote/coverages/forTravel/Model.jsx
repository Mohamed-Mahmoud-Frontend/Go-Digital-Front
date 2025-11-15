// src/components/Model.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as iconsUtil from "@/utils/icons.util";

export const Model = ({ show, onClose, icon, title, description }) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-title"
    >
      <aside
        className="bg-white p-5 rounded-2xl shadow-xl mx-4 vsm:max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        style={{ animationFillMode: "both" }}
      >
        {/* Close Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-[#FACABC] hover:text-secondaryColor focus:outline-none focus:ring-2 focus:ring-secondaryColor focus:ring-offset-2 rounded-full p-1 transition-colors"
            aria-label={t("common.close")}
          >
            <iconsUtil.ModelCloseIcon />
          </button>
        </div>

        {/* Main Content */}
        <div className="text-center mt-4">
          {/* Icon */}
          <div className="flex justify-center scale-[2] vsm:scale-[2.5] text-secondaryColor mb-6">
            {icon}
          </div>

          {/* Title */}
          <h2
            id="model-title"
            className="Inter_font text-xl vsm:text-2xl font-bold text-secondaryColor mb-3"
          >
            {title}
          </h2>

          {/* Description */}
          <p className="Inter_font text-sm vsm:text-base text-gray-700 leading-relaxed max-w-[380px] mx-auto px-2">
            {description || t("common.no_details_available")}
          </p>
        </div>

        {/* Contact Button */}
        <div className="mt-8 text-center">
          <Link
            to="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-secondaryColor text-secondaryColor text-sm vsm:text-base font-bold px-6 vsm:px-8 py-2 vsm:py-3 rounded-lg 
                       hover:bg-secondaryColor hover:text-white 
                       focus:outline-none focus:ring-2 focus:ring-secondaryColor focus:ring-offset-2 
                       transition-all duration-200 transform hover:scale-105"
            aria-label={t("model.contact_button")}
          >
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
  description: PropTypes.string,
};