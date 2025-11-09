import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QuoteHeader, LoadingSpinner } from "@/components";
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "intermediariesQuoteForm"; // مفتاح الحفظ

export const IntermediariesQuote = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiData, setApiData] = useState({
    questions: [],
    categories: [],
    types: [],
  });

  // 1. قراءة من localStorage أو تهيئة جديدة
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

  // 2. حفظ تلقائي في localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  // 3. جلب بيانات API
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/getArguments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": i18n.language,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setApiData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [i18n.language]);

  // 4. استقبال نوع الوسيط من الصفحة السابقة
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

  // 5. تهيئة الأسئلة في الخطوة 4
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
    setIsInvalid(false);

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

  const isStepValid = (step) => {
    const stepData = userData[`step${step + 1}`];

    // خطوة 1
    if (step === 0) {
      if (!stepData.agentTypeId || !stepData.dateBirthday || !stepData.startDate) return false;

      const birthDate = new Date(stepData.dateBirthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) return false;
    }

    // خطوة 2
    if (step === 1) {
      if (!stepData.firmEstablished || !stepData.typeId) return false;

      const firmDate = new Date(stepData.firmEstablished);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (firmDate > today) return false;
    }

    // خطوة 3
    if (step === 2) {
      if (!stepData.grossInsured || !stepData.grossInsuredCurrent) return false;
      if (isNaN(stepData.grossInsured) || isNaN(stepData.grossInsuredCurrent)) return false;
    }

    // خطوة 4
    if (step === 3) {
      if (!stepData.questions || stepData.questions.length === 0) return false;
      return stepData.questions.every((q) => {
        if (!q.answer) return false;
        const apiQ = apiData.questions.find((aq) => aq.id === q.id);
        if (!apiQ) return true;
        if (q.answer === "yes" && apiQ.mustTextareaYes && !q.textarea?.trim()) return false;
        if (q.answer === "no" && apiQ.mustTextareaNo && !q.textarea?.trim()) return false;
        return true;
      });
    }

    return true;
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setIsInvalid(false);
  };

  const handleSubmit = async () => {
    if (!isStepValid(currentStep)) {
      setIsInvalid(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const questionsData = userData.step4.questions.map((q) => ({
        id: q.id.toString(),
        answer: q.answer || "no",
        textarea: q.textarea || "",
      }));

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
        dates_of_birthday: [userData.step1.dateBirthday],
      };

      const response = await fetch(`${API_BASE_URL}/user/intermediaryInsurance/getQuotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get quotes");
      }

      const result = await response.json();

      localStorage.setItem(
        "intermediariesQuoteData",
        JSON.stringify({
          userData,
          apiData,
          quotes: result.quotes || [],
        })
      );

      localStorage.removeItem(LOCAL_STORAGE_KEY); // مسح بعد الإرسال
      navigate("/get-a-quote-intermediaries/proceed");
    } catch (err) {
      console.error("Error submitting quote:", err);
      setError(err.message || "Failed to get quotes. Please try again.");
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

  if (error && currentStep === 0) {
    return (
      <main>
        <QuoteHeader />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg font-semibold text-red-600">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <QuoteHeader />
      <section className="border-t-2 mx-5 md:mx-0 my-2 flex flex-col justify-center items-center">
        {/* شريط التقدم */}
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

        {/* النماذج */}
        <div className="my-10 flex flex-wrap justify-center items-center gap-5 w-full max-w-2xl">
          {/* خطوة 1 */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteProfileIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Agent Type</h1>
              <TravelSelect
                placeholder="Select Agent Type"
                value={userData.step1.agentType}
                onChange={(e) => handleInputChange("step1", "agentType", e.target.value)}
                isInvalid={isInvalid && !userData.step1.agentTypeId}
                options={apiData.categories.map((cat) => cat.name)}
              />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Date of Birth</h1>
              <TravelInput
                type="date"
                placeholder="Select Date of Birth"
                value={userData.step1.dateBirthday}
                onChange={(e) => handleInputChange("step1", "dateBirthday", e.target.value)}
                isInvalid={isInvalid && !userData.step1.dateBirthday}
                max={new Date().toISOString().split("T")[0]}
              />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Start Date</h1>
              <TravelInput
                type="date"
                placeholder="Select Start Date"
                value={userData.step1.startDate}
                onChange={(e) => handleInputChange("step1", "startDate", e.target.value)}
                isInvalid={isInvalid && !userData.step1.startDate}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          {/* خطوة 2 */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteCardIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Firm Established</h1>
              <TravelInput
                type="date"
                placeholder="Select Firm Established Date"
                value={userData.step2.firmEstablished}
                onChange={(e) => handleInputChange("step2", "firmEstablished", e.target.value)}
                isInvalid={isInvalid && !userData.step2.firmEstablished}
                max={new Date().toISOString().split("T")[0]}
              />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Type</h1>
              <TravelSelect
                placeholder="Select Type"
                value={userData.step2.type}
                onChange={(e) => handleInputChange("step2", "type", e.target.value)}
                isInvalid={isInvalid && !userData.step2.typeId}
                options={apiData.types.map((type) => type.name)}
              />
            </div>
          )}

          {/* خطوة 3 */}
          {currentStep === 2 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <Icons.QuoteBirthIcon />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Gross Insured</h1>
              <TravelInput
                type="number"
                placeholder="Enter Gross Insured Amount"
                value={userData.step3.grossInsured}
                onChange={(e) => handleInputChange("step3", "grossInsured", e.target.value)}
                isInvalid={isInvalid && !userData.step3.grossInsured}
              />
              <h1 className="text-2xl sm:text-4xl font-semibold text-center">Gross Insured Current</h1>
              <TravelInput
                type="number"
                placeholder="Enter Gross Insured Current Amount"
                value={userData.step3.grossInsuredCurrent}
                onChange={(e) => handleInputChange("step3", "grossInsuredCurrent", e.target.value)}
                isInvalid={isInvalid && !userData.step3.grossInsuredCurrent}
              />
            </div>
          )}

          {/* خطوة 4 */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
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
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuestionAnswerChange(apiQuestion.id, "no")}
                        className={`flex-1 h-12 border rounded-full font-medium transition-all
                          ${question.answer === "no" ? "bg-secondaryColor text-white border-secondaryColor" : "bg-white border-gray-300"}`}
                      >
                        No
                      </button>
                    </div>
                    {shouldShowTextarea(question) && (
                      <textarea
                        value={question.textarea || ""}
                        onChange={(e) => handleQuestionTextareaChange(apiQuestion.id, e.target.value)}
                        placeholder="Please provide additional details..."
                        className={`w-full h-28 p-4 border rounded-lg resize-none focus:outline-none transition-all
                          ${isInvalid && !question.textarea?.trim() ? "border-red-500 animate-pulse" : "border-gray-300"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* الأزرار */}
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
              text={isLoading ? "Loading..." : t("intermediaries_quote_page.buttons.submit")}
              iconPosition="right"
              onClick={handleSubmit}
              isNext
              isDisabled={isLoading || !isStepValid(currentStep)}
            />
          )}
        </div>

        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      </section>
    </main>
  );
};

// مكونات موحدة
const TravelInput = ({ placeholder, value, onChange, isInvalid, type = "text", max, className = "" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange}
    max={max}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"} ${className}`}
  />
);

const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
  <select
    value={value || ""}
    onChange={onChange}
    className={`w-full max-w-80 vsm:max-w-96 sm:w-[400px] h-[75px] px-4 border rounded-[10px] font-medium focus:outline-none
      ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
      ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
  >
    <option value="" disabled hidden>
      {placeholder}
    </option>
    {options.map((option, idx) => (
      <option key={idx} value={option}>
        {option}
      </option>
    ))}
  </select>
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
      <span className="flex justify-center items-center bg-secondaryColor w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform group-hover:rotate-45">
        <Icons.QuoteArrowIcon />
      </span>
    )}
  </button>
);

// PropTypes
TravelInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isInvalid: PropTypes.bool,
  type: PropTypes.string,
  max: PropTypes.string,
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