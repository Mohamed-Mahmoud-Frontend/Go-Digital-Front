import PropTypes from "prop-types";
// Icons
import * as Icons from "@/utils/icons.util"

export const SuccessRectangle = ({ children = "Add your text" }) => {
    return (
        <main
            className="flex flex-col justify-evenly gap-1 sm:gap-6 items-center w-40 h-32 vsm:w-44 vsm:h-36 sm:w-[278px] sm:h-[160px] bg-primaryColor sm:p-[26px] rounded-[20px]"
            style={{ boxShadow: " 0px 2px 4px 0px #00000026 inset" }}
        >
            <div><Icons.SuccessIcon /></div>
            <h3 data-aos="zoom-in" className="text-sm vsm:text-base sm:text-lg font-semibold sm:leading-[24.59px] text-center">{children}</h3>
        </main>
    )
}

SuccessRectangle.propTypes = {
    children: PropTypes.string.isRequired,
};