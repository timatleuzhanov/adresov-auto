import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0a",
        accent: "#404040",
        muted: "#f4f4f4",
        ink: "#0a0a0a",
        sub: "#737373",
        /** Серебро как на логотипе (основной «светлый» акцент на чёрном) */
        logo: {
          DEFAULT: "#c6c6c6",
          bright: "#e0e0e0",
          dim: "#8a8a8a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        btn: "4px",
        card: "8px",
        modal: "12px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
