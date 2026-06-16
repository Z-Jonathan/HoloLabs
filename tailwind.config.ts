import type { Config } from "tailwindcss";

/**
 * Holo design tokens — "Soft Light".
 * Warm ivory canvas with crisp white surfaces and restrained
 * violet / blue / teal accents, hairline borders, soft diffuse shadows.
 * Inspired by the calm, minimal palettes of Anthropic & ElevenLabs.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas + raised surfaces
        base: {
          DEFAULT: "#f7f5ef", // warm ivory canvas
          900: "#ffffff", // crisp white panels / insets
          800: "#ffffff", // raised surfaces (nav, etc.)
          700: "#edebe3", // subtle neutral fill
        },
        // Restrained accents — tuned for legibility on a light canvas
        violet: {
          glow: "#6c5ce0",
          DEFAULT: "#5a47c9",
        },
        cyan: {
          glow: "#1f93b8",
          DEFAULT: "#17819f",
        },
        teal: {
          glow: "#13a07a",
          DEFAULT: "#0f8868",
        },
        // Glass tints — light surfaces with a dark hairline border
        glass: {
          DEFAULT: "rgba(255,255,255,0.62)",
          strong: "rgba(255,255,255,0.88)",
          border: "rgba(31,29,26,0.10)",
        },
        ink: {
          DEFAULT: "#1f1d1a",
          soft: "#54524b",
          mute: "#8a887f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        satoshi: ['var(--font-satoshi)', 'sans-serif'],
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
          "0 1px 2px 0 rgba(31,29,26,0.04), 0 8px 24px -12px rgba(31,29,26,0.12)",
        "glass-lg":
          "0 2px 6px -1px rgba(31,29,26,0.05), 0 24px 56px -24px rgba(31,29,26,0.16)",
        glow: "0 12px 32px -10px rgba(31,29,26,0.22)",
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
