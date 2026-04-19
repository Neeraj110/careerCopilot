import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0b1326",
          dim: "#0b1326",
          bright: "#31394d",
          tint: "#4edea3",
          variant: "#2d3449",
          "container-lowest": "#060e20",
          "container-low": "#131b2e",
          container: "#171f33",
          "container-high": "#222a3d",
          "container-highest": "#2d3449",
        },
        primary: {
          DEFAULT: "#4edea3",
          container: "#00b17b",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
        },
        "on-primary": {
          DEFAULT: "#003824",
          container: "#003b26",
          fixed: "#002113",
          "fixed-variant": "#005236",
        },
        "on-surface": {
          DEFAULT: "#dae2fd",
          variant: "#bec8d2",
        },
        secondary: {
          DEFAULT: "#ffb95f",
          container: "#ee9800",
          fixed: "#ffddb8",
          "fixed-dim": "#ffb95f",
        },
        "on-secondary": {
          DEFAULT: "#472a00",
          container: "#5b3800",
          fixed: "#2a1700",
          "fixed-variant": "#653e00",
        },
        tertiary: {
          DEFAULT: "#c0c1ff",
          container: "#8d90ff",
          fixed: "#e1e0ff",
          "fixed-dim": "#c0c1ff",
        },
        "on-tertiary": {
          DEFAULT: "#1000a9",
          container: "#1407ad",
          fixed: "#07006c",
          "fixed-variant": "#2f2ebe",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6",
        },
        outline: {
          DEFAULT: "#88929b",
          variant: "#3e4850",
        },
        inverse: {
          surface: "#dae2fd",
          "on-surface": "#283044",
          primary: "#006c49",
        },
        background: "#0b1326",
        "on-background": "#dae2fd",
      },
      fontFamily: {
        headline: ["var(--font-google-sans)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-roboto)", "Roboto", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
