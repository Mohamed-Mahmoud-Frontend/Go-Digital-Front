import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as iconsUtil from "@/utils/icons.util";
import { QuoteHeader, LoadingSpinner } from "@/components";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_STORAGE_KEY = "travelFormData";

// بيانات الدول مع الأعلام والكود (يمكن تحميلها من API أو مكتبة)
const COUNTRY_DATA = [
  { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "+244", flag: "🇦🇴" },
  { name: "Antigua and Barbuda", code: "+1-268", flag: "🇦🇬" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "+1-242", flag: "🇧🇸" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "+1-246", flag: "🇧🇧" },
  { name: "Belarus", code: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "+229", flag: "🇧🇯" },
  { name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { name: "Bolivia", code: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Brunei", code: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "Cambodia", code: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Cape Verde", code: "+238", flag: "🇨🇻" },
  { name: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { name: "Chad", code: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
  { name: "Comoros", code: "+269", flag: "🇰🇲" },
  { name: "Congo", code: "+242", flag: "🇨🇬" },
  { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { name: "Dominica", code: "+1-767", flag: "🇩🇲" },
  { name: "Dominican Republic", code: "+1-809", flag: "🇩🇴" },
  { name: "Ecuador", code: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "+503", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { name: "Eritrea", code: "+291", flag: "🇪🇷" },
  { name: "Estonia", code: "+372", flag: "🇪🇪" },
  { name: "Eswatini", code: "+268", flag: "🇸🇿" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Fiji", code: "+679", flag: "🇫🇯" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "+241", flag: "🇬🇦" },
  { name: "Gambia", code: "+220", flag: "🇬🇲" },
  { name: "Georgia", code: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "+30", flag: "🇬🇷" }, // Default +30
  { name: "Grenada", code: "+1-473", flag: "🇬🇩" },
  { name: "Guatemala", code: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "+224", flag: "🇬🇳" },
  { name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { name: "Guyana", code: "+592", flag: "🇬🇾" },
  { name: "Haiti", code: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "+504", flag: "🇭🇳" },
  { name: "Hungary", code: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "+354", flag: "🇮🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "+353", flag: "🇮🇪" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "+1-876", flag: "🇯🇲" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Kiribati", code: "+686", flag: "🇰🇮" },
  { name: "Kosovo", code: "+383", flag: "🇽🇰" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { name: "Laos", code: "+856", flag: "🇱🇦" },
  { name: "Latvia", code: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { name: "Liberia", code: "+231", flag: "🇱🇷" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { name: "Lithuania", code: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { name: "Malawi", code: "+265", flag: "🇲🇼" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "+356", flag: "🇲🇹" },
  { name: "Marshall Islands", code: "+692", flag: "🇲🇭" },
  { name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Micronesia", code: "+691", flag: "🇫🇲" },
  { name: "Moldova", code: "+373", flag: "🇲🇩" },
  { name: "Monaco", code: "+377", flag: "🇲🇨" },
  { name: "Mongolia", code: "+976", flag: "🇲🇳" },
  { name: "Montenegro", code: "+382", flag: "🇲🇪" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "+95", flag: "🇲🇲" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
  { name: "Nauru", code: "+674", flag: "🇳🇷" },
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { name: "Niger", code: "+227", flag: "🇳🇪" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "North Korea", code: "+850", flag: "🇰🇵" },
  { name: "North Macedonia", code: "+389", flag: "🇲🇰" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Palau", code: "+680", flag: "🇵🇼" },
  { name: "Palestine", code: "+970", flag: "🇵🇸" },
  { name: "Panama", code: "+507", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { name: "Paraguay", code: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", code: "+1-869", flag: "🇰🇳" },
  { name: "Saint Lucia", code: "+1-758", flag: "🇱🇨" },
  { name: "Saint Vincent and the Grenadines", code: "+1-784", flag: "🇻🇨" },
  { name: "Samoa", code: "+685", flag: "🇼🇸" },
  { name: "San Marino", code: "+378", flag: "🇸🇲" },
  { name: "Sao Tome and Principe", code: "+239", flag: "🇸🇹" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "+381", flag: "🇷🇸" },
  { name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "+386", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { name: "Somalia", code: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "South Sudan", code: "+211", flag: "🇸🇸" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Suriname", code: "+597", flag: "🇸🇷" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "+886", flag: "🇹🇼" },
  { name: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Timor-Leste", code: "+670", flag: "🇹🇱" },
  { name: "Togo", code: "+228", flag: "🇹🇬" },
  { name: "Tonga", code: "+676", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", code: "+1-868", flag: "🇹🇹" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { name: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "+598", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { name: "Vatican City", code: "+39", flag: "🇻🇦" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" },
];

export const TravelForm = ({ isOpen, onClose, selectedQuote, userDetails }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    identification: "",
    email: "",
    mobileCountryCodes: [], // Multi
    mobileNumber: "",
    phoneCountryCodes: [], // Multi
    phoneNumber: "",
    address: "",
  });

  // قراءة من localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('travelFormData');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData({
            name: parsed.name || "",
            surname: parsed.surname || "",
            identification: parsed.identification || "",
            email: parsed.email || "",
            mobileCountryCodes: Array.isArray(parsed.mobileCountryCodes) ? parsed.mobileCountryCodes : [],
            mobileNumber: parsed.mobileNumber || "",
            phoneCountryCodes: Array.isArray(parsed.phoneCountryCodes) ? parsed.phoneCountryCodes : [],
            phoneNumber: parsed.phoneNumber || "",
            address: parsed.address || "",
          });
        } else {
          fetchUserDetails();
        }
      } catch {
        fetchUserDetails();
      }
    }
  }, [isOpen]);

  // حفظ تلقائي
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem('travelFormData', JSON.stringify(formData));
      } catch (err) {
        console.error('Failed to save form:', err);
      }
    }
  }, [formData, isOpen]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/user/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept-Language': i18n.language
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const data = await response.json();

      setFormData(prevData => ({
        ...prevData,
        name: data.first_name || data.name || "",
        surname: data.last_name || data.surname || "",
        identification: data.identification || data.id_passport || "",
        email: data.email || "",
        mobileNumber: data.mobile_number || data.phone || "",
        phoneNumber: data.phone || data.mobile_number || "",
        address: data.address || "",
      }));

      // إضافة اليونان افتراضيًا للكود
      const greece = COUNTRY_DATA.find(c => c.name === "Greece");
      if (greece) {
        setFormData(prev => ({
          ...prev,
          mobileCountryCodes: [greece],
          phoneCountryCodes: [greece],
        }));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMobileCountryAdd = (country) => {
    if (!formData.mobileCountryCodes.find(c => c.name === country.name)) {
      setFormData(prev => ({
        ...prev,
        mobileCountryCodes: [...prev.mobileCountryCodes, country],
      }));
    }
  };

  const handleMobileCountryRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      mobileCountryCodes: prev.mobileCountryCodes.filter((_, i) => i !== index),
    }));
  };

  const handlePhoneCountryAdd = (country) => {
    if (!formData.phoneCountryCodes.find(c => c.name === country.name)) {
      setFormData(prev => ({
        ...prev,
        phoneCountryCodes: [...prev.phoneCountryCodes, country],
      }));
    }
  };

  const handlePhoneCountryRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      phoneCountryCodes: prev.phoneCountryCodes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const storedData = JSON.parse(localStorage.getItem('travelQuoteData') || '{}');

      const mobileCountryCode = formData.mobileCountryCodes.map(c => c.code).join(',') || "+30";
      const phoneCountryCode = formData.phoneCountryCodes.map(c => c.code).join(',') || "+30";

      const submissionData = {
        from_country: storedData.submissionData?.from_country || "",
        to_country: storedData.submissionData?.to_country || "",
        start_date: storedData.submissionData?.start_date || "",
        end_date: storedData.submissionData?.end_date || "",
        insured_type: storedData.submissionData?.insured_type || "",
        persons: storedData.submissionData?.persons?.map((person, index) => ({
          date_birth: person.date_birth,
          fullName: userDetails?.step4?.persons?.[index]?.name || "",
          identification: userDetails?.step4?.persons?.[index]?.identification || ""
        })) || [],
        insured_identification: formData.identification,
        holder_identification: formData.identification,
        holder_first_name: formData.name,
        holder_last_name: formData.surname,
        holder_email: formData.email,
        holder_phone_number: formData.phoneNumber,
        holder_phone_number_ext: phoneCountryCode,
        holder_mobile_number: formData.mobileNumber,
        holder_mobile_number_ext: mobileCountryCode,
        holder_address: formData.address,
        plan_id: selectedQuote?.id || 0,
        plan_duration: selectedQuote?.duration || 1
      };

      const response = await fetch(`${API_BASE_URL}/user/travelInsurance/acceptQuote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept-Language': i18n.language
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit travel insurance');
      }

      const result = await response.json();

      if (result.success && result.formUrl) {
        window.open(result.formUrl, '_self');
        onClose();
      } else {
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      console.error('Travel form submission error:', error);
      setError('Συνέβη κάποιο σφάλμα κατά την αποστολή της φόρμας. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name &&
    formData.surname &&
    formData.identification &&
    formData.email &&
    formData.mobileCountryCodes.length > 0 &&
    formData.mobileNumber &&
    formData.phoneCountryCodes.length > 0 &&
    formData.phoneNumber &&
    formData.address;

  if (!isOpen) return null;

  return (
    <div className="Inter_font fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
      <div className="relative bg-[#FFF6F3] rounded-[30px] shadow-lg w-full max-w-[560px] md:max-w-none mx-5 md:w-[800px] text-center px-5">
        <button onClick={onClose} className="absolute top-7 right-7">
          <iconsUtil.CloseFormIcon />
        </button>

        <header>
          <h1 className="mt-9 text-2xl font-medium text-primaryBgColor">{t("travel_form.step1.header")}</h1>
          <h2 className="mt-1 max-w-[422px] font-semibold text-primaryBgColor mx-auto">{t("travel_form.step1.subheader")}</h2>
        </header>
        <hr className="border border-[#FACABC] mx-auto my-3 w-2/3" />

        <h3 className="my-5 font-semibold text-secondaryColor">{t("travel_form.step1.progress.personal_details")}</h3>

        {error && (
          <div className="w-full p-4 mb-4 text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full p-4 mb-4 text-green-600 bg-green-100 rounded-lg">
            Η φόρμα στάλθηκε επιτυχώς!
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            placeholder={t("travel_form.step1.placeholders.name")}
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto outline-none"
          />
          <input
            type="text"
            name="surname"
            placeholder={t("travel_form.step1.placeholders.surname")}
            value={formData.surname}
            onChange={handleChange}
            required
            className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
          />
          <input
            type="text"
            name="identification"
            placeholder="Identification Number"
            value={formData.identification}
            onChange={handleChange}
            required
            className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
          />

          {/* Mobile Country Code + Mobile Number */}
          <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
            <MultiCountrySelect
              placeholder="Select Country"
              options={COUNTRY_DATA.map(c => c.name)}
              selectedCountries={formData.mobileCountryCodes.map(c => c.name)}
              onAddCountry={(name) => {
                const country = COUNTRY_DATA.find(c => c.name === name);
                if (country) handleMobileCountryAdd(country);
              }}
              onRemoveCountry={(index) => handleMobileCountryRemove(index)}
              isInvalid={formData.mobileCountryCodes.length === 0}
            />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
            />
          </div>

          {/* Phone Country Code + Phone Number */}
          <div className="flex items-center justify-center gap-3 w-full sm:w-[476.442px] mx-auto">
            <MultiCountrySelect
              placeholder="Select Country"
              options={COUNTRY_DATA.map(c => c.name)}
              selectedCountries={formData.phoneCountryCodes.map(c => c.name)}
              onAddCountry={(name) => {
                const country = COUNTRY_DATA.find(c => c.name === name);
                if (country) handlePhoneCountryAdd(country);
              }}
              onRemoveCountry={(index) => handlePhoneCountryRemove(index)}
              isInvalid={formData.phoneCountryCodes.length === 0}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full h-[50px] px-5 border border-[#C3C3C3] outline-none rounded-[10px]"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder={t("travel_form.step1.placeholders.email")}
            value={formData.email}
            onChange={handleChange}
            required
            className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
          />
          <input
            type="text"
            name="address"
            placeholder={t("travel_form.step1.placeholders.address")}
            value={formData.address}
            onChange={handleChange}
            required
            className="sm:max-w-[476.442px] h-[50px] px-5 border border-[#C3C3C3] rounded-[10px] mx-auto w-full outline-none"
          />
        </form>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className={`w-full mx-auto max-w-[540px] h-[50px] text-white font-bold text-xl py-2 px-4 rounded-[30px] m-6 ${
            isFormValid && !isLoading ? "bg-orange-500" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isLoading ? <LoadingSpinner /> : t("travel_form.step1.next_button")}
        </button>
      </div>
    </div>
  );
};

const MultiCountrySelect = ({ placeholder, options, selectedCountries = [], onAddCountry, onRemoveCountry, isInvalid }) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const safeSelected = Array.isArray(selectedCountries) ? selectedCountries : [];
  const availableOptions = COUNTRY_DATA.filter(
    c => !safeSelected.includes(c.name) && c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAdd = (country) => {
    onAddCountry(country);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-[90px]">
      <div
        className={`flex flex-wrap items-center gap-1 w-full min-h-[50px] px-2 py-2 border rounded-[10px] cursor-pointer
          ${isInvalid ? "border-red-500" : "border-[#C3C3C3]"}`}
        onClick={() => setIsOpen(true)}
      >
        {formData.mobileCountryCodes.map((country, i) => (
          <span key={i} className="flex items-center bg-gray-200 text-black rounded-full px-2 py-1 text-xs font-medium">
            {country.flag} {country.code}
            <button
              type="button"
              className="ml-1 text-gray-600 hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCountry(i);
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={formData.mobileCountryCodes.length === 0 ? placeholder : ""}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-black text-xs"
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>
      {isOpen && availableOptions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-[10px] shadow-lg mt-1">
          {availableOptions.map((country, i) => (
            <li
              key={i}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-black flex items-center gap-2"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAdd(country);
              }}
            >
              <span>{country.flag}</span>
              <span className="font-medium">{country.name}</span>
              <span className="text-gray-500 text-xs">{country.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

TravelForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedQuote: PropTypes.object,
  userDetails: PropTypes.object,
};