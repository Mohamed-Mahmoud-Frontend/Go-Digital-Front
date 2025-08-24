import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// Splide Library
import { Splide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { SplideSlider } from "../../components";

// For All Slides
export const ImageSlider = ({ slides, direction = "ltr" }) => {
    const sliderClass = direction === "rtl" ? "slider_container rtl" : "slider_container ltr";

    return (
        <Splide className={sliderClass}
            options={{
                type: "loop", // Infinite Scroll
                rewind: true,
                drag: "free", // Free dragging images
                rewindByDrag: true,
                snap: true,
                arrows: false,
                direction: direction,
                fixedWidth: "33rem",
                width: "82%",
                height: "570px",
                pagination: true, // Use Dots to navigate between slides
                breakpoints: {
                    1024: {
                        width: "100%", // Full width for screens smaller than 1024px
                    },
                    640: {
                        fixedWidth: "25rem", // Adjust fixed width for screens smaller than 640px
                        height: "440px",
                    },
                },
            }}
        >
            {/* Dynamic Slider based in data come from api */}
            {slides.map((slide, index) => (
                <SplideSlider image={slide.imgSrc} key={index}>
                    <h3 data-aos="fade-right" className="text-lg font-bold max-w-[446px] text-[28px] text-left">{slide.title}</h3>
                    <p data-aos="fade-right" className="text-sm max-w-[446px] text-[22px] font-semibold leading-[26.63px] text-left">
                        {slide.subTitle}
                    </p>
                    <Link data-aos="fade-right" to={slide.readMoreUrl} className="text-secondaryColor underline text-left">
                        Read More
                    </Link>
                </SplideSlider>
            ))}
        </Splide>
    );
};

ImageSlider.propTypes = {
    slides: PropTypes.array.isRequired,
    direction: PropTypes.string,
};