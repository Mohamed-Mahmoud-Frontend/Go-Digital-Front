import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // (ملاحظة: تم حذف useLocation)
import PropTypes from "prop-types";
// Components
import { QuoteHeader, LoadingSpinner } from "@/components";
// Icons
import * as Icons from "@/utils/icons.util";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const GuaranteeQuote = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    // (ملاحظة: تم حذف useLocation)

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

    const [userData, setUserData] = useState({
        // ... (نفس كود الـ userData state بدون تغيير) ...
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
        step6: {
            questions: [],
        },
    });

    // 1. جلب البيانات من API
    useEffect(() => {
        const fetchApiData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/user/bondInsurance/getArguments`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept-Language": i18n.language,
                    },
                });

                if (!response.ok) throw new Error("فشل جلب بيانات النموذج");

                const data = await response.json();
                setApiData(data);

                const initialQuestions = data.questions.map((q) => ({
                    id: q.id.toString(),
                    answer: "",
                    textarea: "",
                }));

                setUserData((prev) => ({
                    ...prev,
                    step6: { questions: initialQuestions },
                }));
            } catch (err) {
                console.error("Error fetching API data:", err);
                setError("فشل تحميل النموذج. حاول مرة أخرى.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiData();
    }, [i18n.language]);

    // 2. (معدل) استقبال القيمة المختارة من localStorage
    useEffect(() => {
        // نقرأ القيمة من localStorage
        const prefilledId = localStorage.getItem("guarantee_type_prefill");

        // نتأكد أن القيمة موجودة وأن بيانات الـ API (الخيارات) قد وصلت
        if (prefilledId && apiData.type_of_guarantees.length > 0) {
            const exists = apiData.type_of_guarantees.some(
                (t) => t.id.toString() === prefilledId
            );

            if (exists) {
                setUserData((prev) => ({
                    ...prev,
                    step1: {
                        ...prev.step1,
                        type_of_guarantee: prefilledId,
                    },
                }));
                // (جديد) نمسح القيمة بعد استخدامها
                localStorage.removeItem("guarantee_type_prefill");
            }
        }
        // هذا الـ effect يعتمد على apiData، لنتأكد أن الخيار موجود قبل تعيينه
    }, [apiData.type_of_guarantees]);

    // 3. جلب بيانات المستخدم إذا كان مسجل الدخول (بدون تغيير)
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/user/details`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "Accept-Language": i18n.language,
                    },
                });

                if (!response.ok) throw new Error("فشل جلب بيانات المستخدم");

                const userDetails = await response.json();

                setUserData((prev) => ({
                    ...prev,
                    step2: {
                        ...prev.step2,
                        holder_first_name: userDetails.first_name || "",
                        holder_last_name: userDetails.last_name || "",
                        holder_identification: userDetails.identification || "",
                        holder_contact_person: `${userDetails.first_name || ""} ${userDetails.last_name || ""}`.trim(),
                    },
                    step3: {
                        ...prev.step3,
                        holder_email: userDetails.email || "",
                        holder_mobile_number: userDetails.mobile_number || "",
                        holder_mobile_number_ext: userDetails.mobile_extension || "+30",
                        holder_phone_number: userDetails.phone_number || "",
                        holder_phone_number_ext: userDetails.phone_extension || "+30",
                        holder_address: userDetails.address || "",
                        holder_tin: userDetails.tin || "",
                        holder_tax_office: userDetails.tax_office || "",
                    },
                }));
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        fetchUserDetails();
    }, [i18n.language]);

    // ... (باقي دوال الـ handlers والـ JSX بدون تغيير) ...

    const handleInputChange = (step, field, value) => {
        setIsInvalid(false);
        setUserData((prev) => ({
            ...prev,
            [step]: { ...prev[step], [field]: value },
        }));
    };

    const handleQuestionChange = (questionId, answer, textarea = "") => {
        setUserData((prev) => ({
            ...prev,
            step6: {
                ...prev.step6,
                questions: prev.step6.questions.map((q) =>
                    q.id === questionId ? { ...q, answer, textarea } : q
                ),
            },
        }));
    };

    const isStepValid = (step) => {
        const stepData = userData[`step${step + 1}`];

        if (step === 5) {
            return stepData.questions.every((q) => q.answer !== "");
        }

        const requiredFields = Object.keys(stepData).filter(
            (key) =>
                ![
                    "type_other_desc",
                    "holder_identification",
                    "holder_contact_person",
                    "beneficiary_contact_person",
                ].includes(key)
        );

        return requiredFields.every((field) => {
            const value = stepData[field];
            return value && value.toString().trim() !== "";
        });
    };

    const handleNext = async () => {
        if (isStepValid(currentStep)) {
            if (currentStep < totalSteps - 1) {
                setCurrentStep((prev) => prev + 1);
            } else {
                await handleSubmit();
            }
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
        try {
            setIsLoading(true);

            const requestData = {
                type_of_guarantee: userData.step1.type_of_guarantee,
                type_other_desc: userData.step1.type_other_desc,
                start_date: userData.step1.start_date,
                end_date: userData.step1.end_date,
                holder_identification: userData.step2.holder_identification,
                holder_first_name: userData.step2.holder_first_name,
                holder_last_name: userData.step2.holder_last_name,
                holder_type: userData.step2.holder_type,
                holder_email: userData.step3.holder_email,
                holder_mobile_number: userData.step3.holder_mobile_number,
                holder_mobile_number_ext: userData.step3.holder_mobile_number_ext,
                holder_phone_number: userData.step3.holder_phone_number,
                holder_phone_number_ext: userData.step3.holder_phone_number_ext,
                holder_address: userData.step3.holder_address,
                holder_tin: userData.step3.holder_tin,
                holder_tax_office: userData.step3.holder_tax_office,
                holder_website: userData.step3.holder_website,
                holder_contact_person: userData.step2.holder_contact_person,
                beneficiary_name: userData.step4.beneficiary_name,
                beneficiary_tin: userData.step4.beneficiary_tin,
                beneficiary_address: userData.step4.beneficiary_address,
                beneficiary_mobile_number: userData.step4.beneficiary_mobile_number,
                beneficiary_mobile_number_ext: userData.step4.beneficiary_mobile_number_ext,
                beneficiary_phone_number: userData.step4.beneficiary_phone_number,
                beneficiary_phone_number_ext: userData.step4.beneficiary_phone_number_ext,
                beneficiary_email: userData.step4.beneficiary_email,
                beneficiary_contact_person: userData.step4.beneficiary_contact_person,
                guarantee_number: userData.step5.guarantee_number,
                guarantee_title: userData.step5.guarantee_title,
                guarantee_value: parseFloat(userData.step5.guarantee_value),
                guarantee_amount: parseFloat(userData.step5.guarantee_amount),
                questions: userData.step6.questions,
            };

            localStorage.setItem("guaranteeData", JSON.stringify(requestData));
            navigate("/get-a-quote-guarantee/proceed");
        } catch (error) {
            console.error("Error submitting:", error);
            setError("فشل إرسال البيانات. حاول مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <main>
                <QuoteHeader />
                <div className="flex justify-center items-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </main>
        );
    }

    if (error) {
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
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-12 vsm:w-16 sm:w-24 md:w-[130px] lg:w-[150px] xl:w-[200px] h-[15px] rounded-[5px]
   ${index < currentStep ? "bg-orange-400" : "bg-gray-300"}
   ${index === currentStep ? "ml-[50px] md:ml-16" : ""}`}
                            />
                        ))}
                        <span
                            className="absolute transition_all"
                            style={{
                                left: `calc(${currentStep * (currentStep === 5 ? 21 : 19.5)}%)`,
                            }}
                        >
                            <Icons.QuotePersonIcon />
                        </span>
                    </div>
                </div>

                <div className="my-5 flex flex-wrap justify-center items-center gap-5 w-full">
                    {currentStep === 0 && (
                        <div className="flex flex-col justify-center items-center gap-5">
                            <Icons.QuoteCommentIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t("guarantee_quote_page.steps.step1.title1")}
                            </h1>
                            <TravelSelect
                                placeholder={t("guarantee_quote_page.steps.step1.select_placeholder")}
                                value={userData.step1.type_of_guarantee}
                                onChange={(e) =>
                                    handleInputChange("step1", "type_of_guarantee", e.target.value)
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
                                    placeholder={t("guarantee_quote_page.steps.step1.other_placeholder")}
                                    value={userData.step1.type_other_desc}
                                    onChange={(e) =>
                                        handleInputChange("step1", "type_other_desc", e.target.value)
                                    }
                                    isInvalid={isInvalid && !userData.step1.type_other_desc}
                                />
                            )}
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
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
                            />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
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
                            />
                        </div>
                    )}
                    {/* ... (باقي كود الخطوات 2, 3, 4, 5, 6 بدون تغيير) ... */}
                    {currentStep === 1 && (
                        <div className="flex flex-col justify-center items-center gap-5 sm:gap-10 w-full">
                            <Icons.QuoteProfileIcon />
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold">
                                {t("guarantee_quote_page.steps.step2.title1")}
                            </h1>
                            <TravelSelect
                                placeholder={t("guarantee_quote_page.steps.step2.holder_type_placeholder")}
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
                            <div className="flex gap-3 w-full max-w-80 vsm:max-w-[450px]">
                                <TravelInput
                                    type="text"
                                    placeholder={t("guarantee_quote_page.steps.step2.first_name")}
                                    value={userData.step2.holder_first_name}
                                    onChange={(e) =>
                                        handleInputChange("step2", "holder_first_name", e.target.value)
                                    }
                                    isInvalid={isInvalid && !userData.step2.holder_first_name}
                                />
                                <TravelInput
                                    type="text"
                                    placeholder={t("guarantee_quote_page.steps.step2.last_name")}
                                    value={userData.step2.holder_last_name}
                                    onChange={(e) =>
                                        handleInputChange("step2", "holder_last_name", e.target.value)
                                    }
                                    isInvalid={isInvalid && !userData.step2.holder_last_name}
                                />
                            </div>
                            <TravelInput
                                type="text"
                                placeholder={t("guarantee_quote_page.steps.step2.identification")}
                                value={userData.step2.holder_identification}
                                onChange={(e) =>
                                    handleInputChange("step2", "holder_identification", e.target.value)
                                }
                            />
                            <TravelInput
                                type="text"
                                placeholder={t("guarantee_quote_page.steps.step2.contact_person")}
                                value={userData.step2.holder_contact_person}
                                onChange={(e) =>
                                    handleInputChange("step2", "holder_contact_person", e.target.value)
                                }
                            />
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="overflow-y-auto max-h-screen">
                            <h1 className="max-w-[860px] text-2xl sm:text-4xl text-center font-semibold mb-3">
                                {t("guarantee_quote_page.steps.step3.title")}
                            </h1>
                            <form className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    name="website"
                                    placeholder={t("guarantee_quote_page.steps.step3.placeholders.website")}
                                    value={userData.step3.holder_website}
                                    onChange={(e) => handleInputChange("step3", "holder_website", e.target.value)}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder={t("guarantee_quote_page.steps.step3.placeholders.email")}
                                    value={userData.step3.holder_email}
                                    onChange={(e) => handleInputChange("step3", "holder_email", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                    <input
                                        type="text"
                                        name="mobileExtension"
                                        placeholder="+30"
                                        value={userData.step3.holder_mobile_number_ext}
                                        onChange={(e) => handleInputChange("step3", "holder_mobile_number_ext", e.target.value)}
                                        required
                                        className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                                    />
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        placeholder="Mobile Number"
                                        value={userData.step3.holder_mobile_number}
                                        onChange={(e) => handleInputChange("step3", "holder_mobile_number", e.target.value)}
                                        required
                                        className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                    <input
                                        type="text"
                                        name="phoneExtension"
                                        placeholder="+30"
                                        value={userData.step3.holder_phone_number_ext}
                                        onChange={(e) => handleInputChange("step3", "holder_phone_number_ext", e.target.value)}
                                        required
                                        className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                                    />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="Phone Number"
                                        value={userData.step3.holder_phone_number}
                                        onChange={(e) => handleInputChange("step3", "holder_phone_number", e.target.value)}
                                        required
                                        className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder={t("guarantee_quote_page.steps.step3.placeholders.address")}
                                    value={userData.step3.holder_address}
                                    onChange={(e) => handleInputChange("step3", "holder_address", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="taxId"
                                    placeholder={t("guarantee_quote_page.steps.step3.placeholders.tax_id")}
                                    value={userData.step3.holder_tin}
                                    onChange={(e) => handleInputChange("step3", "holder_tin", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="taxOffice"
                                    placeholder={t("guarantee_quote_page.steps.step3.placeholders.tax_office")}
                                    value={userData.step3.holder_tax_office}
                                    onChange={(e) => handleInputChange("step3", "holder_tax_office", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                            </form>
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="overflow-y-auto max-h-screen">
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold mb-3">
                                {t("guarantee_quote_page.steps.step4.title")}
                            </h1>
                            <form className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={t("guarantee_quote_page.steps.step4.placeholders.name")}
                                    value={userData.step4.beneficiary_name}
                                    onChange={(e) => handleInputChange("step4", "beneficiary_name", e.target.value)}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder={t("guarantee_quote_page.steps.step4.placeholders.email")}
                                    value={userData.step4.beneficiary_email}
                                    onChange={(e) => handleInputChange("step4", "beneficiary_email", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                    <input
                                        type="text"
                                        name="mobileExtension"
                                        placeholder="+30"
                                        value={userData.step4.beneficiary_mobile_number_ext}
                                        onChange={(e) => handleInputChange("step4", "beneficiary_mobile_number_ext", e.target.value)}
                                        required
                                        className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                                    />
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        placeholder="Mobile Number"
                                        value={userData.step4.beneficiary_mobile_number}
                                        onChange={(e) => handleInputChange("step4", "beneficiary_mobile_number", e.target.value)}
                                        required
                                        className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
                                    <input
                                        type="text"
                                        name="phoneExtension"
                                        placeholder="+30"
                                        value={userData.step4.beneficiary_phone_number_ext}
                                        onChange={(e) => handleInputChange("step4", "beneficiary_phone_number_ext", e.target.value)}
                                        required
                                        className="w-full max-w-[90px] h-[50px] px-2 border border-[#C3C3C3] outline-none rounded-[10px] text-center"
                                    />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="Phone Number"
                                        value={userData.step4.beneficiary_phone_number}
                                        onChange={(e) => handleInputChange("step4", "beneficiary_phone_number", e.target.value)}
                                        required
                                        className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder={t("guarantee_quote_page.steps.step4.placeholders.address")}
                                    value={userData.step4.beneficiary_address}
                                    onChange={(e) => handleInputChange("step4", "beneficiary_address", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="taxId"
                                    placeholder={t("guarantee_quote_page.steps.step4.placeholders.tax_id")}
                                    value={userData.step4.beneficiary_tin}
                                    onChange={(e) => handleInputChange("step4", "beneficiary_tin", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="text"
                                    name="contactPerson"
                                    placeholder="Contact Name"
                                    value={userData.step4.beneficiary_contact_person}
                                    onChange={(e) => handleInputChange("step4", "beneficiary_contact_person", e.target.value)}
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                            </form>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div className="overflow-y-auto max-h-screen">
                            <h1 className="max-w-[850px] text-2xl sm:text-4xl text-center font-semibold mb-3">
                                {t("guarantee_quote_page.steps.step5.title")}
                            </h1>
                            <form className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    name="guaranteeNumber"
                                    placeholder="Guarantee Number"
                                    value={userData.step5.guarantee_number}
                                    onChange={(e) => handleInputChange("step5", "guarantee_number", e.target.value)}
                                    required
                                    className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
                                />
                                <input
                                    type="text"
                                    name="guaranteeTitle"
                                    placeholder="Guarantee Title"
                                    value={userData.step5.guarantee_title}
                                    onChange={(e) => handleInputChange("step5", "guarantee_title", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="number"
                                    name="guaranteeValue"
                                    placeholder="Guarantee Value"
                                    value={userData.step5.guarantee_value}
                                    onChange={(e) => handleInputChange("step5", "guarantee_value", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                                <input
                                    type="number"
                                    name="guaranteeAmount"
                                    placeholder="Guarantee Amount"
                                    value={userData.step5.guarantee_amount}
                                    onChange={(e) => handleInputChange("step5", "guarantee_amount", e.target.value)}
                                    required
                                    className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
                                />
                            </form>
                        </div>
                    )}
                    {currentStep === 5 && (
                        <section>
                            <h1 className="max-w-[683px] text-2xl sm:text-4xl text-center font-semibold mb-6 vsm:mb-10">
                                {t("guarantee_finish.header")}
                            </h1>
                            {apiData.questions.map((question, index) => {
                                // ... (نفس كود الأسئلة) ...
                                const questionData = userData.step6.questions.find(q => q.id === question.id.toString());
                                return (
                                    <div key={question.id}>
                                        <ol start={index + 1}>
                                            <li
                                                className="max-w-[454px] mx-auto text-sm text-left list-decimal"
                                                dangerouslySetInnerHTML={{ __html: question.question }}
                                            />
                                        </ol>
                                        <div className="flex justify-start gap-4 my-2 mx-auto max-w-[454px]">
                                            <button
                                                type="button"
                                                onClick={() => handleQuestionChange(question.id.toString(), "yes")}
                                                className={`max-w-[42.589px] h-[30px] border border-[#C3C3C3] rounded-[27.5px] w-full outline-none ${questionData?.answer === "yes" ? "bg-secondaryColor" : "bg-white"
                                                    }`}
                                            >
                                                {t("guarantee_finish.yes")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuestionChange(question.id.toString(), "no")}
                                                className={`max-w-[42.589px] h-[30px] border border-[#C3C3C3] rounded-[27.5px] w-full outline-none ${questionData?.answer === "no" ? "bg-secondaryColor" : "bg-white"
                                                    }`}
                                            >
                                                {t("guarantee_finish.no")}
                                            </button>
                                        </div>
                                        {(question.mustTextareaYes && questionData?.answer === "yes") ||
                                            (question.mustTextareaNo && questionData?.answer === "no") ? (
                                            <div className="max-w-[454px] mx-auto my-2">
                                                <textarea
                                                    placeholder="Please provide additional details..."
                                                    value={questionData?.textarea || ""}
                                                    onChange={(e) => handleQuestionChange(question.id.toString(), questionData?.answer, e.target.value)}
                                                    className="w-full h-20 px-3 py-2 border border-[#C3C3C3] rounded-[10px] outline-none resize-none"
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </section>
                    )}
                </div>

                {/* الأزرار */}
                <div className="flex justify-center items-center gap-3 vsm:gap-10 my-5">
                    <ActionButton
                        text={t("guarantee_quote_page.buttons.previous")}
                        iconPosition="left"
                        onClick={handlePrevious}
                        isDisabled={currentStep === 0}
                    />
                    <ActionButton
                        text={
                            currentStep < totalSteps - 1
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

// ... (نفس كود الـ PropTypes و ActionButton و TravelSelect و TravelInput بدون تغيير) ...
const TravelInput = ({ placeholder, value, onChange, isInvalid, type = "text" }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-[450px] h-[75px] px-4 border rounded-[10px] text-[#C3C3C3] font-semibold focus:outline-none
 ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
 ${value ? "text-black border-black" : "text-[#C3C3C3]"}`}
    />
);

const TravelSelect = ({ placeholder, value, onChange, options, isInvalid }) => (
    <select
        value={value}
        onChange={onChange}
        className={`w-full max-w-80 vsm:max-w-[450px] h-[75px] px-4 border rounded-[10px] font-semibold focus:outline-none 
 ${isInvalid ? "border-secondaryColor border-2 animate-pulse" : "border-[#C3C3C3]"}
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
 ${isNext ? "sm:pl-16" : "sm:pr-14"} w-36 sm:w-[220px] h-12 sm:h-[59px] text-sm vsm:text-base sm:text-lg font-medium 
 border rounded-[27.5px] shadow-md transition-all
 ${isDisabled ? "text-gray-400" : "text-black"}`}
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

TravelInput.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    isInvalid: PropTypes.bool,
    type: PropTypes.string,
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