import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// Components
import { Header } from "@/components";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// Images
import Symbol from "@/assets/images/icon.png";
import { useTranslation } from "react-i18next";
// Utils
import { getToken, handleApiResponse } from "@/utils/token.util";
import { LoadingSpinner } from "../../components";

// Styles for all inputs
const styles = {
  inputStyle:
    "outline-none w-80 md:w-96 vsm:h-14 p-2 vsm:p-3 rounded-lg border border-primaryColor bg-transparent",
};

export const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Check screen size and redirect to profile-contract if xl or larger
  useEffect(() => {
    const checkScreenSize = () => {
      // xl breakpoint is 1280px
      if (window.innerWidth >= 1280) {
        navigate("/profile-contract", { replace: true });
      }
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/user/details`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();

          // Check if token is expired or invalid
          if (!handleApiResponse(response, data)) {
            // The ProtectedRoute will handle the redirect
            return;
          }

          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Συνέβη κάποιο σφάλμα κατά την φόρτωση των στοιχείων σας.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [i18n.language]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />

      <section
        className="flex flex-col justify-center items-center bg-primaryBgColor text-center m-6 lg:mx-20 rounded-3xl md:rounded-[58px] text-primaryColor py-6 md:py-12 xl:hidden"
        style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.2)" }}
      >
        {/* Hero Section Logo */}
        <img
          data-aos="fade-in"
          src={Symbol}
          alt="Go Digital Icon"
          className="w-[100px] md:w-[199px]"
        />
        {/* User Name */}
        <h1 className="max-w-[806px] mx-5 tiny:text-2xl vsm:text-4xl md:text-5xl font-semibold vsm:leading-[51.96px] md:leading-[81.96px]">
          {userData?.first_name} {userData?.last_name}
        </h1>

        {/* Inputs Fields */}
        <span className="flex flex-col gap-5 my-5">
          <input
            type="text"
            value={`${userData?.first_name || ""} ${userData?.last_name || ""}`}
            placeholder={t("profile_page.hero_section.name_placeholder")}
            className={styles.inputStyle}
            readOnly
          />
          <input
            type="email"
            value={userData?.email || ""}
            placeholder={t("profile_page.hero_section.email_placeholder")}
            className={styles.inputStyle}
            readOnly
          />
          <input
            type="text"
            value={userData?.mobile || ""}
            placeholder={t("profile_page.hero_section.phone_placeholder")}
            className={styles.inputStyle}
            readOnly
          />
          <input
            type="text"
            value={userData?.address || ""}
            placeholder={t("profile_page.hero_section.address_placeholder")}
            className={styles.inputStyle}
            readOnly
          />
        </span>

        {/* CONTRACTS Button */}
        <Link to="/profile-contract">
          <button
            className="w-36 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] hover:bg-primaryColor hover:text-secondaryColor text-xs tiny:text-base sm:text-lg font-bold mt-8 bg-secondaryColor transition_all active:scale-110"
            style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
          >
            {t("profile_page.contracts_button")}
          </button>
        </Link>
      </section>
    </ProtectedRoute>
  );
};
