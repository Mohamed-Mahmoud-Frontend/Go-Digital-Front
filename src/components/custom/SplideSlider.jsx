import PropTypes from "prop-types";
import { SplideSlide } from "@splidejs/react-splide";
// Custom styles for pagination ( Dots )
import "@/styles/slider.css"

// For Each image in Slider and titles on image 
export const SplideSlider = ({ children, image }) => {
    return (
        <SplideSlide>
            <div
                className="relative rounded-3xl sm:rounded-[32px] w-96 h-96 sm:w-[510px] sm:h-[500px] overflow-hidden shadow-lg m-3 mb-12 lg:mb-3"
                style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
            >
                {/* image */}
                <img
                    className="rounded-3xl sm:rounded-[32px] w-96 h-96 sm:w-[510px] sm:h-[500px] object-cover"
                    src={image}
                    alt="About Image"
                />
                {/* gradient white color */}
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent rounded-3xl sm:rounded-[32px]">
                    <span className="absolute flex flex-col gap-3 bottom-4 left-4 text-black">
                        {children}
                    </span>
                </div>
            </div>
        </SplideSlide>
    )
}

SplideSlider.propTypes = {
    children: PropTypes.node.isRequired,
    image: PropTypes.string.isRequired,
}