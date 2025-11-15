import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components";
import { CountryCodeSelect } from "../../CountryCodeSelect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const LiabilityForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [taxIdError, setTaxIdError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [formData, setFormData] = useState({
    idPassport: "",
    name: "",
    surname: "",
    email: "",
    primaryCountryCode: "+30",
    primaryPhoneNumber: "",
    address: "",
    taxId: "",
    taxOffice: "",
    medicalCondition: "",
    startDate: "",
    questionTextarea: "",
  });

  useEffect(() => {
    if (isOpen && step === 2) {
      fetchQuestions();
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (userDetails && isOpen) {
      setFormData((prevData) => ({
        ...prevData,
        name: userDetails.first_name || userDetails.name || "",
        surname: userDetails.last_name || userDetails.surname || "",
        email: userDetails.email || "",
        address: userDetails.address || "",
      }));
    }
  }, [userDetails, isOpen]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/transportOperators/getArguments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "taxId") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 9);
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue,
      }));

      if (numericValue.length > 0 && numericValue.length < 9) {
        setTaxIdError("TIN must be exactly 9 digits");
      } else {
        setTaxIdError("");
      }
      return;
    }

    if (name === "startDate") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      if (value) {
        const today = new Date().toISOString().split("T")[0];
        if (value < today) {
          setStartDateError("Start date must be today or in the future");
        } else {
          setStartDateError("");
        }
      } else {
        setStartDateError("");
      }
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCountryCodeChange = (code) => {
    setFormData((prevData) => ({
      ...prevData,
      primaryCountryCode: code,
    }));
  };

  const handleMedicalConditionChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      medicalCondition: value,
      questionTextarea: "",
    }));
  };

  const handleNext = () => {
    if (step === 1 && isFormValid) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      handleNext();
      return;
    }

    if (!isStep2Valid()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const vehiclesData = localStorage.getItem("liabilityVehicles");
      if (!vehiclesData) {
        throw new Error("No vehicles data found");
      }

      const vehicles = JSON.parse(vehiclesData);

      const questionsData = questions.map((question) => ({
        id: question.id,
        answer: formData.medicalCondition,
        textarea: formData.questionTextarea || "",
      }));

      if (formData.taxId.length !== 9) {
        throw new Error("TIN must be exactly 9 digits");
      }

      const today = new Date().toISOString().split("T")[0];
      const startDate = formData.startDate || today;
      if (startDate < today) {
        throw new Error("Start date must be today or in the future");
      }

      const submissionData = {
        start_date: startDate,
        vehicles: vehicles,
        holder_first_name: formData.name,
        holder_last_name: formData.surname,
        holder_address: formData.address,
        holder_mobile_number_ext: formData.primaryCountryCode,
        holder_mobile_number: formData.primaryPhoneNumber,
        holder_tax_office: formData.taxOffice,
        holder_tin: formData.taxId,
        holder_email: formData.email,
        holder_identification: formData.idPassport,
        plan_id: selectedQuote?.id || 3,
        plan_duration: selectedQuote?.duration || 12,
        questions: questionsData,
      };

      const response = await fetch(`${API_BASE_URL}/user/transportOperators/acceptQuote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit quote");
      }

      const result = await response.json();

      if (result.success && result.formUrl) {
        window.open(result.formUrl, "_self");
        onClose();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      setError(error.message || "Failed to submit quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.idPassport &&
    formData.name &&
    formData.surname &&
    formData.email &&
    formData.primaryCountryCode &&
    formData.primaryPhoneNumber &&
    formData.address &&
    formData.taxId &&
    formData.taxOffice &&
    formData.taxId.length === 9 &&
    !startDateError;

  const isStep2Valid = () => {
    if (formData.medicalCondition === "" || questions.length === 0) {
      return false;
    }

    const currentQuestion = questions[0];
    if (currentQuestion) {
      if (formData.medicalCondition === "yes" && currentQuestion.mustTextareaYes) {
        return formData.questionTextarea.trim() !== "";
      }
      if (formData.medicalCondition === "no" && currentQuestion.mustTextareaNo) {
        return formData.questionTextarea.trim() !== "";
      }
    }

    return true;
  };

  const shouldShowTextarea = () => {
    if (questions.length === 0) return false;
    const currentQuestion = questions[0];
    return (
      (formData.medicalCondition === "yes" && currentQuestion.mustTextareaYes) ||
      (formData.medicalCondition === "no" && currentQuestion.mustTextareaNo)
    );
  };

  const today = new Date().toISOString().split("T")[0];

  const inputStyle =
    "w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] outline-none text-base";
  const containerStyle = "max-w-[476px] mx-auto";
  const buttonStyle = `w-full h-[50px] text-white font-bold text-xl rounded-[30px] mx-auto ${containerStyle}`;

  return (
    <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50 p-4">
      <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] text-center p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6">
          <iconsUtil.CloseFormIcon />
        </button>

        {step === 1 && (
          <div className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-2xl font-medium text-primaryBgColor">{t("liability_form.header")}</h1>
              <h2 className="text-lg font-semibold text-primaryBgColor max-w-[422px] mx-auto">
                {t("liability_form.subheader")}
              </h2>
            </header>

            <div className="flex gap-5 justify-center items-center">
              <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
              <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-[#C3C3C3]"></div>
            </div>

            <hr className="border border-[#FACABC] w-2/3 mx-auto" />
            <h3 className="font-semibold text-secondaryColor">{t("liability_form.progress.personal_details")}</h3>

            <form className="space-y-4">
              <div className={containerStyle}>
                <input
                  type="text"
                  name="idPassport"
                  placeholder={t("liability_form.placeholders.id_passport")}
                  value={formData.idPassport}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>

              <div className={`${containerStyle} flex gap-3`}>
                <input
                  type="text"
                  name="name"
                  placeholder={t("liability_form.placeholders.name")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`${inputStyle} flex-1`}
                />
                <input
                  type="text"
                  name="surname"
                  placeholder={t("liability_form.placeholders.surname")}
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className={`${inputStyle} flex-1`}
                />
              </div>

              <div className={containerStyle}>
                <input
                  type="email"
                  name="email"
                  placeholder={t("liability_form.placeholders.email")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>

              <div className={`${containerStyle} flex gap-3 items-center`}>
                <div className="w-[110px]">
                  <CountryCodeSelect
                    value={formData.primaryCountryCode}
                    onChange={handleCountryCodeChange}
                    isInvalid={!formData.primaryCountryCode}
                  />
                </div>
                <input
                  type="tel"
                  name="primaryPhoneNumber"
                  placeholder={t("liability_form.placeholders.primary_phone")}
                  value={formData.primaryPhoneNumber}
                  onChange={handleChange}
                  required
                  className={`${inputStyle} flex-1`}
                />
              </div>

              <div className={containerStyle}>
                <input
                  type="text"
                  name="address"
                  placeholder={t("liability_form.placeholders.address")}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>

              <div className={containerStyle}>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{9}"
                  name="taxId"
                  placeholder={t("liability_form.placeholders.tax_id")}
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
                {taxIdError && <p className="text-red-500 text-sm text-left mt-1">{taxIdError}</p>}
              </div>

              <div className={containerStyle}>
                <input
                  type="text"
                  name="taxOffice"
                  placeholder={t("liability_form.placeholders.tax_office")}
                  value={formData.taxOffice}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>

              <div className={containerStyle}>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                  required
                  className={inputStyle}
                />
                {startDateError && <p className="text-red-500 text-sm text-left mt-1">{startDateError}</p>}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isFormValid}
                className={`${buttonStyle} ${
                  isFormValid ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                {t("liability_form.next_button") || "Next"}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-2xl font-medium text-primaryBgColor">{t("liability_form.header")}</h1>
              <h2 className="text-lg font-semibold text-primaryBgColor max-w-[422px] mx-auto">
                {t("liability_form.subheader")}
              </h2>
            </header>

            <hr className="border border-[#FACABC] w-2/3 mx-auto" />

            <div className="flex gap-5 justify-center items-center">
              <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
              <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-10">
                <div className="text-lg font-semibold text-red-600">{error}</div>
              </div>
            ) : (
              <>
                {questions.length > 0 && questions[0]?.question && (
                  <div
                    className="max-w-[500px] mx-auto text-left px-4 text-base"
                    dangerouslySetInnerHTML={{ __html: questions[0].question }}
                  />
                )}

                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleMedicalConditionChange("yes")}
                    className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none text-base font-medium ${
                      formData.medicalCondition === "yes"
                        ? "bg-secondaryColor text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {t("liability_form.buttons.yes") || "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMedicalConditionChange("no")}
                    className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none text-base font-medium ${
                      formData.medicalCondition === "no"
                        ? "bg-secondaryColor text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {t("liability_form.buttons.no") || "No"}
                  </button>
                </div>

                {shouldShowTextarea() && (
                  <div className={containerStyle}>
                    <textarea
                      name="questionTextarea"
                      value={formData.questionTextarea}
                      onChange={handleChange}
                      placeholder="Please provide additional details..."
                      required
                      className="w-full h-[100px] px-5 py-3 border border-[#C3C3C3] rounded-[10px] outline-none resize-none text-base"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStep2Valid() || isSubmitting}
                  className={`${buttonStyle} ${
                    isStep2Valid() && !isSubmitting ? "bg-orange-500" : "bg-gray-300"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : t("liability_form.submit_button") || "Submit"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

LiabilityForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedQuote: PropTypes.object,
  userDetails: PropTypes.object,
};