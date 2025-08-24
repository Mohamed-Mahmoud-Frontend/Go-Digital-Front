import Router from "./router"
// AOS Library
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
  duration: 600, // values from 0 to 3000, with step 50ms
  easing: 'ease-out', // easing for AOS animations
  once: true, // whether animation should happen only once - while scrolling down
});

function App() {
  return <Router />
}

export default App