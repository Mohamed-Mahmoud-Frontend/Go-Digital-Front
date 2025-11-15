import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as iconsUtil from "@/utils/icons.util";
import { LoadingSpinner } from "@/components";
import { CountryCodeSelect } from "../../CountryCodeSelect";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ForeignersForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userTinError, setUserTinError] = useState("");
  const [formData, setFormData] = useState({
    startDate: "",
    identification: "",
    firstName: "",
    lastName: "",
    mobileExtension: "+30",
    mobileNumber: "",
    address: "",
    questions: [],
    userIdentification: "",
    userFirstName: "",
    userLastName: "",
    userEmail: "",
    userMobileExtension: "+30",
    userMobileNumber: "",
    userAddress: "",
    userTin: "",
    userTaxOffice: "",
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
        startDate: userDetails.step4?.insurancePeriod || "",
        identification: userDetails.step2?.identification || "",
        firstName: userDetails.step1?.firstName || "",
        lastName: userDetails.step1?.lastName || "",
      }));
    }
  }, [userDetails, isOpen]);

  useEffect(() => {
    if (isOpen && step === 3) {
      fetchUserDetails();
    }
  }, [isOpen, step]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/immigrationMedical/getArguments`, {
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

      setFormData((prevData) => ({
        ...prevData,
        questions: data.questions.map((question) => ({
          id: question.id,
          answer: "",
          textarea: "",
        })),
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${API_BASE_URL}/user/details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Accept-Language": i18n.language,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();

      setFormData((prevData) => ({
        ...prevData,
        userIdentification: data.identification || data.id_passport || "",
        userFirstName: data.first_name || data.name || "",
        userLastName: data.last_name || data.surname || "",
        userEmail: data.email || "",
        userMobileExtension: data.mobile_extension || data.phone_extension || prevData.userMobileExtension,
        userMobileNumber: data.mobile_number || data.phone || "",
        userAddress: data.address || "",
        userTin: data.tin || data.tax_id || "",
        userTaxOffice: data.tax_office || "",
      }));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "userTin") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 9);
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue,
      }));

      if (numericValue.length > 0 && numericValue.length < 9) {
        setUserTinError(t("foreigners_form.validation.tin_9_digits"));
      } else {
        setUserTinError("");
      }
      return;
    }

    if (name === "startDate") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMobileCodeChange = (code) => {
    setFormData((prevData) => ({
      ...prevData,
      mobileExtension: code,
    }));
  };

  const handleUserMobileCodeChange = (code) => {
    setFormData((prevData) => ({
      ...prevData,
      userMobileExtension: code,
    }));
  };

  const handleQuestionAnswerChange = (questionId, answer) => {
    setFormData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
  };

  const handleQuestionTextareaChange = (questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((q) =>
        q.id === questionId ? { ...q, textarea: value } : q
      ),
    }));
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 || step === 2) {
      handleNext();
      return;
    }

    if (!isStep3Valid) {
      toast.error(t("foreigners_form.validation.fill_all_fields"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const storedData = localStorage.getItem("foreignersQuoteData");
      if (!storedData) {
        throw new Error("No quote data found");
      }

      const quoteData = JSON.parse(storedData);

      if (formData.userTin.length !== 9 || !/^\d{9}$/.test(formData.userTin)) {
        throw new Error(t("foreigners_form.validation.tin_9_digits"));
      }

      const questionsData = formData.questions.map((question) => ({
        id: question.id.toString(),
        answer: question.answer || "no",
        textarea: question.textarea || "",
      }));

      const today = new Date().toISOString().split("T")[0];
      const startDate = formData.startDate || today;

      const submissionData = {
        date_birth: quoteData.userData.step3.birthday,
        identification: quoteData.userData.step2.identification,
        first_name: quoteData.userData.step1.firstName,
        last_name: quoteData.userData.step1.lastName,
        gender: quoteData.userData.step3.gender?.toLowerCase() || "",
        country_id: quoteData.userData.step2.nationalityId,
        mobile_number: formData.mobileNumber,
        mobile_number_ext: formData.mobileExtension,
        address: formData.address,
        start_date: startDate,
        holder_identification: formData.userIdentification,
        holder_first_name: formData.userFirstName,
        holder_last_name: formData.userLastName,
        holder_email: formData.userEmail,
        holder_mobile_number: formData.userMobileNumber,
        holder_mobile_number_ext: formData.userMobileExtension,
        holder_address: formData.userAddress,
        holder_tax_office: formData.userTaxOffice,
        holder_tin: formData.userTin,
        questions: questionsData,
        plan_id: selectedQuote?.id,
        plan_duration: selectedQuote?.duration || 12,
      };

      const response = await fetch(`${API_BASE_URL}/user/immigrationMedical/acceptQuote`, {
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
      toast.error(error.message || "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid =
    formData.startDate &&
    formData.identification &&
    formData.firstName &&
    formData.lastName &&
    formData.mobileExtension &&
    formData.mobileNumber &&
    formData.address;

  const isStep2Valid = () => {
    if (formData.questions.length === 0) return false;

    return formData.questions.every((question) => {
      if (!question.answer) return false;

      const apiQuestion = questions.find((q) => q.id === question.id);
      if (!apiQuestion) return true;

      if (question.answer === "yes" && apiQuestion.mustTextareaYes) {
        return question.textarea?.trim() !== "";
      }
      if (question.answer === "no" && apiQuestion.mustTextareaNo) {
        return question.textarea?.trim() !== "";
      }
      return true;
    });
  };

  const isStep3Valid =
    formData.userIdentification &&
    formData.userFirstName &&
    formData.userLastName &&
    formData.userEmail &&
    formData.userMobileExtension &&
    formData.userMobileNumber &&
    formData.userAddress &&
    formData.userTin &&
    formData.userTaxOffice &&
    formData.userTin.length === 9 &&
    !userTinError;

  const shouldShowTextarea = (question) => {
    const apiQuestion = questions.find((q) => q.id === question.id);
    if (!apiQuestion) return false;

    return (
      (question.answer === "yes" && apiQuestion.mustTextareaYes) ||
      (question.answer === "no" && apiQuestion.mustTextareaNo)
    );
  };

  const today = new Date().toISOString().split("T")[0];
  const inputStyle = "w-full h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] outline-none text-base";
  const containerStyle = "max-w-[476px] mx-auto";
  const buttonStyle = `w-full h-[50px] text-white font-bold text-xl rounded-[30px] mx-auto ${containerStyle}`;

  return (
    <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50 p-4">
      <Toaster position="top-center" />
      <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] text-center p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6">
          <iconsUtil.CloseFormIcon />
        </button>

        {step === 1 && (
          <Fragment>
            <div className="space-y-6">
              <header className="space-y-2">
                <h1 className="text-2xl font-medium text-primaryBgColor">{t("foreigners_form.header")}</h1>
                <h2 className="text-lg font-semibold text-primaryBgColor max-w-[422px] mx-auto">
                  {t("foreigners_form.subheader")}
                </h2>
              </header>

              <hr className="border border-[#FACABC] w-2/3 mx-auto" />

              <div className="flex gap-5 justify-center items-center">
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-[#C3C3C3]"></div>
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-[#C3C3C3]"></div>
              </div>

              <h3 className="font-semibold text-secondaryColor">{t("foreigners_form.subheader")}</h3>

              <form className="space-y-4">
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
                </div>

                <div className={containerStyle}>
                  <input
                    type="text"
                    name="identification"
                    placeholder={t("foreigners_form.placeholders.id_passport")}
                    value={formData.identification}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className={`${containerStyle} flex gap-3`}>
                  <input
                    type="text"
                    name="firstName"
                    placeholder={t("foreigners_form.placeholders.name")}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} flex-1`}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder={t("foreigners_form.placeholders.surname")}
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} flex-1`}
                  />
                </div>

                <div className={`${containerStyle} flex gap-3 items-center`}>
                  <div className="w-[110px]">
                    <CountryCodeSelect
                      value={formData.mobileExtension}
                      onChange={handleMobileCodeChange}
                      isInvalid={!formData.mobileExtension}
                    />
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    placeholder={t("foreigners_form.placeholders.mobile_number")}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} flex-1`}
                  />
                </div>

                <div className={containerStyle}>
                  <input
                    type="text"
                    name="address"
                    placeholder={t("foreigners_form.placeholders.address")}
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className={`${buttonStyle} ${isStep1Valid ? "bg-orange-500" : "bg-gray-300"}`}
                >
                  {t("foreigners_form.buttons.next")}
                </button>
              </form>
            </div>
          </Fragment>
        )}

        {step === 2 && (
          <Fragment>
            <div className="space-y-6">
              <header className="space-y-2">
                <h1 className="text-2xl font-medium text-primaryBgColor">{t("foreigners_form.header")}</h1>
                <h2 className="text-lg font-semibold text-primaryBgColor max-w-[422px] mx-auto">
                  {t("foreigners_form.subheader")}
                </h2>
              </header>

              <hr className="border border-[#FACABC] w-2/3 mx-auto" />

              <div className="flex gap-5 justify-center items-center">
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-[#C3C3C3]"></div>
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
                  <h3 className="font-semibold text-secondaryColor">{t("foreigners_form.subheader")}</h3>

                  {formData.questions.map((question, index) => {
                    const apiQuestion = questions.find((q) => q.id === question.id);
                    if (!apiQuestion) return null;

                    return (
                      <div key={question.id} className="max-w-[500px] mx-auto text-left px-4 mb-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-3">
                            {index + 1}. <span dangerouslySetInnerHTML={{ __html: apiQuestion.question }} />
                          </h3>

                          <div className="flex gap-4 mb-3">
                            <button
                              type="button"
                              onClick={() => handleQuestionAnswerChange(apiQuestion.id, "yes")}
                              className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none text-base font-medium ${
                                question.answer === "yes"
                                  ? "bg-secondaryColor text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {t("foreigners_form.buttons.yes")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuestionAnswerChange(apiQuestion.id, "no")}
                              className={`px-8 h-[40px] border border-[#C3C3C3] rounded-[27.5px] outline-none text-base font-medium ${
                                question.answer === "no"
                                  ? "bg-secondaryColor text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {t("foreigners_form.buttons.no")}
                            </button>
                          </div>

                          {shouldShowTextarea(question) && (
                            <textarea
                              value={question.textarea || ""}
                              onChange={(e) => handleQuestionTextareaChange(apiQuestion.id, e.target.value)}
                              placeholder={t("foreigners_form.placeholders.additionalDetails")}
                              required
                              className="w-full h-[100px] px-5 py-3 border border-[#C3C3C3] rounded-[10px] outline-none resize-none text-base"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep2Valid()}
                    className={`${buttonStyle} ${isStep2Valid() ? "bg-orange-500" : "bg-gray-300"}`}
                  >
                    {t("foreigners_form.buttons.next")}
                  </button>
                </>
              )}
            </div>
          </Fragment>
        )}

        {step === 3 && (
          <Fragment>
            <div className="space-y-6">
              <header className="space-y-2">
                <h1 className="text-2xl font-medium text-primaryBgColor">{t("foreigners_form.header")}</h1>
                <h2 className="text-lg font-semibold text-primaryBgColor max-w-[422px] mx-auto">
                  {t("foreigners_form.subheader")}
                </h2>
              </header>

              <hr className="border border-[#FACABC] w-2/3 mx-auto" />

              <div className="flex gap-5 justify-center items-center">
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
                <div className="h-[10px] flex-1 max-w-[120px] rounded-md bg-secondaryColor"></div>
              </div>

              <h3 className="font-semibold text-secondaryColor">{t("foreigners_form.step3.subheader")}</h3>
              <p className="max-w-[476px] text-center mx-auto">
                Επιλέξτε εδώ για να εισαχθοούν τα στοιχεία του ασφαλιζόμενου προσώπου.
              </p>
              <button className="w-14 h-7 bg-white rounded-3xl shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] border border-red-500 text-sm my-3 mx-auto">
                ΕΔΩ
              </button>

              <form className="space-y-4">
                <div className={containerStyle}>
                  <input
                    type="text"
                    name="userIdentification"
                    placeholder={t("foreigners_form.placeholders.id_passport")}
                    value={formData.userIdentification}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className={`${containerStyle} flex gap-3`}>
                  <input
                    type="text"
                    name="userFirstName"
                    placeholder={t("foreigners_form.placeholders.name")}
                    value={formData.userFirstName}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} flex-1`}
                  />
                  <input
                    type="text"
                    name="userLastName"
                    placeholder={t("foreigners_form.placeholders.surname")}
                    value={formData.userLastName}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} flex-1`}
                  />
                </div>

                <div className={containerStyle}>
                  <input
                    type="email"
                    name="userEmail"
                    placeholder={t("foreigners_form.placeholders.user_email")}
                    value={formData.userEmail}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className={`${containerStyle} flex gap-3 items-center`}>
                  <div className="w-[110px]">
                    <CountryCodeSelect
                      value={formData.userMobileExtension}
                      onChange={handleUserMobileCodeChange}
                      isInvalid={!formData.userMobileExtension}
                    />
                  </div>
                  <input
                    type="tel"
                    name="userMobileNumber"
                    placeholder={t("foreigners_form.placeholders.primary_phone")}
                    value={formData.userMobileNumber}
                    onChange={handleChange}
                    required
                    className={`${inputStyle} flex-1`}
                  />
                </div>

                <div className={containerStyle}>
                  <input
                    type="text"
                    name="userAddress"
                    placeholder={t("foreigners_form.placeholders.address")}
                    value={formData.userAddress}
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
                    name="userTin"
                    placeholder={t("foreigners_form.placeholders.tax_id")}
                    value={formData.userTin}
                    onChange={handleChange}
                    maxLength={9}
                    required
                    className={`${inputStyle} ${userTinError ? "border-red-500 border-2" : ""}`}
                  />
                  {userTinError && <p className="text-red-500 text-sm text-left mt-1">{userTinError}</p>}
                </div>

                <div className={containerStyle}>
                  <input
                    type="text"
                    name="userTaxOffice"
                    placeholder={t("foreigners_form.placeholders.tax_office")}
                    value={formData.userTaxOffice}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-center mt-4 text-lg font-semibold">{error}</div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStep3Valid || isSubmitting}
                  className={`${buttonStyle} ${isStep3Valid && !isSubmitting ? "bg-orange-500" : "bg-gray-300"}`}
                >
                  {isSubmitting ? "Submitting..." : t("foreigners_form.buttons.submit")}
                </button>
              </form>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

ForeignersForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedQuote: PropTypes.object,
  userDetails: PropTypes.object,
};