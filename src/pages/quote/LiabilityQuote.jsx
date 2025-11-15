import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const LOCAL_STORAGE_KEY = "liabilityVehicles";

export const LiabilityQuote = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return {
      vehicles: saved ? JSON.parse(saved) : [],
    };
  });

  const [vehicleInput, setVehicleInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData.vehicles));
  }, [userData.vehicles]);

  useEffect(() => {
    const renewDataStr = localStorage.getItem("renewContractData");
    if (renewDataStr) {
      try {
        const { contractData } = JSON.parse(renewDataStr);
        if (contractData && Array.isArray(contractData.vehicles) && contractData.vehicles.length > 0) {
          const uniqueVehicles = [...new Set(contractData.vehicles.map(v => v.toString().trim()))].filter(Boolean);
          setUserData(prev => ({ ...prev, vehicles: uniqueVehicles }));
          localStorage.removeItem("renewContractData");
        }
      } catch (err) {
        console.error("Failed to load renewal data:", err);
      }
    }
  }, []);

  const handleVehicleInputChange = (e) => {
    const value = e.target.value;
    setVehicleInput(value);
    if (error && value.trim()) {
      setError("");
    }
  };

  const addVehicle = () => {
    const trimmed = vehicleInput.trim();
    if (!trimmed) {
      setError("Please enter a vehicle");
      return;
    }
    if (trimmed.length < 2) {
      setError("Vehicle is too short");
      return;
    }
    if (userData.vehicles.includes(trimmed)) {
      setError("Vehicle already exists");
      return;
    }

    setUserData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, trimmed],
    }));
    setVehicleInput("");
    setError("");
  };

  const removeVehicle = (index) => {
    setUserData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  const handleVehicleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVehicle();
    }
  };

  const isInputValid = () => userData.vehicles.length > 0;

  const handleSubmit = () => {
    if (!isInputValid()) {
      setError("Please add at least one vehicle");
      return;
    }
    localStorage.setItem("liabilityQuoteData", JSON.stringify({ vehicles: userData.vehicles }));
    navigate("/get-a-quote-liability/proceed");
  };

  const handleBack = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("liabilityQuoteData");
    window.history.back();
  };

  if (isLoading) {
    return (
      <>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <main>
      <QuoteHeader />

      <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        <div className="my-20 flex flex-wrap justify-center items-center gap-5">
          <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
            <Icons.QuoteCarIcon />
            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
              {t("liability_quote_page.form.title")}
            </h1>

            <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vehicleInput}
                  onChange={handleVehicleInputChange}
                  onKeyPress={handleVehicleKeyPress}
                  placeholder={t("liability_quote_page.form.vehicles_placeholder")}
                  className={`flex-1 h-[55px] px-4 border rounded-[10px] font-semibold focus:outline-none transition-all
                    ${error ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3] focus:border-black"}`}
                />
                <button
                  onClick={addVehicle}
                  className="px-5 h-[55px] bg-secondaryColor text-white rounded-[10px] font-semibold hover:bg-secondaryColor/80 transition-all"
                >
                  {t("liability_quote_page.form.add_button")}
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
              )}

              {userData.vehicles.length > 0 && (
                <div className="mt-4 w-full flex flex-wrap gap-2">
                  {userData.vehicles.map((vehicle, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-200 py-2 px-3 rounded-full animate-fadeIn"
                    >
                      <span className="text-sm font-medium mr-2">{vehicle}</span>
                      <button
                        onClick={() => removeVehicle(index)}
                        className="flex items-center justify-center w-5 h-5 p-1 bg-gray-400 rounded-full hover:bg-red-500 transition-all"
                      >
                        <Icons.CloseIcon className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 vsm:gap-10">
          <ActionButton
            text={t("liability_quote_page.buttons.previous")}
            iconPosition="left"
            onClick={handleBack}
          />

          <ActionButton
            text={t("liability_quote_page.buttons.next")}
            iconPosition="right"
            onClick={handleSubmit}
            isNext
            isDisabled={!isInputValid()}
          />
        </div>
      </section>
    </main>
  );
};

const ActionButton = ({ text, iconPosition, onClick, isDisabled, isNext }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`group flex items-center justify-between px-5 sm:px-3 
      ${isNext ? "sm:pl-16" : "sm:pr-14"} 
      w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
      border rounded-[27.5px] shadow-md transition-all
      ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-black"}`}
  >
    {iconPosition === "left" && (
      <span
        className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform -rotate-90 group-hover:-rotate-[135deg]
          ${isDisabled ? "bg-gray-300" : "bg-black"}`}
      >
        <Icons.QuoteArrowIcon />
      </span>
    )}
    {text}
    {iconPosition === "right" && (
      <span
        className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45
          ${isDisabled ? "bg-gray-300" : "bg-secondaryColor"}`}
      >
        <Icons.QuoteArrowIcon />
      </span>
    )}
  </button>
);

ActionButton.propTypes = {
  text: PropTypes.string.isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isNext: PropTypes.bool,
};