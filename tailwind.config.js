/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/html/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        GeorticBold: "Geortic-Bold, sans-serif",
      },
      screens: {
        portrait: {
          raw: "(orientation: portrait)",
        },
        landscape: {
          raw: "(orientation: landscape)",
        },
      },
    },
  },
  plugins: [],
};
