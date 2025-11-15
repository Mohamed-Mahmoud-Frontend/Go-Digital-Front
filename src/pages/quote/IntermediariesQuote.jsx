import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "intermediariesQuoteForm";

export const IntermediariesQuote = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiData, setApiData] = useState({
    questions: [],
    categories: [],
    types: [],
  });
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          step1: { agentType: "", agentTypeId: "", dateBirthday: "", startDate: "" },
          step2: { firmEstablished: "", type: "", typeId: "" },
          step3: { grossInsured: "", grossInsuredCurrent: "" },
          step4: { questions: [] },
        };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/getArguments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": i18n.language,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setApiData({
          questions: data.questions || [],
          categories: (data.categories || []).map(c => ({ id: c.id, name: c.name })),
          types: (data.types || []).map(t => ({ id: t.id, name: t.name })),
        });
      } catch (err) {
        toast.error(t("errors.load_failed") || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [i18n.language, t]);

  useEffect(() => {
    const prefilledName = localStorage.getItem("intermediaries_type_prefill");
    if (prefilledName && apiData.types.length > 0) {
      const selectedType = apiData.types.find((t) => t.name === prefilledName);
      if (selectedType) {
        setUserData((prev) => ({
          ...prev,
          step2: {
            ...prev.step2,
            type: selectedType.name,
            typeId: selectedType.id.toString(),
          },
        }));
        setCurrentStep(1);
        localStorage.removeItem("intermediaries_type_prefill");
      }
    }
  }, [apiData.types]);

  useEffect(() => {
    if (currentStep === 3 && apiData.questions.length > 0 && userData.step4.questions.length === 0) {
      const initialQuestions = apiData.questions.map((q) => ({
        id: q.id,
        answer: "",
        textarea: "",
      }));
      setUserData((prev) => ({
        ...prev,
        step4: { questions: initialQuestions },
      }));
    }
  }, [currentStep, apiData.questions, userData.step4.questions.length]);

  const handleInputChange = (step, field, value) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    if (step === "step1" && field === "agentType") {
      const selectedCategory = apiData.categories.find((cat) => cat.name === value);
      setUserData((prev) => ({
        ...prev,
        step1: {
          ...prev.step1,
          agentType: value,
          agentTypeId: selectedCategory ? selectedCategory.id.toString() : "",
        },
      }));
    } else if (step === "step2" && field === "type") {
      const selectedType = apiData.types.find((type) => type.name === value);
      setUserData((prev) => ({
        ...prev,
        step2: {
          ...prev.step2,
          type: value,
          typeId: selectedType ? selectedType.id.toString() : "",
        },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [step]: { ...prev[step], [field]: value },
      }));
    }
  };

  const handleQuestionAnswerChange = (questionId, answer) => {
    setErrors((prev) => ({ ...prev, [`q_${questionId}`]: "", [`q_${questionId}_text`]: "" }));
    setUserData((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        questions: prev.step4.questions.map((q) =>
          q.id === questionId ? { ...q, answer, textarea: q.textarea || "" } : q
        ),
      },
    }));
  };

  const handleQuestionTextareaChange = (questionId, value) => {
    setErrors((prev) => ({ ...prev, [`q_${questionId}_text`]: "" }));
    setUserData((prev) => ({
      ...prev,
      step4: {
        ...prev.step4,
        questions: prev.step4.questions.map((q) =>
          q.id === questionId ? { ...q, textarea: value } : q
        ),
      },
    }));
  };

  const validateField = (step, field, value) => {
    if (step === 0) {
      if (field === "agentType" && !value) return t("validation.select_agent_type");
      if (field === "dateBirthday") {
        if (!value) return t("validation.enter_date_of_birth");
        const date = new Date(value);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(date.getTime())) return t("validation.invalid_date");
        if (date > today) return t("validation.birth_date_future");
        if (date.getFullYear() < 1900) return t("validation.birth_date_too_old");
      }
      if (field === "startDate") {
        if (!value) return t("validation.enter_start_date");
        const date = new Date(value);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(date.getTime())) return t("validation.invalid_date");
        if (date < today) return t("validation.start_date_past");
      }
    }

    if (step === 1) {
      if (field === "firmEstablished") {
        if (!value) return t("validation.enter_firm_established");
        const date = new Date(value);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(date.getTime())) return t("validation.invalid_date");
        if (date > today) return t("validation.firm_date_future");
      }
      if (field === "type" && !value) return t("validation.select_type");
    }

    if (step === 2) {
      if (field === "grossInsured") {
        if (!value) return t("validation.enter_gross_insured");
        if (isNaN(value) || parseFloat(value) < 0) return t("validation.gross_insured_invalid");
      }
      if (field === "grossInsuredCurrent") {
        if (!value) return t("validation.enter_gross_insured_current");
        if (isNaN(value) || parseFloat(value) < 0) return t("validation.gross_insured_current_invalid");
      }
    }

    return "";
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 0) {
      const s = userData.step1;
      const agentTypeError = validateField(0, "agentType", s.agentType);
      const dobError = validateField(0, "dateBirthday", s.dateBirthday);
      const startError = validateField(0, "startDate", s.startDate);

      if (agentTypeError) { newErrors.agentType = agentTypeError; isValid = false; }
      if (dobError) { newErrors.dateBirthday = dobError; isValid = false; }
      if (startError) { newErrors.startDate = startError; isValid = false; }
    }

    if (step === 1) {
      const s = userData.step2;
      const firmError = validateField(1, "firmEstablished", s.firmEstablished);
      const typeError = validateField(1, "type", s.type);

      if (firmError) { newErrors.firmEstablished = firmError; isValid = false; }
      if (typeError) { newErrors.type = typeError; isValid = false; }
    }

    if (step === 2) {
      const s = userData.step3;
      const grossError = validateField(2, "grossInsured", s.grossInsured);
      const currentError = validateField(2, "grossInsuredCurrent", s.grossInsuredCurrent);

      if (grossError) { newErrors.grossInsured = grossError; isValid = false; }
      if (currentError) { newErrors.grossInsuredCurrent = currentError; isValid = false; }
    }

    if (step === 3) {
      userData.step4.questions.forEach((q) => {
        const apiQ = apiData.questions.find((aq) => aq.id === q.id);
        if (!q.answer) {
          newErrors[`q_${q.id}`] = t("validation.answer_question");
          isValid = false;
        } else {
          const needsDetails =
            (q.answer === "yes" && apiQ?.mustTextareaYes) ||
            (q.answer === "no" && apiQ?.mustTextareaNo);
          if (needsDetails && !q.textarea?.trim()) {
            newErrors[`q_${q.id}_text`] = t("validation.provide_details");
            isValid = false;
          }
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const questionsData = userData.step4.questions.map((q) => ({
        id: q.id.toString(),
        answer: q.answer || "no",
        textarea: q.textarea || "",
      }));

      const formattedBirthday = formatDate(userData.step1.dateBirthday);
      if (!formattedBirthday) {
        toast.error(t("validation.invalid_birth_date"));
        setIsLoading(false);
        return;
      }

      const submissionData = {
        firm_established: userData.step2.firmEstablished,
        agent_type: userData.step1.agentTypeId,
        type: userData.step2.typeId,
        agent_count: 1,
        gross_insured: parseInt(userData.step3.grossInsured) || 50000,
        gross_insured_current: parseInt(userData.step3.grossInsuredCurrent) || 50000,
        insured_type: "individual",
        start_date: userData.step1.startDate,
        questions: questionsData,
        dates_of_birthday: [formattedBirthday],
      };

      const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/getQuotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        toast.error(errorData.error || t("errors.invalid_data"));
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to get quotes");

      const result = await response.json();

      localStorage.setItem(
        "intermediariesQuoteData",
        JSON.stringify({
          userData,
          apiData,
          quotes: result.quotes || [],
        })
      );

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate("/get-a-quote-intermediaries/proceed");
    } catch (err) {
      toast.error(err.message || t("errors.submit_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowTextarea = (question) => {
    const apiQuestion = apiData.questions.find((q) => q.id === question.id);
    if (!apiQuestion) return false;
    return (
      (question.answer === "yes" && apiQuestion.mustTextareaYes) ||
      (question.answer === "no" && apiQuestion.mustTextareaNo)
    );
  };

  const today = new Date().toISOString().split("T")[0];

  if (isLoading && currentStep === 0) {
    return (
      <main>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  return (
    <main>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#fef2f2",
            color: "#dc2626",
            fontWeight: "500",
            border: "1px solid #fecaca",
            borderRadius: "8px",
          },
        }}
      />
      <QuoteHeader />

      <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        {/* Progress Bar */}
        <div className="flex flex-col justify-center items-center my-10">
          <div className="flex items-center gap-3 relative w-full">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-14 vsm:w-20 sm:w-32 md:w-[170px] lg:w-[214px] h-[15px] rounded-[5px]
                  ${index < currentStep ? "bg-orange-400" : "bg-gray-300"}
                  ${index === currentStep ? "ml-[70px] md:ml-16" : ""}`}
              />
            ))}
            <span
              className="absolute transition-all duration-300"
              style={{ left: `calc(${currentStep * 24}%)` }}
            >
              <Icons.QuotePersonIcon />
            </span>
          </div>
        </div>

        {/* Forms */}
        <div className="my-10 flex flex-wrap justify-center items-center gap-5 w-full max-w-2xl">
          {/* Step 1 */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteProfileIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step1.title_agent_type")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelSelect
                  placeholder={t("intermediaries_quote_page.steps.step1.select_agent_type")}
                  value={userData.step1.agentType}
                  onChange={(e) => handleInputChange("step1", "agentType", e.target.value)}
                  options={apiData.categories.map((cat) => ({
                    value: cat.name,
                    label: cat.name,
                  }))}
                  error={errors.agentType}
                />
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step1.title_date_of_birth")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelInput
                  type="date"
                  placeholder=""
                  value={userData.step1.dateBirthday}
                  onChange={(e) => handleInputChange("step1", "dateBirthday", e.target.value)}
                  max={today}
                  error={errors.dateBirthday}
                />
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step1.title_start_date")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelInput
                  type="date"
                  placeholder=""
                  value={userData.step1.startDate}
                  onChange={(e) => handleInputChange("step1", "startDate", e.target.value)}
                  min={today}
                  error={errors.startDate}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteCardIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step2.title_firm_established")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelInput
                  type="date"
                  placeholder=""
                  value={userData.step2.firmEstablished}
                  onChange={(e) => handleInputChange("step2", "firmEstablished", e.target.value)}
                  max={today}
                  error={errors.firmEstablished}
                />
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step2.title_type")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelSelect
                  placeholder={t("intermediaries_quote_page.steps.step2.select_type")}
                  value={userData.step2.type}
                  onChange={(e) => handleInputChange("step2", "type", e.target.value)}
                  options={apiData.types.map((type) => ({
                    value: type.name,
                    label: type.name,
                  }))}
                  error={errors.type}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 2 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteBirthIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step3.title_gross_insured")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelInput
                  type="number"
                  placeholder={t("intermediaries_quote_page.steps.step3.placeholder_gross_insured")}
                  value={userData.step3.grossInsured}
                  onChange={(e) => handleInputChange("step3", "grossInsured", e.target.value)}
                  error={errors.grossInsured}
                />
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step3.title_gross_insured_current")}
              </h1>
              <div className="w-full max-w-80 vsm:max-w-96 sm:w-[400px]">
                <TravelInput
                  type="number"
                  placeholder={t("intermediaries_quote_page.steps.step3.placeholder_gross_insured_current")}
                  value={userData.step3.grossInsuredCurrent}
                  onChange={(e) => handleInputChange("step3", "grossInsuredCurrent", e.target.value)}
                  error={errors.grossInsuredCurrent}
                />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">
                {t("intermediaries_quote_page.steps.step4.title")}
              </h1>
              {apiData.questions.map((apiQuestion, index) => {
                const question = userData.step4.questions.find((q) => q.id === apiQuestion.id);
                if (!question) return null;

                return (
                  <div key={apiQuestion.id} className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">
                      {index + 1}. <span dangerouslySetInnerHTML={{ __html: apiQuestion.question }} />
                    </h3>
                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => handleQuestionAnswerChange(apiQuestion.id, "yes")}
                        className={`flex-1 h-12 border rounded-full font-medium transition-all
                          ${question.answer === "yes" ? "bg-secondaryColor text-white border-secondaryColor" : "bg-white border-gray-300"}`}
                      >
                        {t("common.yes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuestionAnswerChange(apiQuestion.id, "no")}
                        className={`flex-1 h-12 border rounded-full font-medium transition-all
                          ${question.answer === "no" ? "bg-secondaryColor text-white border-secondaryColor" : "bg-white border-gray-300"}`}
                      >
                        {t("common.no")}
                      </button>
                    </div>
                    {errors[`q_${question.id}`] && (
                      <p className="text-red-600 text-sm mb-2 text-center">{errors[`q_${question.id}`]}</p>
                    )}
                    {shouldShowTextarea(question) && (
                      <div className="mt-3">
                        <textarea
                          value={question.textarea || ""}
                          onChange={(e) => handleQuestionTextareaChange(apiQuestion.id, e.target.value)}
                          placeholder={t("intermediaries_quote_page.steps.step4.placeholder_details")}
                          className={`w-full h-28 p-4 border rounded-lg resize-none focus:outline-none
                            ${errors[`q_${question.id}_text`] ? "border-secondaryColor border-2 animate-pulse" : "border-gray-300"}`}
                        />
                        {errors[`q_${question.id}_text`] && (
                          <p className="text-red-600 text-sm mt-1 text-center">{errors[`q_${question.id}_text`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-6 my-8">
          <ActionButton
            text={t("intermediaries_quote_page.buttons.previous")}
            iconPosition="left"
            onClick={handlePrevious}
            isDisabled={currentStep === 0}
          />
          {currentStep < totalSteps - 1 ? (
            <ActionButton
              text={t("intermediaries_quote_page.buttons.next")}
              iconPosition="right"
              onClick={handleNext}
              isNext
            />
          ) : (
            <ActionButton
              text={isLoading ? <LoadingSpinner size="sm" /> : t("intermediaries_quote_page.buttons.submit")}
              iconPosition="right"
              onClick={handleSubmit}
              isNext
              isDisabled={isLoading}
            />
          )}
        </div>
      </section>
    </main>
  );
};

/* -------------------------------------------------------------------------- */
/*                               INPUT COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const TravelInput = ({ placeholder, value, onChange, type = "text", max, min, error }) => {
  const isDate = type === "date";
  const valueClass = (value || isDate) ? "text-black border-black" : "text-[#C3C3C3]";

  return (
    <div className="flex flex-col items-center w-full">
      <input
        type={type}
        placeholder={isDate ? "" : placeholder}
        value={value || ""}
        onChange={onChange}
        max={max}
        min={min}
        className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
          ${error ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
          ${valueClass}`}
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
      className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
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
      ${isNext ? "sm:pl-16" : "sm:pr-14"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
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
      <span className={`flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45
        ${isDisabled ? "bg-gray-300" : "bg-secondaryColor"}`}>
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
  max: PropTypes.string,
  min: PropTypes.string,
  error: PropTypes.string,
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