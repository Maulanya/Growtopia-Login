/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/html/**/*.html"],
  theme: {
    extend: {
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
