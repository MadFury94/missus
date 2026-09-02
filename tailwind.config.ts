import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                body: ["var(--font-barlow)", "sans-serif"],
                display: ["var(--font-barlow-condensed)", "sans-serif"],
            },
            colors: {
                primary: "#7F0E12",
                secondary: "#000",
                muted: "#f5f5f5",
                accent: "#7F0E12",
            },
        },
    },
    plugins: [],
};

export default config;
