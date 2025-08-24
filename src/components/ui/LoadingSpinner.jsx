import PropTypes from 'prop-types';

export const LoadingSpinner = ({ size = "medium", color = "primary", className = "" }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        medium: "w-8 h-8",
        large: "w-12 h-12",
        xlarge: "w-16 h-16"
    };

    const colorClasses = {
        primary: "text-secondaryColor",
        white: "text-white",
        gray: "text-gray-500",
        orange: "text-orange-500"
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
                <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        </div>
    );
};

export const LoadingImage = () => {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="relative rounded-3xl sm:rounded-[32px] w-96 h-96 sm:w-[510px] sm:h-[500px] overflow-hidden shadow-lg m-3 mb-12 lg:mb-3"
                    style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
                >
                    {/* Skeleton image */}
                    <div className="rounded-3xl sm:rounded-[32px] w-96 h-96 sm:w-[510px] sm:h-[500px] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/10 to-transparent rounded-3xl sm:rounded-[32px]">
                            {/* Skeleton content */}
                            <div className="absolute flex flex-col gap-3 bottom-4 left-4 w-3/4">
                                {/* Skeleton title */}
                                <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-6 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                                {/* Skeleton subtitle */}
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    color: PropTypes.oneOf(['primary', 'white', 'gray', 'orange']),
    className: PropTypes.string
};