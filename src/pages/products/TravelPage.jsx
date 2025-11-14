import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  Header,
  HeroProductsSection,
  CircleDashed,
  CoveragesSection,
  CircleGray,
  ArticleSlider,
  SuccessRectangle,
  Contact,
  GetQuote,
  GetQuoteSideBT,
} from "@/components";
import { useTranslation } from "react-i18next";
import * as Icons from "@/utils/icons.util";
import Icon1 from "@/assets/icons/forCircleDashed/travel.png";
import Icon2 from "@/assets/icons/forCircleDashed/packages.png";
import Icon3 from "@/assets/icons/forCircleDashed/online.png";
import Icon4 from "@/assets/icons/forCircleDashed/contract.png";
import Icon11 from "@/assets/icons/forWhyDigital/quick.png";
import Icon22 from "@/assets/icons/forWhyDigital/contact.png";
import Icon33 from "@/assets/icons/forWhyDigital/hours.png";
import Icon44 from "@/assets/icons/forWhyDigital/checklist.png";
import Icon111 from "@/assets/icons/forWhyDigital/quick.png";
import Icon222 from "@/assets/icons/forWhyDigital/contact.png";
import Icon333 from "@/assets/icons/forWhyDigital/hours.png";
import Icon444 from "@/assets/icons/forWhyDigital/checklist.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TravelPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [destinationOptions, setDestinationOptions] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/user/travelInsurance/getArguments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch travel insurance data");
        }

        const data = await response.json();
        setDestinationOptions(data.countries || []);
      } catch (error) {
        console.error("Error fetching travel insurance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, [i18n.language]);

  useEffect(() => {
    const savedValue = localStorage.getItem("travel_destination_prefill");
    if (savedValue) {
      setSelectedDestination(savedValue);
    }
  }, []);

  const formattedOptions = useMemo(() => {
    return destinationOptions.map((country) => ({
      value: country.id,
      label: country.name,
    }));
  }, [destinationOptions]);

  const selectedOption = useMemo(
    () =>
      formattedOptions.find((opt) => opt.value === selectedDestination) || null,
    [formattedOptions, selectedDestination]
  );

  const handleSelectChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setSelectedDestination(value);
    localStorage.setItem("travel_destination_prefill", value);
  };

  const handleGetQuoteClick = () => {
    navigate("/get-a-quote-travel");
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      height: "100%",
      minHeight: "56px",
      backgroundColor: "white",
      border: state.isFocused
        ? "2px solid #F97316"
        : "1px solid #D1D5DB",
      borderRadius: "10px",
      fontWeight: "bold",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "&:hover": {
        borderColor: state.isFocused ? "#F97316" : "#9CA3AF",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: "100%",
      padding: "2px 16px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#7D7D7D",
      fontWeight: "bold",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1F2937",
      fontWeight: "bold",
    }),
    dropdownIndicator: () => ({
      display: "none",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "10px",
      marginTop: "8px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: 20,
    }),
    option: (base, state) => ({
      ...base,
      padding: "12px 16px",
      fontWeight: "500",
      backgroundColor: state.isSelected
        ? "#FDBA74"
        : state.isFocused
        ? "#FFF7ED"
        : "white",
      color: "#1F2937",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#FDBA74",
      },
    }),
  };

  const rawSlidesData = t("travel_page.coverages_section.slides", {
    returnObjects: true,
  });
  const services = t("travel_page.services_section.services", {
    returnObjects: true,
  });
  const steps = t("travel_page.how_works_section.steps", {
    returnObjects: true,
  });

  const slidesData = rawSlidesData.map((slide, index) => {
    const icons = [Icon111, Icon222, Icon333, Icon444];
    return {
      ...slide,
      icon: icons[index],
    };
  });

  return (
    <>
      <Header />

      <HeroProductsSection
        headTitle={t("travel_page.hero_section.headTitle")}
        Subtitle={t("travel_page.hero_section.subtitle")}
        url="/get-a-quote-travel"
      >
        <span>
          <h3 data-aos="fade-right" className="text-sm vsm:text-base lg:text-[22px] font-bold">
            {t("travel_page.hero_section.destination_title")}
          </h3>
          <h4 data-aos="fade-right" className="text-sm vsm:text-base lg:text-[22px]">
            {t("travel_page.hero_section.destination_subtitle")}
          </h4>
        </span>
        <div data-aos="fade-right" className="relative w-full max-w-[450px] xl:max-w-[680px]">
          {isLoading ? (
            <div className="h-14 md:h-[74px] bg-gray-200 border border-gray-300 rounded-[10px] animate-pulse" />
          ) : (
            <Select
              value={selectedOption}
              onChange={handleSelectChange}
              options={formattedOptions}
              styles={customSelectStyles}
              placeholder={t(
                "travel_page.hero_section.select_placeholder"
              )}
              isSearchable={true}
              className="w-full appearance-none h-14 md:h-[74px] text-sm vsm:text-base text-left"
              classNamePrefix="react-select"
            />
          )}
          <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 z-10">
            <Icons.SelectArrowIcon />
          </span>
        </div>
      </HeroProductsSection>

      <section className="mb-0 sm:mb-24">
        <h1 data-aos="zoom-in" className="text-center text-2xl lg:text-[40px] font-bold my-10 sm:my-12">
          {t("travel_page.how_works_section.title")}
        </h1>
        <div data-aos="fade-right" className="flex flex-col sm:flex-row items-start vsm:items-stretch max-w-[1202px] mx-20 vsm:mx-10 xl:m-auto">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <CircleDashed title={step}>
                {index === 0 && (
                  <img src={Icon1} alt="Icon1" className="w-full h-full p-5" />
                )}
                {index === 1 && (
                  <img src={Icon2} alt="Icon2" className="w-full h-full p-5" />
                )}
                {index === 2 && (
                  <img src={Icon3} alt="Icon3" className="w-full h-full p-5" />
                )}
                {index === 3 && (
                  <img src={Icon4} alt="Icon4" className="w-full h-full p-5" />
                )}
              </CircleDashed>
              {index < steps.length - 1 && (
                <span className="w-0 h-10 mx-14 vsm:m-auto sm:w-full sm:h-0 border-[2px] border-secondaryColor border-dashed"></span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
      <CoveragesSection
        title={t("travel_page.coverages_section.title")}
        description={t("travel_page.coverages_section.description")}
        data={slidesData}
      />
      <section className="bg-secondaryBgColor rounded-3xl lg:rounded-[58px] text-center mt-10 mx-7 lg:mx-20 p-5 vsm:p-8 lg:p-12">
        <h1 data-aos="zoom-in" className="font-extrabold text-3xl sm:text-[40px]">
          {t("travel_page.services_section.title")}
        </h1>
        <h2 data-aos="zoom-in" className="max-w-[911px] mt-3 font-medium text-xs tiny:text-lg sm:text-[22px] sm:leading-[30.05px] mx-auto">
          {t("travel_page.services_section.description")}
        </h2>
        <div data-aos="fade-right" className="flex flex-wrap gap-2 vsm:gap-5 items-start justify-evenly mt-10 md:mt-[91px]">
          {services.map((service, index) => {
            const icons = [Icon11, Icon22, Icon33, Icon44];
            return (
              <CircleGray
                key={index}
                circleColor="secondaryColor"
                textColor="primaryBgColor"
                icon={icons[index]}
              >
                {service.title}
                <p className="font-normal mt-2 vsm:mt-5 text-center">
                  {service.description}
                </p>
              </CircleGray>
            );
          })}
        </div>
        <button
          onClick={handleGetQuoteClick}
          className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-base sm:text-lg font-bold mt-8 sm:mt-16 hover:bg-secondaryColor hover:text-primaryColor transition_all active:scale-110"
          style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
          data-aos="zoom-in"
        >
          {t("travel_page.get_quote_button")}
        </button>
      </section>
      <section className="bg-secondaryColor mx-7 lg:mx-20 rounded-b-3xl md:rounded-b-[58px] rounded-t-[30px] md:rounded-t-[70px] my-5 md:my-20">
        <div
          className="flex flex-col justify-center items-center bg-secondaryBgColor text-center rounded-3xl md:rounded-[58px] py-12 h-[200px]"
          style={{ boxShadow: "0px 10px 10px 0px #8E240026" }}
        >
          <h1 data-aos="zoom-in" className="max-w-[683px] text-3xl sm:text-[40px] font-bold leading-[54.64px]">
            {t("travel_page.why_section.title")}
          </h1>
          <h2 data-aos="zoom-in" className="mt-5 mb-6 mx-2 sm:text-[22px] sm:leading-[30.05px]">
            {t("travel_page.why_section.subtitle")}
          </h2>
        </div>
        <div data-aos="fade-right" className="flex flex-wrap gap-3 vsm:gap-5 justify-center xl:justify-evenly items-center rounded-3xl md:rounded-b-[58px] text-center py-10 sm:py-16 mx-1 vsm:mx-4 xl:mx-20">
          {t("travel_page.why_section.features", { returnObjects: true }).map(
            (feature, index) => (
              <SuccessRectangle key={index}>{feature}</SuccessRectangle>
            )
          )}
        </div>
      </section>
      <ArticleSlider
        subTitle={t("travel_page.article_slider.subTitle")}
        url="/blog/travel"
        categoryId={1}
      />
      <Contact />
      <GetQuote url="/get-a-quote-travel" />
      <GetQuoteSideBT url="/get-a-quote-travel" />
    </>
  );
};