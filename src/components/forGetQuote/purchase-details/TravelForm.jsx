// src/components/forGetQuote/purchase-details/TravelForm.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components";
import { CountryCodeSelect } from "../../CountryCodeSelect";
import api from "../../../API/axios";

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

  // تحميل البيانات
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem("travelFormData", JSON.stringify(formData));
    }
  }, [formData, isOpen]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get("/user/details");
      const data = response.data;

      setFormData((prev) => ({
        ...prev,
        name: data.first_name || "",
        surname: data.last_name || "",
        identification: data.identification || data.id_passport || "",
        email: data.email || "",
        mobileNumber: data.mobile_number || "",
        phoneNumber: data.phone || "",
        address: data.address || "",
      }));
    } catch (err) {
      console.error("Failed to fetch user:", err);
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
      // === 1. جلب البيانات من localStorage ===
      const stored = JSON.parse(localStorage.getItem("travelQuoteData") || "{}");
      const quoteData = stored.formData || {};
      const selected = stored.selectedQuote || selectedQuote;

      if (!selected?.id) throw new Error("No plan selected");

      // === 2. تحقق من الأشخاص ===
      const persons = (quoteData.step4?.persons || []).map((p, i) => {
        const name = userDetails?.step4?.persons?.[i]?.name || p.name || "";
        const id = userDetails?.step4?.persons?.[i]?.identification || p.identification || "";
        const dob = p.dateBirth || "";

        if (!name || !id || !dob) {
          throw new Error(t("travel_form.errors.missing_person_data"));
        }

        return { date_birth: dob, fullName: name, identification: id };
      });

      if (persons.length === 0) {
        throw new Error(t("travel_form.errors.no_persons"));
      }

      // === 3. بناء الـ payload ===
      const payload = {
        from_country: quoteData.step1?.fromCountryId || "",
        to_country: quoteData.step1?.toCountryId || [],
        start_date: quoteData.step2?.startDate || "",
        end_date: quoteData.step2?.endDate || "",
        insured_type: quoteData.step3?.insuredTypeId || "",
        persons,
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
        plan_id: selected.id,
        plan_duration: selected.duration || 1,
      };

      // === 4. تحقق من الحقول الأساسية ===
      const required = ["from_country", "to_country", "start_date", "end_date", "insured_type", "plan_id"];
      for (const key of required) {
        if (!payload[key] || (Array.isArray(payload[key]) && payload[key].length === 0)) {
          throw new Error(t(`travel_form.errors.missing_${key}`));
        }
      }

      // === 5. إرسال الطلب ===
      const response = await api.post("/user/travelInsurance/acceptQuote", payload);
      const result = response.data;

      if (result.formUrl) {
        window.location.href = result.formUrl;
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          localStorage.removeItem("travelFormData");
        }, 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || t("travel_form.errors.submit_failed");
      setError(msg);
      console.error("Submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(formData).every(v => v && v.toString().trim() !== "");

  if (!isOpen) return null;

  return (
    <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-xl w-full max-w-[560px] md:max-w-[800px] mx-auto my-10 px-6 py-8">

        <button onClick={onClose} className="absolute top-6 right-6 text-[#FACABC] hover:text-secondaryColor transition-colors">
          <iconsUtil.CloseFormIcon />
        </button>

        <header className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-medium text-primaryBgColor">
            {t("travel_form.step1.header")}
          </h1>
          <h2 className="mt-1 text-lg font-semibold text-primaryBgColor">
            {t("travel_form.step1.subheader")}
          </h2>
        </header>

        <hr className="border border-[#FACABC] w-2/3 mx-auto my-6" />

        <h3 className="text-center text-lg font-semibold text-secondaryColor mb-5">
          {t("travel_form.step1.progress.personal_details")}
        </h3>

        {error && (
          <div className="w-full max-w-[476px] mx-auto p-3 mb-4 text-red-700 bg-red-100 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full max-w-[476px] mx-auto p-3 mb-4 text-green-700 bg-green-100 rounded-lg text-center text-sm">
            {t("travel_form.success.form_sent")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input type="text" name="name" placeholder={t("travel_form.step1.placeholders.name")} value={formData.name} onChange={handleChange} required className="w-full max-w-[476px] mx-auto block h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />
          <input type="text" name="surname" placeholder={t("travel_form.step1.placeholders.surname")} value={formData.surname} onChange={handleChange} required className="w-full max-w-[476px] mx-auto block h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />
          <input type="text" name="identification" placeholder={t("travel_form.step1.placeholders.identification")} value={formData.identification} onChange={handleChange} required className="w-full max-w-[476px] mx-auto block h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />

          <div className="flex gap-3 max-w-[476px] mx-auto">
            <div className="w-[110px]">
              <CountryCodeSelect value={formData.mobileCountryCode} onChange={(c) => setFormData(p => ({ ...p, mobileCountryCode: c }))} isInvalid={!formData.mobileCountryCode} />
            </div>
            <input type="tel" name="mobileNumber" placeholder={t("travel_form.step1.placeholders.mobile")} value={formData.mobileNumber} onChange={handleChange} required className="flex-1 h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />
          </div>

          <div className="flex gap-3 max-w-[476px] mx-auto">
            <div className="w-[110px]">
              <CountryCodeSelect value={formData.phoneCountryCode} onChange={(c) => setFormData(p => ({ ...p, phoneCountryCode: c }))} isInvalid={!formData.phoneCountryCode} />
            </div>
            <input type="tel" name="phoneNumber" placeholder={t("travel_form.step1.placeholders.phone")} value={formData.phoneNumber} onChange={handleChange} required className="flex-1 h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />
          </div>

          <input type="email" name="email" placeholder={t("travel_form.step1.placeholders.email")} value={formData.email} onChange={handleChange} required className="w-full max-w-[476px] mx-auto block h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />
          <input type="text" name="address" placeholder={t("travel_form.step1.placeholders.address")} value={formData.address} onChange={handleChange} required className="w-full max-w-[476px] mx-auto block h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] focus:border-black focus:outline-none" />

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full max-w-[540px] mx-auto block h-[50px] text-white font-bold text-xl rounded-[30px] mt-8 transition-all
              ${isFormValid && !isLoading ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}
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