/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6F1",
        ink: "#1C1008",
        inkdark: "#3A2415",
        "accent-brand": "#733307",
        "accent-hover": "#572604",
        "accent-soft": "#F6EBDF",
        "accent-light": "#D9A066",
      },
      fontFamily: {
        body: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Lexend Deca", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: { marquee: "marquee 38s linear infinite" },
    },
  },
  plugins: [],
};
