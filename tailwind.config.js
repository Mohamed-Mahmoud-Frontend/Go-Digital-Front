/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryColor: "#FFFFFF",
        secondaryColor: "#F15D2A",
        primaryBgColor: "#333132",
        secondaryBgColor: "#F1EEEC",
        hoverColor: "",
      },
      screens: {
        '2xl': '1536px',
        xl: "1280px",
        lg: "1024px",
        md: "868px",
        sm: "640px",
        vsm: "460px",
        tiny: "370px",
      },
    },
  },
  plugins: [],
}