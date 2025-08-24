import { Fragment } from "react"
import { Header } from "../../components"
import { PaymentFailedIcon } from "../../utils/icons.util"

export const PaymentFailed = () => {
    return (
        <Fragment>
            <Header />

            {/* Main Section */}
            <main className="flex max-md:flex-col gap-10 justify-center md:items-center mx-5 sm:mx-10 my-10 md:my-20">
                <section className="flex flex-col gap-4 md:max-w-[422px]">
                    <PaymentFailedIcon />
                    <h1 className="Inter_font text-xl md:text-2xl font-medium text-secondaryColor">Η πληρωμή απέτυχε!</h1>
                    <p className="font-semibold">
                        Κάποιο από τα στοιχεία σου ήταν λάθος ή η σύνδεσή σου δεν ήταν καλή...Προσπάθησε ξανά!
                        <br /> <br />
                        Ευχαριστούμε που έχεις επιλέξει την GoDigital για την ασφάλιση σου!
                    </p>
                    <span className="flex gap-2">
                        <button className="w-52 h-12 bg-secondaryColor font-semibold text-lg text-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-secondaryColor/80 transition-all duration-300 mt-5">Συνδέσου Τώρα</button>
                        <button className="w-52 h-12 bg-secondaryColor font-semibold text-lg text-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:bg-secondaryColor/80 transition-all duration-300 mt-5">Πίσω στη Πληρωμή</button>
                    </span>
                </section>

                <section className="flex flex-col gap-1 md:max-w-[600px] bg-red-200/40 rounded-3xl px-7 md:px-11 py-7 md:py-12 md:text-sm Inter_font">
                    <p className="mb-6">Κάτι πήγε λάθος...
                        <br />
                        Δοκίμασε να εισάγεις ξανά τα στοιχεία σου ή συνδέσου στον λογαριασμό σου!
                    </p>

                    <span>
                        <h3 className="text-secondaryColor font-semibold">Πώς να συνδεθείς στον λογαριασμό σου;</h3>
                        <ol className="list-decimal list-outside ps-5">
                            <li>Πήγαινε στη σελίδα σύνδεσης. (να έχει ενεργό link στο «σελίδα σύνδεσης»)</li>
                            <li>Πληκτρολόγησε το email που δηλώσατε κατά την αγορά του συμβολαίου.</li>
                            <li>Θα λάβεις έναν κωδικό OTP στο ίδιο email.</li>
                            <li>Πληκτρολόγησε τον κωδικό για να αποκτήσεις πρόσβαση στον λογαριασμό σου.</li>
                        </ol>
                    </span>
                    <span>
                        <h3 className="text-secondaryColor font-semibold">Μέσα από τον λογαριασμό σου μπορείς να βρεις:</h3>
                        <ul className="list-disc list-outside ps-5">
                            <li>Όλα τα ασφαλιστικά σου συμβόλαια</li>
                            <li>Τη δυνατότητα να κατεβάσεις τα έγγραφα στη συσκευή της επιλογής σου.</li>
                            <li>Τη δυνατότητα να ζητήσεις αλλαγές ή να επικαιροποιήσεις τα στοιχεία σου.</li>
                        </ul>
                    </span>
                    <p className="mt-5">Αν χρειάζεσαι επιπλέον βοήθεια ή έχεις ερωτήσεις, είμαστε πάντα στη διάθεσή σου .. ψηφιακά και απλά!</p>
                </section>
            </main>
        </Fragment>
    )
}