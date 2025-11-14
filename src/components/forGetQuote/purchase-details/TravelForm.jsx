// src/components/forGetQuote/purchase-details/TravelForm.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components";
import { CountryCodeSelect } from "../../CountryCodeSelect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TravelForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    identification: "",
    email: "",
    mobileCountryCode: "+30",
    mobileNumber: "",
    phoneCountryCode: "+30",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("travelFormData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            mobileCountryCode: parsed.mobileCountryCode || "+30",
            phoneCountryCode: parsed.phoneCountryCode || "+30",
          }));
        } catch {
          fetchUserDetails();
        }
      } else {
        fetchUserDetails();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem("travelFormData", JSON.stringify(formData));
    }
  }, [formData, isOpen]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/user/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": i18n.language,
        },
      });

      if (!res.ok) return;
      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        name: data.first_name || data.name || "",
        surname: data.last_name || data.surname || "",
        identification: data.identification || data.id_passport || "",
        email: data.email || "",
        mobileNumber: data.mobile_number || data.phone || "",
        phoneNumber: data.phone || data.mobile_number || "",
        address: data.address || "",
        mobileCountryCode: "+30",
        phoneCountryCode: "+30",
      }));
    } catch (err) {
      console.error("Failed to fetch user details", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const storedData = JSON.parse(
        localStorage.getItem("travelQuoteData") || "{}"
      );

      const submissionData = {
        from_country: storedData.submissionData?.from_country || "",
        to_country: storedData.submissionData?.to_country || "",
        start_date: storedData.submissionData?.start_date || "",
        end_date: storedData.submissionData?.end_date || "",
        insured_type: storedData.submissionData?.insured_type || "",
        persons:
          storedData.submissionData?.persons?.map((p, i) => ({
            date_birth: p.date_birth,
            fullName: userDetails?.step4?.persons?.[i]?.name || "",
            identification:
              userDetails?.step4?.persons?.[i]?.identification || "",
          })) || [],
        insured_identification: formData.identification,
        holder_identification: formData.identification,
        holder_first_name: formData.name,
        holder_last_name: formData.surname,
        holder_email: formData.email,
        holder_phone_number: formData.phoneNumber,
        holder_phone_number_ext: formData.phoneCountryCode,
        holder_mobile_number: formData.mobileNumber,
        holder_mobile_number_ext: formData.mobileCountryCode,
        holder_address: formData.address,
        plan_id: selectedQuote?.id || 0,
        plan_duration: selectedQuote?.duration || 1,
      };

      const response = await fetch(
        `${API_BASE_URL}/user/travelInsurance/acceptQuote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || t("travel_form.errors.submit_failed"));
      }

      const result = await response.json();

      if (result.formUrl) {
        window.open(result.formUrl, "_self");
        onClose();
      } else {
        setSuccess(true);
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      setError(err.message || t("travel_form.errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.surname &&
    formData.identification &&
    formData.email &&
    formData.mobileCountryCode &&
    formData.mobileNumber &&
    formData.phoneCountryCode &&
    formData.phoneNumber &&
    formData.address;

  if (!isOpen) return null;

  return (
    <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50 overflow-y-auto">
      <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] md:max-w-[800px] mx-5 my-10 px-5 py-8">
        <button onClick={onClose} className="absolute top-7 right-7">
          <iconsUtil.CloseFormIcon />
        </button>

        <header className="text-center">
          <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">
            {t("travel_form.step1.header")}
          </h1>
          <h2 className="mt-1 font-semibold text-primaryBgColor">
            {t("travel_form.step1.subheader")}
          </h2>
        </header>

        <hr className="border border-[#FACABC] w-2/3 mx-auto my-6" />

        <h3 className="text-center font-semibold text-secondaryColor mb-5">
          {t("travel_form.step1.progress.personal_details")}
        </h3>

        {error && (
          <div className="w-full p-4 mb-4 text-red-600 bg-red-100 rounded-lg text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full p-4 mb-4 text-green-600 bg-green-100 rounded-lg text-center">
            {t("travel_form.success.form_sent")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder={t("travel_form.step1.placeholders.name")} value={formData.name} onChange={handleChange} required className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto block max-w-[476px]" />
          <input type="text" name="surname" placeholder={t("travel_form.step1.placeholders.surname")} value={formData.surname} onChange={handleChange} required className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto block max-w-[476px]" />
          <input type="text" name="identification" placeholder={t("travel_form.step1.placeholders.identification")} value={formData.identification} onChange={handleChange} required className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto block max-w-[476px]" />

          {/* Mobile */}
          <div className="flex gap-3 max-w-[476px] mx-auto">
            <div className="w-[110px]">
              <CountryCodeSelect
                value={formData.mobileCountryCode}
                onChange={(code) => setFormData((prev) => ({ ...prev, mobileCountryCode: code }))}
                isInvalid={!formData.mobileCountryCode}
              />
            </div>
            <input type="tel" name="mobileNumber" placeholder={t("travel_form.step1.placeholders.phone")} value={formData.mobileNumber} onChange={handleChange} required className="flex-1 h-[50px] px-5 border border-[#C3C3C3] rounded-[10px]" />
          </div>

          {/* Phone */}
          <div className="flex gap-3 max-w-[476px] mx-auto">
            <div className="w-[110px]">
              <CountryCodeSelect
                value={formData.phoneCountryCode}
                onChange={(code) => setFormData((prev) => ({ ...prev, phoneCountryCode: code }))}
                isInvalid={!formData.phoneCountryCode}
              />
            </div>
            <input type="tel" name="phoneNumber" placeholder={t("travel_form.step1.placeholders.phone")} value={formData.phoneNumber} onChange={handleChange} required className="flex-1 h-[50px] px-5 border border-[#C3C3C3] rounded-[10px]" />
          </div>

          <input type="email" name="email" placeholder={t("travel_form.step1.placeholders.email")} value={formData.email} onChange={handleChange} required className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto block max-w-[476px]" />
          <input type="text" name="address" placeholder={t("travel_form.step1.placeholders.address")} value={formData.address} onChange={handleChange} required className="w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto block max-w-[476px]" />

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full max-w-[540px] h-[50px] mx-auto block text-white font-bold text-xl rounded-[30px] mt-8 transition-all ${
              isFormValid && !isLoading
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? <LoadingSpinner /> : t("travel_form.step1.next_button")}
          </button>
        </form>
      </div>
    </div>
  );
};

TravelForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedQuote: PropTypes.object,
  userDetails: PropTypes.object,
};