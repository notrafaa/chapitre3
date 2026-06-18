import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette éditoriale pilotée par variables CSS (thèmes clair/sombre).
        // Les valeurs réelles sont définies dans globals.css (:root et .light).
        ink: {
          DEFAULT: "rgb(var(--ink-950) / <alpha-value>)",
          50: "rgb(var(--ink-50) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          950: "rgb(var(--ink-950) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          dim: "rgb(var(--paper-dim) / <alpha-value>)",
        },
        chrome: {
          light: "rgb(var(--chrome-light) / <alpha-value>)",
          DEFAULT: "rgb(var(--chrome) / <alpha-value>)",
          dark: "rgb(var(--chrome-dark) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "10xl": ["10rem", { lineHeight: "0.9" }],
        "11xl": ["13rem", { lineHeight: "0.85" }],
        "12xl": ["18rem", { lineHeight: "0.8" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        editorial: "0.35em",
      },
      maxWidth: {
        editorial: "78rem",
      },
      transitionTimingFunction: {
        book: "cubic-bezier(0.16, 1, 0.3, 1)",
        "book-in": "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      keyframes: {
        "caret-blink": {
          "0%, 70%, 100%": { opacity: "1" },
          "20%, 50%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.2s ease-in-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
