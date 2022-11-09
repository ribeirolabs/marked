/** @type {import('tailwindcss').Config} */
const theme = require("daisyui/src/colors/themes")["[data-theme=emerald]"];

module.exports = {
  mode: "jit",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // fontFamily: {
    //   sans: "Rubik, sans-serif",
    // },
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        emerald: {
          ...theme,
          primary: "#138cd2",
          "primary-content": "white",
          // secondary: theme.neutral,
          // "secondary-content": theme["neutral-content"],
          // accent: "#facc15",
          // "accent-content": "#382d00",
        },
      },
    ],
  },
};
