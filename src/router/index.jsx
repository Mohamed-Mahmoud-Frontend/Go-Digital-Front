import { createBrowserRouter, RouterProvider } from "react-router-dom";
// Pages
import {
    HomePage, ForeignersPage, GuaranteesPage, IntermediariesPage, LiabilityPage, TravelPage,
    BlogPage, AllDetail, TravelDetail, GuaranteesDetail, LiabilityDetail, ForeignersDetail, IntermediariesDetail,
    TravelQuote, GuaranteeQuote, LiabilityQuote, IntermediariesQuote, ForeignersQuote, Profile, ProfileContracts, ContactPage,
     PaymentFailed
} from "@/pages";
// Components
import { TravelProceed, ForeignersProceed, IntermediariesProceed, LiabilityProceed, GuaranteeProceed, ActiveContract } from "@/components";
import { ArticlePage, NotFoundPage } from "@/pages";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
const router = createBrowserRouter([

    {
        path: "/",
        element: <HomePage />,
    },

    // Product Routes
    {
        path: "/products/travel",
        element: <TravelPage />,
    },
    {
        path: "/products/guarantees",
        element: <GuaranteesPage />,
    },
    {
        path: "/products/road-carrier-professional-liability",
        element: <LiabilityPage />,
    },
    {
        path: "/products/medical-insurance-foreigners",
        element: <ForeignersPage />,
    },
    {
        path: "/products/professional-liability-insurance-intermediaries",
        element: <IntermediariesPage />,
    },

    // Blog Routes
    {
        path: "/blog",
        element: <BlogPage />,
    },
    {
        path: "/blog/travel",
        element: <TravelDetail />,
    },
    {
        path: "/blog/guarantees",
        element: <GuaranteesDetail />,
    },
    {
        path: "/blog/road-carrier-professional-liability",
        element: <LiabilityDetail />,
    },
    {
        path: "/blog/medical-insurance-foreigners",
        element: <ForeignersDetail />,
    },
    {
        path: "/blog/professional-liability-insurance-intermediaries",
        element: <IntermediariesDetail />,
    },
    {
        path: "/blog/all",
        element: <AllDetail />,
    },

    // Article Detail Route
    {
        path: "/articles/:id",
        element: <ArticlePage />,
    },

    // Contact Routes
    {
        path: "/contact",
        element: <ContactPage />,
    },

    // Quote Routes
    {
        path: "/get-a-quote-travel",
        element: <TravelQuote />,
    },
    {
        path: "/get-a-quote-guarantee",
        element: <GuaranteeQuote />,
    },
    {
        path: "/get-a-quote-liability",
        element: <LiabilityQuote />,
    },
    {
        path: "/get-a-quote-intermediaries",
        element: <IntermediariesQuote />,
    },
    {
        path: "/get-a-quote-foreigners",
        element: <ForeignersQuote />,
    },
    {
        path: "/get-a-quote-travel/proceed",
        element: <TravelProceed />,
    },
    {
        path: "/get-a-quote-foreigners/proceed",
        element: <ForeignersProceed />,
    },
    {
        path: "/get-a-quote-intermediaries/proceed",
        element: <IntermediariesProceed />,
    },
    {
        path: "/get-a-quote-liability/proceed",
        element: <LiabilityProceed />,
    },
    {
        path: "/get-a-quote-guarantee/proceed",
        element: <GuaranteeProceed />,
    },

    // Profile Routes
    {
        path: "/profile",
        element: <Profile />,
    },
    {
        path: "/profile-contract",
        element: <ProfileContracts />,
    },
    {
        path: "/profile-contract/details",
        element: <ActiveContract />,
    },

    // Payment Result Routes
    {
        path: "/success",
        element: <PaymentSuccess/>,
    },
    {
        path: "/fail",
        element: <PaymentFailed />,
    },

    // Route for not existing urls
    {
        path: "/*",
        element: <NotFoundPage />,
    },
]);

const Router = () => {
    return <RouterProvider router={router} />;
};

export default Router;