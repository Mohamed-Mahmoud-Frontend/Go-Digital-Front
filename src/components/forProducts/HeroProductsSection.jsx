import { Link } from "react-router-dom"
import PropTypes from "prop-types";
// Icons
import * as Icons from "@/utils/icons.util"

export const HeroProductsSection = ({ headTitle, Subtitle, url, children }) => {
    return (
        <main
            className="flex flex-col-reverse md:flex-row justify-center md:justify-evenly items-center bg-secondaryColor text-center md:text-left rounded-3xl p-5 mx-6 lg:mx-20 md:rounded-[58px] text-primaryColor py-6 md:py-12 xl:h-[590px]"
            style={{ boxShadow: "0 10px 10px rgba(0, 0, 0, 0.1)" }}
        >

            <section className="flex flex-col justify-center items-center md:items-start md:justify-around h-full">
                {/* Head Titles */}
                <span>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold max-w-[774px]">{headTitle}</h1>
                    <h2 className="text-sm sm:text-xl lg:text-2xl 2xl:text-3xl 2xl:leading-[40.98px] max-w-[774px] mt-5">{Subtitle}</h2>
                </span>
                {/* Quote ,select input section */}
                <aside className="flex flex-col justify-center items-center md:justify-stretch md:items-start gap-5 mt-8 xl:mt-0">
                    {/* Select Input and his titles */}
                    {children}
                    {/* Quote Button */}
                    <Link to={url}>
                        <button
                            data-aos="fade-right"
                            className="w-28 h-12 sm:w-[213px] sm:h-[65px] rounded-[10px] bg-primaryBgColor text-primaryColor text-xs tiny:text-sm vsm:text-base sm:text-lg font-bold hover:bg-primaryColor hover:text-secondaryColor transition_all active:scale-110"
                            style={{ boxShadow: "0px 4px 4px 0px #00000026" }}
                        >
                            Get Quote
                        </button>
                    </Link>
                </aside>
            </section>

            {/* AirPlane Icon */}
            <span data-aos="fade-left" className="p-5">
                <Icons.AirPlaneIcon />
            </span>

        </main>
    )
}

HeroProductsSection.propTypes = {
    headTitle: PropTypes.string.isRequired,
    Subtitle: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}