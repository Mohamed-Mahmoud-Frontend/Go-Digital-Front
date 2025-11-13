import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "guaranteeQuoteForm";

export const GuaranteeQuote = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiData, setApiData] = useState({
    questions: [],
    holder_types: [],
    type_of_guarantees: [],
  });
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          step1: {
            type_of_guarantee: "",
            type_other_desc: "",
            start_date: "",
            end_date: "",
          },
          step2: {
            holder_type: "",
            holder_first_name: "",
            holder_last_name: "",
            holder_identification: "",
            holder_contact_person: "",
          },
          step3: {
            holder_website: "",
            holder_email: "",
            holder_mobile_number_ext: "+30",
            holder_mobile_number: "",
            holder_phone_number_ext: "+30",
            holder_phone_number: "",
            holder_address: "",
            holder_tin: "",
            holder_tax_office: "",
          },
          step4: {
            beneficiary_name: "",
            beneficiary_email: "",
            beneficiary_mobile_number_ext: "+30",
            beneficiary_mobile_number: "",
            beneficiary_phone_number_ext: "+30",
            beneficiary_phone_number: "",
            beneficiary_address: "",
            beneficiary_tin: "",
            beneficiary_contact_person: "",
          },
          step5: {
            guarantee_number: "",
            guarantee_title: "",
            guarantee_value: "",
            guarantee_amount: "",
          },
          step6: { questions: [] },
        };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/user/bondInsurance/getArguments`,
          {
            headers: { "Accept-Language": i18n.language },
          }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setApiData(data);

        const questions = (data.questions || []).map((q) => ({
          id: q.id.toString(),
          answer: "",
          textarea: "",
        }));
        setUserData((prev) => ({ ...prev, step6: { questions } }));
      } catch {
        setError(t("common.error.failed_load_data") || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [i18n.language, t]);

  useEffect(() => {
    const prefill = localStorage.getItem("guarantee_type_prefill");
    if (prefill && apiData.type_of_guarantees.length > 0) {
      const exists = apiData.type_of_guarantees.some(
        (t) => t.id.toString() === prefill
      );
      if (exists) {
        setUserData((prev) => ({
          ...prev,
          step1: { ...prev.step1, type_of_guarantee: prefill },
        }));
        localStorage.removeItem("guarantee_type_prefill");
      }
    }
  }, [apiData.type_of_guarantees]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/user/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": i18n.language,
          },
        });
        if (!res.ok) return;
        const user = await res.json();
        setUserData((prev) => ({
          ...prev,
          step2: {
            ...prev.step2,
            holder_first_name: user.first_name || "",
            holder_last_name: user.last_name || "",
            holder_identification: user.identification || "",
            holder_contact_person: `${user.first_name || ""} ${
              user.last_name || ""
            }`.trim(),
          },
          step3: {
            ...prev.step3,
            holder_email: user.email || "",
            holder_mobile_number: user.mobile_number || "",
            holder_phone_number: user.phone_number || "",
            holder_address: user.address || "",
            holder_tin: user.tin || "",
            holder_tax_office: user.tax_office || "",
          },
        }));
      } catch {}
    };
    fetchUser();
  }, [i18n.language]);

  useEffect(() => {
    const renewDataStr = localStorage.getItem("renewContractData");
    if (renewDataStr && apiData.type_of_guarantees.length > 0 && apiData.holder_types.length > 0) {
      try {
        const { contractData: renewData } = JSON.parse(renewDataStr);

        const guaranteeType = apiData.type_of_guarantees.find(t =>
          t.id.toString() === renewData.type_of_guarantee_id?.toString() ||
          t.name === renewData.type_of_guarantee
        );

        const holderType = apiData.holder_types.find(h =>
          h.id.toString() === renewData.holder_type_id?.toString() ||
          h.name === renewData.holder_type
        );

        setUserData(prev => ({
          ...prev,
          step1: {
            type_of_guarantee: guaranteeType?.id?.toString() || "",
            type_other_desc: renewData.type_other_desc || "",
            start_date: renewData.start_date || "",
            end_date: renewData.end_date || "",
          },
          step2: {
            holder_type: holderType?.id?.toString() || "",
            holder_first_name: renewData.holder_first_name || renewData.holder_firstName || "",
            holder_last_name: renewData.holder_last_name || renewData.holder_lastName || "",
            holder_identification: renewData.holder_identification || "",
            holder_contact_person: renewData.holder_contact_person || "",
          },
          step3: {
            holder_website: renewData.holder_website || "",
            holder_email: renewData.holder_email || "",
            holder_mobile_number_ext: renewData.holder_mobile_number_ext || "+30",
            holder_mobile_number: renewData.holder_mobile_number || "",
            holder_phone_number_ext: renewData.holder_phone_number_ext || "+30",
            holder_phone_number: renewData.holder_phone_number || "",
            holder_address: renewData.holder_address || "",
            holder_tin: renewData.holder_tin || "",
            holder_tax_office: renewData.holder_tax_office || "",
          },
          step4: {
            beneficiary_name: renewData.beneficiary_name || "",
            beneficiary_email: renewData.beneficiary_email || "",
            beneficiary_mobile_number_ext: renewData.beneficiary_mobile_number_ext || "+30",
            beneficiary_mobile_number: renewData.beneficiary_mobile_number || "",
            beneficiary_phone_number_ext: renewData.beneficiary_phone_number_ext || "+30",
            beneficiary_phone_number: renewData.beneficiary_phone_number || "",
            beneficiary_address: renewData.beneficiary_address || "",
            beneficiary_tin: renewData.beneficiary_tin || "",
            beneficiary_contact_person: renewData.beneficiary_contact_person || "",
          },
          step5: {
            guarantee_number: renewData.guarantee_number || "",
            guarantee_title: renewData.guarantee_title || "",
            guarantee_value: renewData.guarantee_value || "",
            guarantee_amount: renewData.guarantee_amount || "",
          },
        }));

        localStorage.removeItem("renewContractData");
      } catch (err) {
        console.error("Failed to prefill from renew:", err);
      }
    }
  }, [apiData.type_of_guarantees, apiData.holder_types]);

  const handleInputChange = (step, field, value) => {
    setErrors({});
    setUserData((prev) => ({
      ...prev,
      [step]: { ...prev[step], [field]: value },
    }));
  };

  const handleQuestionChange = (id, answer, textarea = "") => {
    setErrors({});
    setUserData((prev) => ({
      ...prev,
      step6: {
        ...prev.step6,
        questions: prev.step6.questions.map((q) =>
          q.id === id ? { ...q, answer, textarea } : q
        ),
      },
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    const today = new Date().toISOString().split("T")[0];

    if (step === 0) {
      if (!userData.step1.type_of_guarantee) {
        newErrors.type_of_guarantee = t("validation.select_guarantee_type");
        isValid = false;
      }
      if (userData.step1.type_of_guarantee === "other" && !userData.step1.type_other_desc.trim()) {
        newErrors.type_other_desc = t("validation.enter_other_description");
        isValid = false;
      }
      if (!userData.step1.start_date) {
        newErrors.start_date = t("validation.enter_start_date");
        isValid = false;
      } else if (userData.step1.start_date < today) {
        newErrors.start_date = t("validation.start_date_future");
        isValid = false;
      }
      if (!userData.step1.end_date) {
        newErrors.end_date = t("validation.enter_end_date");
        isValid = false;
      } else if (userData.step1.end_date < userData.step1.start_date) {
        newErrors.end_date = t("validation.end_before_start");
        isValid = false;
      }
    }

    if (step === 1) {
      if (!userData.step2.holder_type) {
        newErrors.holder_type = t("validation.select_holder_type");
        isValid = false;
      }
      if (!userData.step2.holder_first_name.trim()) {
        newErrors.holder_first_name = t("validation.enter_first_name");
        isValid = false;
      } else if (userData.step2.holder_first_name.trim().length < 2) {
        newErrors.holder_first_name = t("validation.name_too_short");
        isValid = false;
      }
      if (!userData.step2.holder_last_name.trim()) {
        newErrors.holder_last_name = t("validation.enter_last_name");
        isValid = false;
      } else if (userData.step2.holder_last_name.trim().length < 2) {
        newErrors.holder_last_name = t("validation.name_too_short");
        isValid = false;
      }
    }

    if (step === 2) {
      if (userData.step3.holder_website && !/^https?:\/\/.+$/.test(userData.step3.holder_website.trim())) {
        newErrors.holder_website = t("validation.website_invalid");
        isValid = false;
      }
      if (!userData.step3.holder_email.trim()) {
        newErrors.holder_email = t("validation.enter_email");
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.step3.holder_email.trim())) {
        newErrors.holder_email = t("validation.email_invalid");
        isValid = false;
      }
      if (!userData.step3.holder_mobile_number.trim()) {
        newErrors.holder_mobile_number = t("validation.enter_mobile");
        isValid = false;
      } else if (!/^\d{10}$/.test(userData.step3.holder_mobile_number.trim())) {
        newErrors.holder_mobile_number = t("validation.mobile_invalid");
        isValid = false;
      }
      if (!userData.step3.holder_phone_number.trim()) {
        newErrors.holder_phone_number = t("validation.enter_phone");
        isValid = false;
      } else if (!/^\d{10}$/.test(userData.step3.holder_phone_number.trim())) {
        newErrors.holder_phone_number = t("validation.phone_invalid");
        isValid = false;
      }
      if (!userData.step3.holder_address.trim()) {
        newErrors.holder_address = t("validation.enter_address");
        isValid = false;
      }
      if (!userData.step3.holder_tin.trim()) {
        newErrors.holder_tin = t("validation.enter_tin");
        isValid = false;
      }
      if (!userData.step3.holder_tax_office.trim()) {
        newErrors.holder_tax_office = t("validation.enter_tax_office");
        isValid = false;
      }
    }

    if (step === 3) {
      if (!userData.step4.beneficiary_name.trim()) {
        newErrors.beneficiary_name = t("validation.enter_beneficiary_name");
        isValid = false;
      }
      if (!userData.step4.beneficiary_email.trim()) {
        newErrors.beneficiary_email = t("validation.enter_email");
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.step4.beneficiary_email.trim())) {
        newErrors.beneficiary_email = t("validation.email_invalid");
        isValid = false;
      }
      if (!userData.step4.beneficiary_mobile_number.trim()) {
        newErrors.beneficiary_mobile_number = t("validation.enter_mobile");
        isValid = false;
      } else if (!/^\d{10}$/.test(userData.step4.beneficiary_mobile_number.trim())) {
        newErrors.beneficiary_mobile_number = t("validation.mobile_invalid");
        isValid = false;
      }
      if (!userData.step4.beneficiary_phone_number.trim()) {
        newErrors.beneficiary_phone_number = t("validation.enter_phone");
        isValid = false;
      } else if (!/^\d{10}$/.test(userData.step4.beneficiary_phone_number.trim())) {
        newErrors.beneficiary_phone_number = t("validation.phone_invalid");
        isValid = false;
      }
      if (!userData.step4.beneficiary_address.trim()) {
        newErrors.beneficiary_address = t("validation.enter_address");
        isValid = false;
      }
      if (!userData.step4.beneficiary_tin.trim()) {
        newErrors.beneficiary_tin = t("validation.enter_tin");
        isValid = false;
      }
    }

    if (step === 4) {
      if (!userData.step5.guarantee_number.trim()) {
        newErrors.guarantee_number = t("validation.enter_guarantee_number");
        isValid = false;
      }
      if (!userData.step5.guarantee_title.trim()) {
        newErrors.guarantee_title = t("validation.enter_guarantee_title");
        isValid = false;
      }
      if (!userData.step5.guarantee_value || parseFloat(userData.step5.guarantee_value) <= 0) {
        newErrors.guarantee_value = t("validation.enter_valid_value");
        isValid = false;
      }
      if (!userData.step5.guarantee_amount || parseFloat(userData.step5.guarantee_amount) <= 0) {
        newErrors.guarantee_amount = t("validation.enter_valid_amount");
        isValid = false;
      }
    }

    if (step === 5) {
      const unanswered = userData.step6.questions.filter(q => !q.answer);
      if (unanswered.length > 0) {
        unanswered.forEach(q => {
          newErrors[`question_${q.id}`] = t("validation.answer_required");
        });
        isValid = false;
      }
      userData.step6.questions.forEach(q => {
        const question = apiData.questions.find(qq => qq.id.toString() === q.id);
        if ((question?.mustTextareaYes && q.answer === "yes") || (question?.mustTextareaNo && q.answer === "no")) {
          if (!q.textarea.trim()) {
            newErrors[`textarea_${q.id}`] = t("validation.enter_details");
            isValid = false;
          }
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 5) return handleSubmit();
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setIsLoading(true);
    try {
      const payload = {
        type_of_guarantee: userData.step1.type_of_guarantee,
        type_other_desc: userData.step1.type_other_desc,
        start_date: userData.step1.start_date,
        end_date: userData.step1.end_date,
        holder_type: userData.step2.holder_type,
        holder_first_name: userData.step2.holder_first_name,
        holder_last_name: userData.step2.holder_last_name,
        holder_identification: userData.step2.holder_identification,
        holder_contact_person: userData.step2.holder_contact_person,
        holder_website: userData.step3.holder_website,
        holder_email: userData.step3.holder_email,
        holder_mobile_number_ext: userData.step3.holder_mobile_number_ext,
        holder_mobile_number: userData.step3.holder_mobile_number,
        holder_phone_number_ext: userData.step3.holder_phone_number_ext,
        holder_phone_number: userData.step3.holder_phone_number,
        holder_address: userData.step3.holder_address,
        holder_tin: userData.step3.holder_tin,
        holder_tax_office: userData.step3.holder_tax_office,
        beneficiary_name: userData.step4.beneficiary_name,
        beneficiary_email: userData.step4.beneficiary_email,
        beneficiary_mobile_number_ext: userData.step4.beneficiary_mobile_number_ext,
        beneficiary_mobile_number: userData.step4.beneficiary_mobile_number,
        beneficiary_phone_number_ext: userData.step4.beneficiary_phone_number_ext,
        beneficiary_phone_number: userData.step4.beneficiary_phone_number,
        beneficiary_address: userData.step4.beneficiary_address,
        beneficiary_tin: userData.step4.beneficiary_tin,
        beneficiary_contact_person: userData.step4.beneficiary_contact_person,
        guarantee_number: userData.step5.guarantee_number,
        guarantee_title: userData.step5.guarantee_title,
        guarantee_value: parseFloat(userData.step5.guarantee_value) || 0,
        guarantee_amount: parseFloat(userData.step5.guarantee_amount) || 0,
        questions: userData.step6.questions,
      };

      localStorage.setItem("guaranteeData", JSON.stringify(payload));
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate("/get-a-quote-guarantee/proceed");
    } catch {
      setError(t("common.error.try_again") || "Submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (isLoading && currentStep === 0) {
    return (
      <>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (error && currentStep === 0) {
    return (
      <main>
        <QuoteHeader />
        <div className="flex flex-col justify-center items-center min-h-screen text-red-600 gap-4">
          <div className="text-xl font-semibold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            {t("common.button.retry") || "Retry"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <QuoteHeader />
      <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center my-10">
          <div className="flex items-center gap-3 relative w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-12 vsm:w-16 sm:w-24 md:w-[130px] lg:w-[150px] xl:w-[200px] h-[15px] rounded-[5px]
                  ${i < currentStep ? "bg-orange-400" : "bg-gray-300"}
                  ${i === currentStep ? "ml-[50px] md:ml-16" : ""}`}
              />
            ))}
            <span
              className="absolute transition-all duration-300"
              style={{ left: `calc(${currentStep * 19.5}%)` }}
            >
              <Icons.QuotePersonIcon />
            </span>
          </div>
        </div>

        <div className="my-5 flex flex-wrap justify-center items-center gap-5 w-full max-w-2xl">
          {/* Step 1 */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteCommentIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step1.title1")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-[450px]">
                <TravelSelect
                  placeholder={t("guarantee_quote_page.steps.step1.select_placeholder")}
                  value={userData.step1.type_of_guarantee}
                  onChange={(e) => handleInputChange("step1", "type_of_guarantee", e.target.value)}
                  options={apiData.type_of_guarantees.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  error={errors.type_of_guarantee}
                />
              </div>
              {userData.step1.type_of_guarantee === "other" && (
                <div className="w-full max-w-80 vsm:max-w-[450px]">
                  <TravelInput
                    type="text"
                    placeholder={t("guarantee_quote_page.steps.step1.other_placeholder")}
                    value={userData.step1.type_other_desc}
                    onChange={(e) => handleInputChange("step1", "type_other_desc", e.target.value)}
                    error={errors.type_other_desc}
                  />
                </div>
              )}
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step1.title2")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-[450px]">
                <TravelInput
                  type="date"
                  placeholder={t("guarantee_quote_page.steps.step1.start_date")}
                  value={userData.step1.start_date}
                  onChange={(e) => handleInputChange("step1", "start_date", e.target.value)}
                  min={today}
                  error={errors.start_date}
                />
              </div>
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step1.title3")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-[450px]">
                <TravelInput
                  type="date"
                  placeholder={t("guarantee_quote_page.steps.step1.end_date")}
                  value={userData.step1.end_date}
                  onChange={(e) => handleInputChange("step1", "end_date", e.target.value)}
                  min={userData.step1.start_date}
                  error={errors.end_date}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteProfileIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step2.title1")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-[450px]">
                <TravelSelect
                  placeholder={t("guarantee_quote_page.steps.step2.holder_type_placeholder")}
                  value={userData.step2.holder_type}
                  onChange={(e) => handleInputChange("step2", "holder_type", e.target.value)}
                  options={apiData.holder_types.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  error={errors.holder_type}
                />
              </div>
              <div className="flex gap-3 w-full">
                <div className="flex-1">
                  <TravelInput
                    type="text"
                    placeholder={t("guarantee_quote_page.steps.step2.first_name")}
                    value={userData.step2.holder_first_name}
                    onChange={(e) => handleInputChange("step2", "holder_first_name", e.target.value)}
                    error={errors.holder_first_name}
                  />
                </div>
                <div className="flex-1">
                  <TravelInput
                    type="text"
                    placeholder={t("guarantee_quote_page.steps.step2.last_name")}
                    value={userData.step2.holder_last_name}
                    onChange={(e) => handleInputChange("step2", "holder_last_name", e.target.value)}
                    error={errors.holder_last_name}
                  />
                </div>
              </div>
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step2.identification")}
                value={userData.step2.holder_identification}
                onChange={(e) => handleInputChange("step2", "holder_identification", e.target.value)}
              />
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step2.contact_person")}
                value={userData.step2.holder_contact_person}
                onChange={(e) => handleInputChange("step2", "holder_contact_person", e.target.value)}
              />
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 2 && (
            <div className="w-full max-w-lg space-y-4">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-6">
                {t("guarantee_quote_page.steps.step3.title")}
              </h1>
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step3.placeholders.website")}
                value={userData.step3.holder_website}
                onChange={(e) => handleInputChange("step3", "holder_website", e.target.value)}
                error={errors.holder_website}
              />
              <TravelInput
                type="email"
                placeholder={t("guarantee_quote_page.steps.step3.placeholders.email")}
                value={userData.step3.holder_email}
                onChange={(e) => handleInputChange("step3", "holder_email", e.target.value)}
                error={errors.holder_email}
              />
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step3.holder_mobile_number_ext}
                  onChange={(e) => handleInputChange("step3", "holder_mobile_number_ext", e.target.value)}
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Mobile"
                  value={userData.step3.holder_mobile_number}
                  onChange={(e) => handleInputChange("step3", "holder_mobile_number", e.target.value)}
                  error={errors.holder_mobile_number}
                />
              </div>
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step3.holder_phone_number_ext}
                  onChange={(e) => handleInputChange("step3", "holder_phone_number_ext", e.target.value)}
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Phone"
                  value={userData.step3.holder_phone_number}
                  onChange={(e) => handleInputChange("step3", "holder_phone_number", e.target.value)}
                  error={errors.holder_phone_number}
                />
              </div>
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step3.placeholders.address")}
                value={userData.step3.holder_address}
                onChange={(e) => handleInputChange("step3", "holder_address", e.target.value)}
                error={errors.holder_address}
              />
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step3.placeholders.tax_id")}
                value={userData.step3.holder_tin}
                onChange={(e) => handleInputChange("step3", "holder_tin", e.target.value)}
                error={errors.holder_tin}
              />
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step3.placeholders.tax_office")}
                value={userData.step3.holder_tax_office}
                onChange={(e) => handleInputChange("step3", "holder_tax_office", e.target.value)}
                error={errors.holder_tax_office}
              />
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 3 && (
            <div className="w-full max-w-lg space-y-4">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-6">
                {t("guarantee_quote_page.steps.step4.title")}
              </h1>
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step4.placeholders.name")}
                value={userData.step4.beneficiary_name}
                onChange={(e) => handleInputChange("step4", "beneficiary_name", e.target.value)}
                error={errors.beneficiary_name}
              />
              <TravelInput
                type="email"
                placeholder={t("guarantee_quote_page.steps.step4.placeholders.email")}
                value={userData.step4.beneficiary_email}
                onChange={(e) => handleInputChange("step4", "beneficiary_email", e.target.value)}
                error={errors.beneficiary_email}
              />
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step4.beneficiary_mobile_number_ext}
                  onChange={(e) => handleInputChange("step4", "beneficiary_mobile_number_ext", e.target.value)}
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Mobile"
                  value={userData.step4.beneficiary_mobile_number}
                  onChange={(e) => handleInputChange("step4", "beneficiary_mobile_number", e.target.value)}
                  error={errors.beneficiary_mobile_number}
                />
              </div>
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step4.beneficiary_phone_number_ext}
                  onChange={(e) => handleInputChange("step4", "beneficiary_phone_number_ext", e.target.value)}
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Phone"
                  value={userData.step4.beneficiary_phone_number}
                  onChange={(e) => handleInputChange("step4", "beneficiary_phone_number", e.target.value)}
                  error={errors.beneficiary_phone_number}
                />
              </div>
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step4.placeholders.address")}
                value={userData.step4.beneficiary_address}
                onChange={(e) => handleInputChange("step4", "beneficiary_address", e.target.value)}
                error={errors.beneficiary_address}
              />
              <TravelInput
                type="text"
                placeholder={t("guarantee_quote_page.steps.step4.placeholders.tax_id")}
                value={userData.step4.beneficiary_tin}
                onChange={(e) => handleInputChange("step4", "beneficiary_tin", e.target.value)}
                error={errors.beneficiary_tin}
              />
              <TravelInput
                type="text"
                placeholder="Contact Name"
                value={userData.step4.beneficiary_contact_person}
                onChange={(e) => handleInputChange("step4", "beneficiary_contact_person", e.target.value)}
              />
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 4 && (
            <div className="w-full max-w-lg space-y-4">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-6">
                {t("guarantee_quote_page.steps.step5.title")}
              </h1>
              <TravelInput
                type="text"
                placeholder="Guarantee Number"
                value={userData.step5.guarantee_number}
                onChange={(e) => handleInputChange("step5", "guarantee_number", e.target.value)}
                error={errors.guarantee_number}
              />
              <TravelInput
                type="text"
                placeholder="Guarantee Title"
                value={userData.step5.guarantee_title}
                onChange={(e) => handleInputChange("step5", "guarantee_title", e.target.value)}
                error={errors.guarantee_title}
              />
              <TravelInput
                type="number"
                placeholder="Guarantee Value"
                value={userData.step5.guarantee_value}
                onChange={(e) => handleInputChange("step5", "guarantee_value", e.target.value)}
                error={errors.guarantee_value}
              />
              <TravelInput
                type="number"
                placeholder="Guarantee Amount"
                value={userData.step5.guarantee_amount}
                onChange={(e) => handleInputChange("step5", "guarantee_amount", e.target.value)}
                error={errors.guarantee_amount}
              />
            </div>
          )}

          {/* Step 6 */}
          {currentStep === 5 && (
            <div className="w-full max-w-lg space-y-6">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_finish.header")}
              </h1>
              {apiData.questions.map((q, i) => {
                const qData = userData.step6.questions.find(
                  (x) => x.id === q.id.toString()
                );
                return (
                  <div key={q.id} className="space-y-3">
                    <ol start={i + 1}>
                      <li
                        className="text-sm list-decimal max-w-md mx-auto"
                        dangerouslySetInnerHTML={{ __html: q.question }}
                      />
                    </ol>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuestionChange(q.id.toString(), "yes")
                        }
                        className={`px-6 py-1 rounded-full border ${
                          qData?.answer === "yes"
                            ? "bg-secondaryColor text-white"
                            : "bg-white"
                        }`}
                      >
                        {t("guarantee_finish.yes")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuestionChange(q.id.toString(), "no")
                        }
                        className={`px-6 py-1 rounded-full border ${
                          qData?.answer === "no"
                            ? "bg-secondaryColor text-white"
                            : "bg-white"
                        }`}
                      >
                        {t("guarantee_finish.no")}
                      </button>
                    </div>
                    {(q.mustTextareaYes && qData?.answer === "yes") ||
                    (q.mustTextareaNo && qData?.answer === "no") ? (
                      <div className="w-full max-w-md mx-auto">
                        <textarea
                          placeholder={t("guarantee_finish.details_placeholder")}
                          value={qData?.textarea || ""}
                          onChange={(e) =>
                            handleQuestionChange(
                              q.id.toString(),
                              qData?.answer,
                              e.target.value
                            )
                          }
                          className={`w-full p-3 border rounded-lg resize-none h-20 focus:outline-none
                            ${errors[`textarea_${q.id}`] ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}`}
                        />
                        {errors[`textarea_${q.id}`] && (
                          <p className="text-red-600 text-sm mt-1 text-center">
                            {errors[`textarea_${q.id}`]}
                          </p>
                        )}
                      </div>
                    ) : null}
                    {errors[`question_${q.id}`] && (
                      <p className="text-red-600 text-sm text-center">
                        {errors[`question_${q.id}`]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 my-8">
          <ActionButton
            text={t("guarantee_quote_page.buttons.previous")}
            iconPosition="left"
            onClick={handlePrevious}
            isDisabled={currentStep === 0}
          />
          <ActionButton
            text={
              currentStep < 5
                ? t("guarantee_quote_page.buttons.next")
                : isLoading
                ? <LoadingSpinner />
                : t("guarantee_quote_page.buttons.submit")
            }
            iconPosition="right"
            onClick={handleNext}
            isNext
            isDisabled={isLoading}
          />
        </div>

        {error && currentStep !== 0 && (
          <div className="text-red-600 text-center mt-4 font-medium">
            {error}
          </div>
        )}
      </section>
    </main>
  );
};

/* -------------------------------------------------------------------------- */
/*                               INPUT COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const TravelInput = ({
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  error,
  min,
}) => {
  const isDate = type === "date";
  const valueClass = (value || isDate) ? "text-black border-black" : "text-[#C3C3C3]";

  return (
    <div className="flex flex-col items-center w-full">
      <input
        type={type}
        placeholder={isDate ? "" : placeholder}
        value={value || ""}
        onChange={onChange}
        min={min}
        className={`w-full max-w-80 vsm:max-w-[450px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
          ${error ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
          ${valueClass} ${className}`}
      />
      {error && <p className="text-red-600 text-sm mt-1 text-center">{error}</p>}
    </div>
  );
};

const TravelSelect = ({ placeholder, value, onChange, options, error }) => (
  <div className="flex flex-col items-center w-full">
    <select
      value={value || ""}
      onChange={onChange}
      className={`w-full max-w-80 vsm:max-w-[450px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
        ${error ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
        ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm mt-1 text-center">{error}</p>}
  </div>
);

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

/* -------------------------------------------------------------------------- */
/*                                 PROPTYPES                                  */
/* -------------------------------------------------------------------------- */

TravelInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  min: PropTypes.string,
};

TravelSelect.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  error: PropTypes.string,
};

ActionButton.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isNext: PropTypes.bool,
};