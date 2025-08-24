import { useState } from "react";
import PropTypes from "prop-types";
// Splide Library
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

export const CoveragesSection = ({ title, description, data }) => {
    const [toggles, setToggles] = useState({}); // state to show and hide description

    // reverse state when clicked 
    const handleToggle = (index) => {
        setToggles((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // handle mouse enter for larger screens
    const handleMouseEnter = (index) => {
        if (window.innerWidth > 868) {
            setToggles((prev) => ({
                ...prev,
                [index]: true,
            }));
        }
    };

    // handle mouse leave for larger screens
    const handleMouseLeave = (index) => {
        if (window.innerWidth > 868) {
            setToggles((prev) => ({
                ...prev,
                [index]: false,
            }));
        }
    };

    const slidesPerPage = data.length > 4 ? 4 : data.length; // Determine the number of slides per page based on data length
    const gapValue = data.length === 2 ? "-42%" : "0px"; // Set gap to -42% if there are only 2 slides

    return (
        <main className="flex flex-col justify-center items-center pt-16 w-full">
            <h1 data-aos="zoom-in" className="text-3xl md:text-4xl font-extrabold text-primaryBgColor text-center">
                {title}
            </h1>
            <h2 data-aos="zoom-in" className="sm:text-lg lg:text-[22px] font-medium text-primaryBgColor px-10 max-w-[911px] text-center my-6">
                {description}
            </h2>

            <section className="w-full">
                <Splide
                    options={{
                        rewind: true,
                        drag: true,
                        snap: true,
                        arrows: false,
                        pagination: true,
                        perPage: slidesPerPage,
                        height: "450px",
                        gap: gapValue, // Remove gaps between slides
                        breakpoints: {
                            1500: {
                                perPage: data.length == 2 ? 2 : 3,
                                gap: "0px"
                            },
                            1024: { perPage: 2 },
                            680: { perPage: 1, height: "430px", arrows: true },
                            460: { height: "380px" },
                        },
                    }}
                    className="w-full"
                >
                    {/* Show Each Slide in data */}
                    {data.map((slide, index) => {
                        return (
                            <SplideSlide key={index} className="flex justify-center w-full">
                                <div
                                    onClick={() => handleToggle(index)} // Toggle on click
                                    onMouseEnter={() => handleMouseEnter(index)} // Show on hover for large screens
                                    onMouseLeave={() => handleMouseLeave(index)} // Hide on hover out for large screens
                                    className={`relative flex justify-center w-80 h-72 vsm:w-[350px] mt-5 vsm:h-[340px] sm:w-[381px] sm:h-[373px] bg-primaryBgColor rounded-b-[22px] rounded-t-[20px] mx-2 z-50 ${slide.description ? "cursor-pointer" : ""}`} // Show cursor-pointer only if description exists
                                >
                                    <span className="mb-auto mt-7 sm:mt-10" data-aos="zoom-in">
                                        <img src={slide.icon} alt={slide.title} className="w-full h-full max-w-40 max-h-40" />
                                    </span>
                                    <span className="absolute bottom-0 right-0 w-full bg-secondaryBgColor py-8 vsm:py-10 rounded-[20px] text-center overflow-hidden">
                                        <h3
                                            data-aos="zoom-in"
                                            className="sm:text-[22px] font-bold"
                                        >
                                            {slide.title === "Θάνατος από Ατύχημα" ? (
                                                <>
                                                    Θάνατος <br /> από Ατύχημα
                                                </>
                                            ) : (
                                                slide.title
                                            )}
                                        </h3>

                                        {toggles[index] && (
                                            <h4 data-aos="zoom-in" className="text-sm sm:text-lg px-1">
                                                {slide.description}
                                            </h4>
                                        )}
                                    </span>
                                </div>
                            </SplideSlide>
                        )
                    })}
                </Splide>
            </section>
        </main>
    );
};

CoveragesSection.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
};