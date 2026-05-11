import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        berry: {
          50: "#fdf2f5",
          100: "#fce7ed",
          200: "#f9d0dd",
          300: "#f4a9c0",
          400: "#ed759b",
          500: "#e14a78",
          600: "#c94b6b",
          700: "#a82e51",
          800: "#8d2946",
          900: "#76263f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
