import { Fragment, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../../components";
import { PaymentFailedIcon } from "../../utils/icons.util";

export const PaymentFailed = () => {
    const navigate = useNavigate();

    const handleLogin = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    const handleGoBack = useCallback(() => {
        navigate(-1); // Go back to the previous page (payment page)
    }, [navigate]);

    return (
        <Fragment>
            <Header />

            <main className="flex max-md:flex-col gap-10 justify-center md:items-center mx-5 sm:mx-10 my-10 md:my-20">
                <section className="flex flex-col gap-4 md:max-w-[422px]">
                    <PaymentFailedIcon />
                    <h1 className="Inter_font text-xl md:text-2xl font-medium text-secondaryColor">
                        Η πληρωμή απέτυχε!
                    </h1>
                    <p className="font-semibold">
                        Κάποιο από τα στοιχεία σου ήταν λάθος ή η σύνδεσή σου δεν ήταν καλή...Προσπάθησε ξανά!
                        <br /> <br />
                        Ευχαριστούμε που έχεις επιλέξει την GoDigital για την ασφάλιση σου!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-5">
                        <button
                            onClick={handleLogin}
                            className="w-52 h-12 bg-secondaryColor font-semibold text-lg text-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-secondaryColor/80 transition-all duration-300"
                        >
                            Συνδέσου Τώρα
                        </button>
                        <button
                            onClick={handleGoBack}
                            className="w-52 h-12 bg-secondaryColor font-semibold text-lg text-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-secondaryColor/80 transition-all duration-300"
                        >
                            Πίσω στη Πληρωμή
                        </button>
                    </div>
                </section>

                <section className="flex flex-col gap-1 md:max-w-[600px] bg-red-200/40 rounded-3xl px-7 md:px-11 py-7 md:py-12 md:text-sm Inter_font">
                    <p className="mb-6">
                        Κάτι πήγε λάθος...
                        <br />
                        Δοκίμασε να εισάγεις ξανά τα στοιχεία σου ή συνδέσου στον λογαριασμό σου!
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
                                στοιχεία σου.
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

export default PaymentFailed;