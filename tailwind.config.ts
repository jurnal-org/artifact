// NOTE: This project uses Tailwind CSS v4. Theme configuration is handled
// via CSS @theme blocks in app/globals.css — this file is kept for reference only.
// Tailwind v4 does not read tailwind.config.ts.

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Libre Baskerville", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0a0a0a",
        foreground: "rgba(255, 255, 255, 0.85)",
        muted: "rgba(255, 255, 255, 0.5)",
        "muted-foreground": "rgba(255, 255, 255, 0.35)",
        violet: {
          DEFAULT: "rgb(120, 80, 220)",
          light: "rgba(160, 130, 240, 0.8)",
          dim: "rgba(120, 80, 220, 0.5)",
        },
        teal: {
          DEFAULT: "rgb(60, 180, 160)",
          light: "rgba(60, 180, 160, 0.7)",
          dim: "rgba(60, 180, 160, 0.5)",
        },
        pink: {
          DEFAULT: "rgb(200, 100, 150)",
          light: "rgba(200, 130, 160, 0.7)",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
        },
      },
    },
  },
  // plugins: [] — In Tailwind v4, animations are handled by tw-animate-css (see globals.css)
};

export default config;
