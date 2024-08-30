/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require('@iconify/tailwind');

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
    './public/**/*.html',
    './safelist.txt'
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1c30aa",
        secondary: "#5c5c5c",
        dark: "#1a1a1b",
        link: "#1c30aa",
        "link-hover": "#020f61",

      },
      fontFamily: {
        sans: ["Helvetica", "Arial", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1040px",
        xl: "1280px",
        "2xl": "1536px",
      },
      fontSize: {
        mobile: "15px",
        base: "16px", // Default base font size
      },
    },
  },
  plugins: [
    addDynamicIconSelectors()
  ]
};
