// src/pages/SuccessPage.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";

const SuccessPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // جلب بيانات العقد من الـ state أو localStorage
  const contract = location.state?.contract || JSON.parse(localStorage.getItem("lastContract") || "{}");
  const product = contract.product || localStorage.getItem("lastProduct") || "travel";

  const handleRenewContract = () => {
    const renewData = {
      product,
      contractData: {
        from_country: contract.from_country || contract.departure_country || "",
        from_country_id: contract.from_country_id || "",
        to_country_ids: contract.to_country_ids || [],
        to_country: contract.to_countries || [],
        start_date: contract.start_date || "",
        end_date: contract.end_date || "",
        insured_type_name: contract.insured_type_name || "",
        insured_type_id: contract.insured_type_id || "",
        person_count: contract.person_count || contract.persons?.length || "",
        persons: (contract.persons || []).map(p => ({
          full_name: p.full_name || p.name || "",
          date_birth: p.date_birth || p.dateBirth || "",
          identification: p.identification || p.id_number || ""
        }))
      }
    };

    localStorage.setItem("renewContractData", JSON.stringify(renewData));
    
    // روح لصفحة الـ Quote الخاصة بالمنتج
    const routes = {
      travel: "/get-a-quote-travel",
      foreigners: "/get-a-quote-foreigners",
      liability: "/get-a-quote-liability",
    };
    navigate(routes[product] || "/get-a-quote-travel");
  };

  // احفظ العقد عشان لو عمل refresh
  useEffect(() => {
    if (contract && Object.keys(contract).length > 0) {
      localStorage.setItem("lastContract", JSON.stringify(contract));
      localStorage.setItem("lastProduct", product);
    }
  }, [contract, product]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("success.title") || "تم إصدار وثيقتك بنجاح!"}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {t("success.message") || "تم إرسال الوثيقة إلى بريدك الإلكتروني وجاهزة للاستخدام."}
        </p>

        {contract.contract_number && (
          <div className="bg-orange-50 rounded-xl p-6 mb-8 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">رقم الوثيقة</p>
            <p className="text-3xl font-bold text-orange-600">{contract.contract_number}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
          >
            {t("success.back_to_home") || "العودة للرئيسية"}
          </button>

          <button
            onClick={handleRenewContract}
            className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-3"
          >
            <span>{t("success.renew_contract") || "تجديد الوثيقة"}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-10">
          {t("success.support") || "محتاج مساعدة؟ تواصل معانا: support@godigital.gr"}
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;