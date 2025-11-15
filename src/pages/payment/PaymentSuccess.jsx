import { Fragment, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Header } from "../../components";
import { PaymentSuccessIcon } from "../../utils/icons.util";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { contract, product } = useMemo(() => {
        const contractData =
            location.state?.contract ||
            JSON.parse(localStorage.getItem("lastContract") || "{}");
        
        const productData =
            contractData.product || localStorage.getItem("lastProduct") || "travel";

        return { contract: contractData, product: productData };
    }, [location.state]);

    const handleRenewContract = useCallback(() => {
        let newStartDate = "";
        if (contract.end_date || contract.endDate) {
            const end = new Date(contract.end_date || contract.endDate);
            end.setDate(end.getDate() + 1);
            newStartDate = end.toISOString().split("T")[0];
        }

        const renewData = {
            product,
            contractData: {
                from_country: contract.from_country || contract.departure_country || "",
                from_country_id:
                    contract.from_country_id || contract.departure_country_id || "",
                to_country_ids:
                    contract.to_country_ids || contract.destination_country_ids || [],
                to_country:
                    contract.to_countries || contract.destination_countries || [],
                start_date: newStartDate,
                end_date: contract.end_date || contract.endDate || "",
                insured_type_name:
                    contract.insured_type_name || contract.insured_type || "",
                insured_type_id: contract.insured_type_id || "",
                person_count:
                    contract.person_count || contract.persons?.length?.toString() || "",
                persons: (contract.persons || []).map((p) => ({
                    full_name: p.full_name || p.name || "",
                    date_birth: p.date_birth || p.dateBirth || "",
                    identification:
                        p.identification || p.id_number || p.passport || "",
                })),
            },
        };

        localStorage.setItem("renewContractData", JSON.stringify(renewData));

        const routes = {
            travel: "/get-a-quote-travel",
            foreigners: "/get-a-quote-foreigners",
            liability: "/get-a-quote-liability",
        };

        navigate(routes[product] || "/get-a-quote-travel");
    }, [contract, product, navigate]);

    useEffect(() => {
        if (contract && Object.keys(contract).length > 0) {
            localStorage.setItem("lastContract", JSON.stringify(contract));
            localStorage.setItem("lastProduct", product);
        }
    }, [contract, product]);

    return (
        <Fragment>
            <Header />

            <main className="flex max-md:flex-col gap-10 justify-center md:items-center mx-5 sm:mx-10 my-10 md:my-20">
                <section className="flex flex-col gap-4 md:max-w-[422px]">
                    <PaymentSuccessIcon />
                    <h1 className="Inter_font text-xl md:text-2xl font-medium text-secondaryColor">
                        Όλα έτοιμα! <br /> Η Ασφάλεια σου έχει εκδοθεί!
                    </h1>
                    <p className="font-semibold">
                        Ευχαριστούμε που έχεις επιλέξει την GoDigital για την ασφάλιση σου!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-5">
                        <button
                            onClick={() => navigate("/login")}
                            className="w-52 h-12 bg-secondaryColor font-semibold text-lg text-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-secondaryColor/80 transition-all duration-300"
                        >
                            Συνδέσου Τώρα
                        </button>

                        <button
                            onClick={handleRenewContract}
                            className="w-fit px-3 h-12 bg-green-600 text-nowrap font-semibold text-lg text-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Ανανέωση Σύμβασης
                        </button>
                    </div>

                    {contract.contract_number && (
                        <div className="mt-6 p-5 bg-orange-50 border border-orange-300 rounded-xl text-center">
                            <p className="text-gray-700 font-medium">Αριθμός Συμβολαίου</p>
                            <p className="text-2xl font-bold text-orange-600 tracking-wider">
                                {contract.contract_number}
                            </p>
                        </div>
                    )}
                </section>

                <section className="flex flex-col gap-1 md:max-w-[600px] bg-red-200/40 rounded-3xl px-7 md:px-11 py-7 md:py-12 md:text-sm Inter_font">
                    <p className="mb-6">
                        Όλα τα απαραίτητα έγγραφα έχουν ήδη αποσταλεί στο email δήλωσες και
                        μπορείς να αποκτήσεις πρόσβαση σε αυτά οποιαδήποτε στιγμή με το να
                        συνδεθείτε στον λογαριασμό σου.
                    </p>

                    <div>
                        <h3 className="text-secondaryColor font-semibold">
                            Πώς να συνδεθείς στον λογαριασμό σου;
                        </h3>
                        <ol className="list-decimal list-outside ps-5">
                            <li>
                                Πήγαινε στη{" "}
                                <Link
                                    to="/login"
                                    className="text-orange-600 underline font-semibold"
                                >
                                    σελίδα σύνδεσης
                                </Link>
                                .
                            </li>
                            <li>
                                Πληκτρολόγησε το email που δηλώσατε κατά την αγορά του
                                συμβολαίου.
                            </li>
                            <li>Θα λάβεις έναν κωδικό OTP στο ίδιο email.</li>
                            <li>
                                Πληκτρολόγησε τον κωδικό για να αποκτήσεις πρόσβαση στον
                                λογαριασμό σου.
                            </li>
                        </ol>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-secondaryColor font-semibold">
                            Μέσα από τον λογαριασμό σου μπορείς να βρεις:
                        </h3>
                        <ul className="list-disc list-outside ps-5">
                            <li>Όλα τα ασφαλιστικά σου συμβόλαια</li>
                            <li>
                                Τη δυνατότητα να κατεβάσεις τα έγγραφα στη συσκευή της επιλογής
                                σου.
                            </li>
                            <li>
                                Τη δυνατότητα να ζητήσεις αλλαγές ή να επικαιροποιήσεις τα
                                στοχεία σου.
                            </li>
                        </ul>
                    </div>

                    <p className="mt-5">
                        Αν χρειάζεσαι επιπλέον βοήθεια ή έχεις ερωτήσεις, είμαστε πάντα στη
                        διάθεσή σου .. ψηφιακά και απλά!
                    </p>
                </section>
            </main>
        </Fragment>
    );
};

export default PaymentSuccess;