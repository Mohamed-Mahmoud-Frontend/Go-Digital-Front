import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const lang = localStorage.getItem("i18nextLng") || "en";
    config.headers["Accept-Language"] = lang;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "حدث خطأ غير متوقع. حاول مرة أخرى.";

    if (error.response) {
      const data = error.response.data;
      message = data?.message || data?.error || `خطأ ${error.response.status}`;
    } else if (error.request) {
      message = "لا يوجد استجابة من الخادم. تحقق من الاتصال.";
    } else {
      message = error.message;
    }

    console.error("API Error:", message, error);
    return Promise.reject(new Error(message));
  }
);

export default api;