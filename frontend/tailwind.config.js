/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#54243F",
          hover: "#431a32",
          light: "#723657",
        },
        secondary: {
          DEFAULT: "#E9A5BE",
          hover: "#dd8fa9",
          light: "#f7d5e2",
        },
        background: {
          DEFAULT: "#FFF9F7",
          paper: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F5DCE5",
          hover: "#eecfdc",
        },
        siteText: {
          DEFAULT: "#343039",
          muted: "#6f6877",
          light: "#9c94a5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(84, 36, 63, 0.06)",
        card: "0 2px 14px rgba(84, 36, 63, 0.05), 0 1px 3px rgba(84, 36, 63, 0.05)",
        hover: "0 12px 30px -4px rgba(84, 36, 63, 0.12)",
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
};
