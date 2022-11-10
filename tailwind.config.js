const theme = require("daisyui/src/colors/themes")["[data-theme=halloween]"];

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "#333",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          ...theme,
          primary: "#138cd2",
          "primary-content": "#000",
          neutral: "#111",
          "--rounded-box": "0.5rem",
          // secondary: theme.neutral,
          // "secondary-content": theme["neutral-content"],
          // accent: "#facc15",
          // "accent-content": "#382d00",
        },
      },
    ],
  },
};
