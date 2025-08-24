import { Link } from "react-router-dom";
import { Header } from "@/components";

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-secondaryColor mb-4">404</h1>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-md">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/"
                            className="inline-block bg-secondaryColor text-white px-6 py-3 rounded-lg font-medium hover:bg-secondaryColor/90 transition-colors"
                        >
                            Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-block border border-secondaryColor text-secondaryColor px-6 py-3 rounded-lg font-medium hover:bg-secondaryColor hover:text-white transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};