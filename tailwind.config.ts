import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0d12",
          900: "#11141c",
          800: "#171b26",
          700: "#1e2433",
          600: "#2a3246",
        },
        accent: {
          DEFAULT: "#6ee7b7",
          dim: "#34d399",
          glow: "rgba(110, 231, 183, 0.18)",
        },
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 18px 50px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
