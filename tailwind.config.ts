import type { Config } from "tailwindcss";

/**
 * Holo design tokens — "Liquid Glass".
 * Deep near-black canvas with luminous violet / cyan / teal accents,
 * frosted glass surfaces, large radii, layered soft shadows.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas
        base: {
          DEFAULT: "#05060a",
          900: "#05060a",
          800: "#0a0c14",
          700: "#11141f",
        },
        // Luminous accents
        violet: {
          glow: "#8b6cff",
          DEFAULT: "#7c5cff",
        },
        cyan: {
          glow: "#56e1ff",
          DEFAULT: "#3ec8ff",
        },
        teal: {
          glow: "#4ff0c4",
          DEFAULT: "#2fe0b0",
        },
        // Glass tints
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.10)",
          border: "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#f4f6ff",
          soft: "#c4c9dc",
          mute: "#8b91a8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        glass: "1.25rem",
        "glass-lg": "1.75rem",
        "glass-xl": "2.25rem",
      },
      blur: {
        glass: "16px",
        "glass-lg": "28px",
        aurora: "80px",
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 8px 40px -12px rgba(0,0,0,0.7), 0 2px 8px -2px rgba(0,0,0,0.5)",
        "glass-lg":
          "0 1px 0 0 rgba(255,255,255,0.10) inset, 0 24px 70px -20px rgba(0,0,0,0.8), 0 8px 24px -8px rgba(0,0,0,0.6)",
        glow: "0 0 80px -10px rgba(124,92,255,0.45)",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "drift-a": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(6%,-4%,0) scale(1.12)" },
        },
        "drift-b": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-7%,5%,0) scale(0.95)" },
        },
        "drift-c": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(0.95)" },
          "50%": { transform: "translate3d(4%,6%,0) scale(1.1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.9" },
        },
        "flow-x": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        "drift-a": "drift-a 22s ease-in-out infinite",
        "drift-b": "drift-b 28s ease-in-out infinite",
        "drift-c": "drift-c 25s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "flow-x": "flow-x 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
