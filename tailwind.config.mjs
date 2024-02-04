/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      animation: {
        "tracking-in-expand":
          "tracking-in-expand 0.7s cubic-bezier(0.215, 0.610, 0.355, 1.000) both",
        "text-focus-in":
          "text-focus-in 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both",
        "focus-in-contract-bck":
          "focus-in-contract-bck 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
      },
      keyframes: {
        "tracking-in-expand": {
          "0%": {
            "letter-spacing": "-0.5em",
            opacity: 0,
          },
          "40%": {
            opacity: 0.6,
          },
          "100%": {
            opacity: 1,
          },
        },
        "text-focus-in": {
          "0%": {
            filter: "blur(12px)",
            opacity: 0,
          },
          "100%": {
            filter: "blur(0px)",
            opacity: 1,
          },
        },
        "focus-in-contract-bck": {
          "0%": {
            "letter-spacing": "1em",
            transform: "translateZ(300px)",
            filter: "blur(12px)",
            opacity: 0,
          },
          "100%": {
            transform: "translateZ(12px)",
            filter: "blur(0)",
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, addComponents, theme }) {
      addComponents({
        ".glass-block": {
          "border-radius": theme("borderRadius.xl"),
          "background-color": "rgb(185 188 190 / 60%)",
          "margin-left": "auto",
          "margin-right": "auto",
          overflow: "hidden",
          border: "0.5px solid rgb(255 255 255)",
          width: "1200px",
        },
      });
      addUtilities({
        "hidden-scrollbar": {
          "-ms-overflow-style": "none" /* IE, Edge 対応 */,
          "scrollbar-width": "none" /* Firefox 対応 */,
        },
        ".hidden-scrollbar::-webkit-scrollbar": {
          /* Chrome, Safari 対応 */
          display: "none",
        },
      });
    }),
  ],
};
