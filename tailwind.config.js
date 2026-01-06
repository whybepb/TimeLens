/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Deep charcoals - Base palette
        charcoal: {
          950: "#08080A",
          900: "#0D0D0F",
          800: "#121216",
          700: "#1A1A1F",
          600: "#222228",
          500: "#2A2A32",
          400: "#3A3A44",
          300: "#4A4A56",
        },
        // Electric blues - Primary accent
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
        // Soft violets - Secondary accent
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
        // Cyan - Tertiary accent
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        // Emerald - Success states
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        // Rose - Error/Warning states
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
        // Amber - Warning states
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        // Glass effects - Enhanced
        glass: {
          white: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.12)",
          medium: "rgba(255, 255, 255, 0.18)",
          strong: "rgba(255, 255, 255, 0.25)",
          border: "rgba(255, 255, 255, 0.15)",
          borderLight: "rgba(255, 255, 255, 0.25)",
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        glass: "16px",
        heavy: "24px",
        ultra: "40px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(26, 160, 255, 0.3)",
        "glow-sm": "0 0 10px rgba(26, 160, 255, 0.2)",
        "glow-lg": "0 0 40px rgba(26, 160, 255, 0.4)",
        "glow-violet": "0 0 20px rgba(164, 89, 255, 0.3)",
        "glow-violet-lg": "0 0 40px rgba(164, 89, 255, 0.4)",
        "glow-emerald": "0 0 20px rgba(16, 185, 129, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.25)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.5)",
        inner: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

