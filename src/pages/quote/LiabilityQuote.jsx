import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
// Components 
import { QuoteHeader } from "@/components";
// Icons
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

export const LiabilityQuote = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        vehicles: [], // Array to store vehicles
    });
    const [vehicleInput, setVehicleInput] = useState(""); // Current vehicle input

    // Handle vehicle input change
    const handleVehicleInputChange = (e) => {
        setVehicleInput(e.target.value);
    };

    // Add vehicle to the list
    const addVehicle = () => {
        if (vehicleInput.trim() !== "") {
            setUserData((prevData) => ({
                ...prevData,
                vehicles: [...prevData.vehicles, vehicleInput.trim()]
            }));
            setVehicleInput("");
        }
    };

    // Remove vehicle from the list
    const removeVehicle = (index) => {
        setUserData((prevData) => ({
            ...prevData,
            vehicles: prevData.vehicles.filter((_, i) => i !== index)
        }));
    };

    // Handle Enter key press for vehicle input
    const handleVehicleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addVehicle();
        }
    };

    // Validate input
    const isInputValid = () => {
        return userData.vehicles.length > 0;
    };

    // Submit the data (API integration placeholder)
    const handleSubmit = () => {
        console.log("User Data:", userData);

        // Store vehicles data in localStorage for the proceed page
        localStorage.setItem('liabilityVehicles', JSON.stringify(userData.vehicles));

        // Navigate to the new page
        navigate("/get-a-quote-liability/proceed");
    };

    // Handle back button click to go to the previous page
    const handleBack = () => {
        window.history.back();
    };

    return (
        <main>
            {/* Header */}
            <QuoteHeader />

            <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">

                {/* Form */}
                <div className="my-20 flex flex-wrap justify-center items-center gap-5">
                    <div className="flex flex-col justify-center items-center gap-5 sm:gap-10">
                        <Icons.QuoteCarIcon />
                        <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                            {t('liability_quote_page.form.title')}
                        </h1>

                        {/* Vehicles Input */}
                        <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={vehicleInput}
                                    onChange={handleVehicleInputChange}
                                    onKeyPress={handleVehicleKeyPress}
                                    placeholder={t('liability_quote_page.form.vehicles_placeholder') || 'Enter vehicle name'}
                                    className="flex-1 h-[65px] px-4 border border-[#C3C3C3] rounded-[10px] font-semibold focus:outline-none focus:border-black"
                                />
                                <button
                                    onClick={addVehicle}
                                    className="px-7 h-[65px] bg-white text-[#C3C3C3] border border-[#C3C3C3] rounded-[10px] font-semibold hover:bg-secondaryColor hover:text-white transition-all"
                                >
                                    +
                                </button>
                            </div>

                            {/* Vehicles List */}
                            {userData.vehicles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {userData.vehicles.map((vehicle, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                                            <span className="text-sm font-medium">{vehicle}</span>
                                            <button
                                                onClick={() => removeVehicle(index)}
                                                className="text-red-500 hover:text-red-700 text-sm font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-3 vsm:gap-10">
                    {/* Back Button */}
                    <ActionButton
                        text={t('liability_quote_page.buttons.previous')}
                        iconPosition="left"
                        onClick={handleBack}
                    />

                    {/* Submit Button */}
                    <ActionButton
                        text={t('liability_quote_page.buttons.next')}
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

// Reusable Select Component for Dropdown
const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
    <select
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-semibold focus:outline-none 
            ${isInvalid ? "border-secondaryColor border-2  animate-pulse" : "border-[#C3C3C3]"}
            ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
    >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option, idx) => (
            <option key={idx} value={option} className="font-semibold">{option}</option>
        ))}
    </select>
);

TravelSelect.propTypes = {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    isInvalid: PropTypes.bool
};

// Reusable Button Component
const ActionButton = ({ text, iconPosition, onClick, isDisabled, isNext }) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className={`group flex items-center justify-between px-5 sm:px-3 
        ${isNext ? "sm:pl-16" : "sm:pr-14"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
        border rounded-[27.5px] shadow-md transition-all
        ${isDisabled ? "text-gray-400" : "text-black"}`}
    >
        {iconPosition === "left" && (
            <span
                className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform -rotate-90 group-hover:-rotate-[135deg] 
                ${isDisabled ? "bg-gray-300" : "bg-black"}`} // Change background to black when not disabled
            >
                <Icons.QuoteArrowIcon />
            </span>
        )}
        {text}
        {iconPosition === "right" && (
            <span className="flex justify-center items-center bg-secondaryColor w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45">
                <Icons.QuoteArrowIcon />
            </span>
        )}
    </button>
);

ActionButton.propTypes = {
    text: PropTypes.string.isRequired,
    iconPosition: PropTypes.oneOf(['left', 'right']).isRequired,
    onClick: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    isNext: PropTypes.bool
};