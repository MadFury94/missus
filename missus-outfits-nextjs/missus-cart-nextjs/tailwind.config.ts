import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
        condensed: ["var(--font-barlow-condensed)", "sans-serif"],
      },
      colors: {
        brand: {
          red: "#e8002d",
          black: "#000000",
          dark: "#1a1a1a",
          mid: "#767676",
          border: "#e0e0e0",
          gray: "#f5f5f5",
          green: "#007a3d",
          "green-light": "#f0faf4",
          "green-border": "#c8e6d4",
        },
      },
      letterSpacing: {
        wider2: "0.14em",
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};
export default config;
