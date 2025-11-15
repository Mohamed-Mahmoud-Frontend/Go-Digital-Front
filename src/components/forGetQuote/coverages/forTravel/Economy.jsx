// src/components/Economy.jsx
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
// Components
import { Model } from "@/components";
// Icons
import * as iconsUtil from "@/utils/icons.util";

export const Economy = ({
  id,
  show,
  setShow,
  background = "white",
  quote,
  index,
  onPrevious,
}) => {
  const navigate = useNavigate();
  const [modalDetails, setModalDetails] = useState({
    show: false,
    icon: null,
    title: "",
    description: "",
  });
  const { t } = useTranslation();

  // -----------------------------------------------------------------
  // 1. Toggle full plan visibility
  // -----------------------------------------------------------------
  const handleShow = () => {
    setShow((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // -----------------------------------------------------------------
  // 2. Open modal with icon details
  // -----------------------------------------------------------------
  const handleIconClick = (icon, title, description) => {
    if (!show) return;
    setModalDetails({ show: true, icon, title, description });
  };

  // -----------------------------------------------------------------
  // 3. Close modal
  // -----------------------------------------------------------------
  const handleCloseModal = () => {
    setModalDetails({ show: false, icon: null, title: "", description: "" });
  };

  // -----------------------------------------------------------------
  // 4. Store selected quote & go to proceed page
  // -----------------------------------------------------------------
  const handleQuoteSelection = () => {
    if (quote) {
      const storedData = JSON.parse(
        localStorage.getItem("travelQuoteData") || "{}"
      );
      storedData.selectedQuote = quote;
      localStorage.setItem("travelQuoteData", JSON.stringify(storedData));
    }
    navigate("/get-a-quote-travel/proceed");
  };

  // -----------------------------------------------------------------
  // 5. Safe getters for coverage (kept from original)
  // -----------------------------------------------------------------
  const getCoverageValue = (coverage, key) => {
    if (!coverage || !coverage[key]) return "N/A";
    return coverage[key].value || "N/A";
  };
  const getCoverageText = (coverage, key) => {
    if (!coverage || !coverage[key]) return "N/A";
    return coverage[key].text || "N/A";
  };

  // -----------------------------------------------------------------
  // 6. Icon mapper (dynamic, fallback to DefaultCoverageIcon)
  // -----------------------------------------------------------------
  const getIconByKey = (key) => {
    const map = {
      cancellation: <iconsUtil.CancellationIcon />,
      medical: <iconsUtil.MedicIcon />,
      baggage: <iconsUtil.BaggageIcon />,
      accident: <iconsUtil.PersonalAccidentIcon />,
      delay: <iconsUtil.TravelDelayIcon />,
      possessions: <iconsUtil.PersonalPossessionsIcon />,
      money: <iconsUtil.PersonalMoneyIcon />,
      liability: <iconsUtil.PersonalLiabilityIcon />,
      expenses: <iconsUtil.LegalExpensesIcon />,
    };
    return map[key.toLowerCase()] || <iconsUtil.DefaultCoverageIcon />;
  };

  // -----------------------------------------------------------------
  // 7. Split covers: first 3 always visible, rest on demand
  // -----------------------------------------------------------------
  const coverageEntries = Object.entries(quote?.coverage || {});
  const firstThree = coverageEntries.slice(0, 3);
  const restCovers = coverageEntries.slice(3);
  const hasMore = restCovers.length > 0;

  return (
    <section
      className={`bg-${background} w-full overflow-hidden rounded-t-[15px] cursor-pointer transition-all`}
      style={{ boxShadow: "0px -2px 4px 0px rgba(65, 72, 225, 0.15)" }}
      onClick={handleShow}
    >
      {/* ---------- Header ---------- */}
      <header className="w-full flex justify-between px-10 items-center vsm:text-xl font-semibold text-secondaryColor pt-7 pb-5">
        <h1>{quote?.name || `Plan ${index + 1}`}</h1>
        <p>
          {t("hero_products_section.total")} {quote?.currency || "EUR"}
          {quote?.price || "0.00"}
        </p>
      </header>
      <hr className="border border-[#FACABC] mx-5" />

      {/* ---------- First 3 covers (always visible) ---------- */}
      <div className="grid grid-cols-3 gap-5 p-5 max-w-3xl mx-auto">
        {firstThree.map(([key, cov]) => {
          const icon = getIconByKey(key);
          const title = getCoverageText(quote?.coverage, key);
          const value = getCoverageValue(quote?.coverage, key);
          const details = cov.details || t("common.no_details_available");

          return (
            <div
              key={key}
              className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center text-secondaryColor hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                handleIconClick(icon, title, details);
              }}
            >
              {icon}
              <p className="flex flex-col justify-center items-center text-black">
                <span className="text-xs vsm:text-sm">{title}</span>
                <span className="font-medium">{value}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* ---------- Expanded area (rest of covers + buttons) ---------- */}
      {show && (
        <Fragment>
          {/* Rest of the covers (if any) */}
          {hasMore && (
            <div className="grid grid-cols-3 gap-5 p-5 max-w-3xl mx-auto border-t border-[#FACABC]">
              {restCovers.map(([key, cov]) => {
                const icon = getIconByKey(key);
                const title = getCoverageText(quote?.coverage, key);
                const value = getCoverageValue(quote?.coverage, key);
                const details = cov.details || t("common.no_details_available");

                return (
                  <div
                    key={key}
                    className="flex flex-col justify-center gap-4 items-center text-sm vsm:text-lg text-center text-secondaryColor hover:text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIconClick(icon, title, details);
                    }}
                  >
                    {icon}
                    <p className="flex flex-col justify-center items-center text-black">
                      <span className="text-xs vsm:text-sm">{title}</span>
                      <span className="font-medium">{value}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show More / Show Less (optional toggle) */}
          {hasMore && (
            <div className="flex justify-center mb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // you can keep this if you want a separate toggle,
                  // otherwise just rely on the card click
                }}
                className="text-sm font-medium text-secondaryColor hover:text-black underline"
              >
                {t("common.show_more")}
              </button>
            </div>
          )}

          {/* Previous & Next buttons */}
          <div className="flex justify-center gap-3 px-5 pb-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="group flex items-center justify-center gap-2 bg-white w-2/5 h-12 text-sm vsm:text-base font-medium border rounded-[27.5px] shadow-md transition-all text-black"
            >
              <span className="flex justify-center items-center bg-black w-8 h-8 rounded-full transition-transform -rotate-90 group-hover:-rotate-[135deg]">
                <iconsUtil.QuoteArrowIcon />
              </span>
              {t("common.previous")}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuoteSelection();
              }}
              className="group flex items-center justify-center gap-2 bg-white w-2/5 h-12 text-sm vsm:text-base font-medium border rounded-[27.5px] shadow-md transition-all text-black"
            >
              {t("common.next")}
              <span className="flex justify-center items-center bg-secondaryColor w-8 h-8 rounded-full transition-transform group-hover:rotate-45">
                <iconsUtil.QuoteArrowIcon />
              </span>
            </button>
          </div>
        </Fragment>
      )}

      {/* ---------- Modal ---------- */}
      <Model
        show={modalDetails.show}
        onClose={handleCloseModal}
        icon={modalDetails.icon}
        title={modalDetails.title}
        description={modalDetails.description}
      />
    </section>
  );
};

Economy.propTypes = {
  id: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  background: PropTypes.string,
  quote: PropTypes.object,
  index: PropTypes.number.isRequired,
};