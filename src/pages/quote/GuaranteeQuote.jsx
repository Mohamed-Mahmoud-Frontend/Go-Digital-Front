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
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiData, setApiData] = useState({
    questions: [],
    holder_types: [],
    type_of_guarantees: [],
  });

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

  // حفظ تلقائي
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  // جلب API
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
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  // استقبال نوع الضمان
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

  // بيانات المستخدم
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

  const handleInputChange = (step, field, value) => {
    setIsInvalid(false);
    setUserData((prev) => ({
      ...prev,
      [step]: { ...prev[step], [field]: value },
    }));
  };

  const handleQuestionChange = (id, answer, textarea = "") => {
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

  const isStepValid = (step) => {
    const data = userData[`step${step + 1}`];
    const optional = [
      "type_other_desc",
      "holder_identification",
      "holder_contact_person",
      "beneficiary_contact_person",
    ];

    if (step === 5) return data.questions.every((q) => q.answer);

    return Object.entries(data).every(([k, v]) => {
      if (optional.includes(k)) return true;
      if (k === "type_other_desc" && data.type_of_guarantee === "other")
        return v.trim() !== "";
      return v && v.toString().trim() !== "";
    });
  };

  const handleNext = async () => {
    if (!isStepValid(currentStep)) return setIsInvalid(true);
    if (currentStep === 5) return handleSubmit();
    setCurrentStep((prev) => prev + 1);
    setIsInvalid(false);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setIsInvalid(false);
  };

  const handleSubmit = async () => {
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
        beneficiary_mobile_number_ext:
          userData.step4.beneficiary_mobile_number_ext,
        beneficiary_mobile_number: userData.step4.beneficiary_mobile_number,
        beneficiary_phone_number_ext:
          userData.step4.beneficiary_phone_number_ext,
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
setError("Submission failed");    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="flex justify-center items-center min-h-screen text-red-600">
          {error}
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
          {/* === خطوة 1 === */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteCommentIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step1.title1")}
              </h1>
              <TravelSelect
                placeholder={t(
                  "guarantee_quote_page.steps.step1.select_placeholder"
                )}
                value={userData.step1.type_of_guarantee}
                onChange={(e) =>
                  handleInputChange(
                    "step1",
                    "type_of_guarantee",
                    e.target.value
                  )
                }
                isInvalid={isInvalid && !userData.step1.type_of_guarantee}
                options={apiData.type_of_guarantees.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
              />
              {userData.step1.type_of_guarantee === "other" && (
                <TravelInput
                  type="text"
                  placeholder={t(
                    "Select Guarantee Type"
                  )}
                  value={userData.step1.type_other_desc}
                  onChange={(e) =>
                    handleInputChange(
                      "step1",
                      "type_other_desc",
                      e.target.value
                    )
                  }
                  isInvalid={isInvalid && !userData.step1.type_other_desc}
                />
              )}
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step1.title2")}
              </h1>
              <TravelInput
                type="date"
                placeholder={t("guarantee_quote_page.steps.step1.start_date")}
                value={userData.step1.start_date}
                onChange={(e) =>
                  handleInputChange("step1", "start_date", e.target.value)
                }
                isInvalid={isInvalid && !userData.step1.start_date}
                min={new Date().toISOString().split("T")[0]}
              />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step1.title3")}
              </h1>
              <TravelInput
                type="date"
                placeholder={t("guarantee_quote_page.steps.step1.end_date")}
                value={userData.step1.end_date}
                onChange={(e) =>
                  handleInputChange("step1", "end_date", e.target.value)
                }
                isInvalid={isInvalid && !userData.step1.end_date}
                min={userData.step1.start_date}
              />
            </div>
          )}

          {/* === خطوة 2 === */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteProfileIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("guarantee_quote_page.steps.step2.title1")}
              </h1>
              <TravelSelect
                placeholder={t(
                  "guarantee_quote_page.steps.step2.holder_type_placeholder"
                )}
                value={userData.step2.holder_type}
                onChange={(e) =>
                  handleInputChange("step2", "holder_type", e.target.value)
                }
                isInvalid={isInvalid && !userData.step2.holder_type}
                options={apiData.holder_types.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
              />
              <div className="flex gap-3 w-full">
                <TravelInput
                  type="text"
                  placeholder={t("guarantee_quote_page.steps.step2.first_name")}
                  value={userData.step2.holder_first_name}
                  onChange={(e) =>
                    handleInputChange(
                      "step2",
                      "holder_first_name",
                      e.target.value
                    )
                  }
                  isInvalid={isInvalid && !userData.step2.holder_first_name}
                />
                <TravelInput
                  type="text"
                  placeholder={t("guarantee_quote_page.steps.step2.last_name")}
                  value={userData.step2.holder_last_name}
                  onChange={(e) =>
                    handleInputChange(
                      "step2",
                      "holder_last_name",
                      e.target.value
                    )
                  }
                  isInvalid={isInvalid && !userData.step2.holder_last_name}
                />
              </div>
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step2.identification"
                )}
                value={userData.step2.holder_identification}
                onChange={(e) =>
                  handleInputChange(
                    "step2",
                    "holder_identification",
                    e.target.value
                  )
                }
              />
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step2.contact_person"
                )}
                value={userData.step2.holder_contact_person}
                onChange={(e) =>
                  handleInputChange(
                    "step2",
                    "holder_contact_person",
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* === خطوة 3 === */}
          {currentStep === 2 && (
            <div className="w-full max-w-lg space-y-4">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-6">
                {t("guarantee_quote_page.steps.step3.title")}
              </h1>
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step3.placeholders.website"
                )}
                value={userData.step3.holder_website}
                onChange={(e) =>
                  handleInputChange("step3", "holder_website", e.target.value)
                }
                isInvalid={isInvalid && !userData.step3.holder_website}
              />
              <TravelInput
                type="email"
                placeholder={t(
                  "guarantee_quote_page.steps.step3.placeholders.email"
                )}
                value={userData.step3.holder_email}
                onChange={(e) =>
                  handleInputChange("step3", "holder_email", e.target.value)
                }
                isInvalid={isInvalid && !userData.step3.holder_email}
              />
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step3.holder_mobile_number_ext}
                  onChange={(e) =>
                    handleInputChange(
                      "step3",
                      "holder_mobile_number_ext",
                      e.target.value
                    )
                  }
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Mobile"
                  value={userData.step3.holder_mobile_number}
                  onChange={(e) =>
                    handleInputChange(
                      "step3",
                      "holder_mobile_number",
                      e.target.value
                    )
                  }
                  isInvalid={isInvalid && !userData.step3.holder_mobile_number}
                />
              </div>
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step3.holder_phone_number_ext}
                  onChange={(e) =>
                    handleInputChange(
                      "step3",
                      "holder_phone_number_ext",
                      e.target.value
                    )
                  }
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Phone"
                  value={userData.step3.holder_phone_number}
                  onChange={(e) =>
                    handleInputChange(
                      "step3",
                      "holder_phone_number",
                      e.target.value
                    )
                  }
                  isInvalid={isInvalid && !userData.step3.holder_phone_number}
                />
              </div>
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step3.placeholders.address"
                )}
                value={userData.step3.holder_address}
                onChange={(e) =>
                  handleInputChange("step3", "holder_address", e.target.value)
                }
                isInvalid={isInvalid && !userData.step3.holder_address}
              />
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step3.placeholders.tax_id"
                )}
                value={userData.step3.holder_tin}
                onChange={(e) =>
                  handleInputChange("step3", "holder_tin", e.target.value)
                }
                isInvalid={isInvalid && !userData.step3.holder_tin}
              />
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step3.placeholders.tax_office"
                )}
                value={userData.step3.holder_tax_office}
                onChange={(e) =>
                  handleInputChange(
                    "step3",
                    "holder_tax_office",
                    e.target.value
                  )
                }
                isInvalid={isInvalid && !userData.step3.holder_tax_office}
              />
            </div>
          )}

          {/* === خطوة 4 === */}
          {currentStep === 3 && (
            <div className="w-full max-w-lg space-y-4">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-6">
                {t("guarantee_quote_page.steps.step4.title")}
              </h1>
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step4.placeholders.name"
                )}
                value={userData.step4.beneficiary_name}
                onChange={(e) =>
                  handleInputChange("step4", "beneficiary_name", e.target.value)
                }
                isInvalid={isInvalid && !userData.step4.beneficiary_name}
              />
              <TravelInput
                type="email"
                placeholder={t(
                  "guarantee_quote_page.steps.step4.placeholders.email"
                )}
                value={userData.step4.beneficiary_email}
                onChange={(e) =>
                  handleInputChange(
                    "step4",
                    "beneficiary_email",
                    e.target.value
                  )
                }
                isInvalid={isInvalid && !userData.step4.beneficiary_email}
              />
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step4.beneficiary_mobile_number_ext}
                  onChange={(e) =>
                    handleInputChange(
                      "step4",
                      "beneficiary_mobile_number_ext",
                      e.target.value
                    )
                  }
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Mobile"
                  value={userData.step4.beneficiary_mobile_number}
                  onChange={(e) =>
                    handleInputChange(
                      "step4",
                      "beneficiary_mobile_number",
                      e.target.value
                    )
                  }
                  isInvalid={
                    isInvalid && !userData.step4.beneficiary_mobile_number
                  }
                />
              </div>
              <div className="flex gap-2">
                <TravelInput
                  type="text"
                  placeholder="+30"
                  value={userData.step4.beneficiary_phone_number_ext}
                  onChange={(e) =>
                    handleInputChange(
                      "step4",
                      "beneficiary_phone_number_ext",
                      e.target.value
                    )
                  }
                  className="max-w-24"
                />
                <TravelInput
                  type="tel"
                  placeholder="Phone"
                  value={userData.step4.beneficiary_phone_number}
                  onChange={(e) =>
                    handleInputChange(
                      "step4",
                      "beneficiary_phone_number",
                      e.target.value
                    )
                  }
                  isInvalid={
                    isInvalid && !userData.step4.beneficiary_phone_number
                  }
                />
              </div>
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step4.placeholders.address"
                )}
                value={userData.step4.beneficiary_address}
                onChange={(e) =>
                  handleInputChange(
                    "step4",
                    "beneficiary_address",
                    e.target.value
                  )
                }
                isInvalid={isInvalid && !userData.step4.beneficiary_address}
              />
              <TravelInput
                type="text"
                placeholder={t(
                  "guarantee_quote_page.steps.step4.placeholders.tax_id"
                )}
                value={userData.step4.beneficiary_tin}
                onChange={(e) =>
                  handleInputChange("step4", "beneficiary_tin", e.target.value)
                }
                isInvalid={isInvalid && !userData.step4.beneficiary_tin}
              />
              <TravelInput
                type="text"
                placeholder="Contact Name"
                value={userData.step4.beneficiary_contact_person}
                onChange={(e) =>
                  handleInputChange(
                    "step4",
                    "beneficiary_contact_person",
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* === خطوة 5 === */}
          {currentStep === 4 && (
            <div className="w-full max-w-lg space-y-4">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-6">
                {t("guarantee_quote_page.steps.step5.title")}
              </h1>
              <TravelInput
                type="text"
                placeholder="Guarantee Number"
                value={userData.step5.guarantee_number}
                onChange={(e) =>
                  handleInputChange("step5", "guarantee_number", e.target.value)
                }
                isInvalid={isInvalid && !userData.step5.guarantee_number}
              />
              <TravelInput
                type="text"
                placeholder="Guarantee Title"
                value={userData.step5.guarantee_title}
                onChange={(e) =>
                  handleInputChange("step5", "guarantee_title", e.target.value)
                }
                isInvalid={isInvalid && !userData.step5.guarantee_title}
              />
              <TravelInput
                type="number"
                placeholder="Guarantee Value"
                value={userData.step5.guarantee_value}
                onChange={(e) =>
                  handleInputChange("step5", "guarantee_value", e.target.value)
                }
                isInvalid={isInvalid && !userData.step5.guarantee_value}
              />
              <TravelInput
                type="number"
                placeholder="Guarantee Amount"
                value={userData.step5.guarantee_amount}
                onChange={(e) =>
                  handleInputChange("step5", "guarantee_amount", e.target.value)
                }
                isInvalid={isInvalid && !userData.step5.guarantee_amount}
              />
            </div>
          )}

          {/* === خطوة 6 === */}
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
                      <textarea
                        placeholder="اكتب التفاصيل..."
                        value={qData?.textarea || ""}
                        onChange={(e) =>
                          handleQuestionChange(
                            q.id.toString(),
                            qData?.answer,
                            e.target.value
                          )
                        }
                        className="w-full max-w-md mx-auto p-3 border rounded-lg resize-none h-20"
                      />
                    ) : null}
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
                : t("guarantee_quote_page.buttons.submit")
            }
            iconPosition="right"
            onClick={handleNext}
            isNext
          />
        </div>
      </section>
    </main>
  );
};

