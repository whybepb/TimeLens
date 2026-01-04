/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Deep charcoals
        charcoal: {
          900: "#0D0D0F",
          800: "#121216",
          700: "#1A1A1F",
          600: "#222228",
          500: "#2A2A32",
        },
        // Electric blues
        electric: {
          50: "#E6F4FF",
          100: "#B3DFFF",
          200: "#80CAFF",
          300: "#4DB5FF",
          400: "#1AA0FF",
          500: "#0088E6",
          600: "#006BB3",
          700: "#004E80",
          800: "#00314D",
          900: "#00141A",
        },
        // Soft violets
        violet: {
          50: "#F3E8FF",
          100: "#E4CCFF",
          200: "#D4AFFF",
          300: "#C492FF",
          400: "#B475FF",
          500: "#A459FF",
          600: "#8A3DE6",
          700: "#7021CC",
          800: "#5605B3",
          900: "#3C0099",
        },
        // Glass effects
        glass: {
          white: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.12)",
          medium: "rgba(255, 255, 255, 0.18)",
          border: "rgba(255, 255, 255, 0.15)",
        },
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(26, 160, 255, 0.3)",
        "glow-violet": "0 0 20px rgba(164, 89, 255, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
