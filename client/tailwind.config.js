/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#080810",
          800: "#0F0F1A",
          700: "#14141F",
          600: "#1A1A28",
        },
        text: {
          primary: "#F0F0FF",
          muted: "#9090B8",
          dim: "#505075",
        },
      },
      keyframes: {
        slideUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        pop: { "0%": { transform: "scale(0.85)", opacity: "0.6" }, "60%": { transform: "scale(1.08)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        gradient: { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        pulseDot: { "0%,100%": { transform: "scale(1)", opacity: "1" }, "50%": { transform: "scale(1.4)", opacity: "0.6" } },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease both",
        float: "float 4s ease-in-out infinite",
        "gradient-x": "gradient 5s linear infinite",
        "pulse-dot": "pulseDot 2s infinite",
      },
    },
  },
  plugins: [],
};