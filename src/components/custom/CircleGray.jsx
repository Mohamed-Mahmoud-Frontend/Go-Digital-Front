import PropTypes from "prop-types"

export const CircleGray = ({ children, circleColor = "white", textColor = "primaryColor", icon }) => {
    return (
        <span className="flex flex-col items-center tiny:gap-3 sm:gap-9">
            {/* Circle */}
            <span className={`m-1 w-12 h-12 tiny:w-20 tiny:h-20 sm:w-[100px] sm:h-[100px] rounded-full bg-${circleColor}`}>
                <img src={icon} alt="Icon" className="w-full h-full p-2" />
            </span>
            {/* title */}
            <h3 data-aos="zoom-in" className={`text-xs tiny:text-xs sm:text-xl sm:leading-[24.2px] text-center font-bold text-${textColor} w-[250px]`}>{children}</h3>
        </span>
    )
}

CircleGray.propTypes = {
    children: PropTypes.node.isRequired,
    circleColor: PropTypes.string,
    textColor: PropTypes.string,
    icon: PropTypes.string.isRequired,
}