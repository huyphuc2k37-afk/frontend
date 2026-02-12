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
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        surface: {
          light: "#fafafa",
          DEFAULT: "#f5f5f5",
          dark: "#0f0f14",
          "dark-card": "#1a1a24",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.15", fontWeight: "800" }],
        "display-md": ["2.75rem", { lineHeight: "1.2", fontWeight: "800" }],
        "display-sm": ["2rem", { lineHeight: "1.25", fontWeight: "700" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-md": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        "body-md": ["1rem", { lineHeight: "1.7" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.5" }],
      },
      maxWidth: {
        content: "1200px",
        prose: "720px",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #5B21B6 0%, #7c3aed 40%, #06B6D4 100%)",
        "gradient-hero":
          "linear-gradient(160deg, #0f0f14 0%, #1a1a2e 40%, #16213e 70%, #0f0f14 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(91,33,182,0.08) 0%, rgba(6,182,212,0.08) 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(91,33,182,0.15)",
        "glow-accent": "0 0 40px rgba(6,182,212,0.15)",
        card: "0 2px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