// مكونات
const TravelInput = ({
  placeholder,
  value,
  onChange,
  isInvalid,
  type = "text",
  className = "",
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-[450px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      ${
        isInvalid
          ? "border-secondaryColor border-2 animate-pulse"
          : "border-[#C3C3C3]"
      }
      ${value ? "text-black border-black" : "text-[#C3C3C3]"} ${className}`}
  />
);

const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
  <select
    value={value || ""}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-[450px] h-[75px] px- наша4 border rounded-[10px] font-medium focus:outline-none
      ${
        isInvalid
          ? "border-secondaryColor border-2 animate-pulse"
          : "border-[#C3C3C3]"
      }
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
);

const ActionButton = ({ text, iconPosition, onClick, isDisabled, isNext }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`group flex items-center justify-between px-5 sm:px-3 
      ${
        isNext ? "sm:pl-16" : "sm:pr-14"
      } w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
      border rounded-[27.5px] shadow-md transition-all
      ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-black"}`}
  >
    {iconPosition === "left" && (
      <span
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform -rotate-90 group-hover:-rotate-[135deg]
        ${isDisabled ? "bg-gray-300" : "bg-black"}`}
      >
        <Icons.QuoteArrowIcon />
      </span>
    )}
    {text}
    {iconPosition === "right" && (
      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondaryColor flex items-center justify-center transition-transform group-hover:rotate compound-45">
        <Icons.QuoteArrowIcon />
      </span>
    )}
  </button>
);

TravelInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
};
TravelSelect.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  isInvalid: PropTypes.bool,
};
ActionButton.propTypes = {
  text: PropTypes.string.isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]).isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isNext: PropTypes.bool,
};
