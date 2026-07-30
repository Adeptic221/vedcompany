import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ved: {
          navy: "#0a1628",
          blue: "#122240",
          accent: "#1e3a5f",
          light: "#2a4a6e",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "ved-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "ved-spin-reverse": {
          to: { transform: "rotate(-360deg)" },
        },
      },
      animation: {
        "ved-spin": "ved-spin 2.2s linear infinite",
        "ved-spin-reverse": "ved-spin-reverse 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;