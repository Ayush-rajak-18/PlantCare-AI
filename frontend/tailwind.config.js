/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  // Dark mode abhi OFF rehega. Phase 3 mein <html class="dark"> se on hoga,
  // taaki purane pages beech mein na tootein.
  darkMode: "class",

  theme: {
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      colors: {
        // Primary: deep forest green
        forest: {
          50: "#f1f7f2",
          100: "#dcebdf",
          200: "#b9d7c0",
          300: "#8dbc99",
          400: "#5f9d71",
          500: "#3f8156",
          600: "#2f6845",
          700: "#265338",
          800: "#1f432f",
          900: "#14301f",
          950: "#0b1f13",
        },
        // Accent: fresh mint
        mint: {
          50: "#effdf6",
          100: "#d3f9e5",
          200: "#a9f1cd",
          300: "#72e4af",
          400: "#3fcf90",
          500: "#1fb576",
          600: "#12915e",
        },
        // Backgrounds: warm cream + sage surfaces
        cream: {
          50: "#fdfcf8",
          100: "#f8f6ee",
          200: "#f0ecdd",
        },
        sage: {
          50: "#f4f7f3",
          100: "#e7eee4",
          200: "#d3dfcf",
          300: "#b5c7ae",
        },
        // Sirf alerts / disease warnings ke liye
        coral: {
          50: "#fff1ee",
          100: "#ffe0d9",
          400: "#ff8a73",
          500: "#f26a50",
          600: "#d84e35",
        },
        sun: {
          50: "#fff9e8",
          100: "#fff0c2",
          400: "#f9c53b",
          500: "#eaa90f",
        },
      },

      fontFamily: {
        display: ['"Plus Jakarta Sans"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      boxShadow: {
        soft: "0 8px 30px -12px rgba(20, 48, 31, 0.18)",
        card: "0 2px 4px rgba(20, 48, 31, 0.04), 0 12px 32px -16px rgba(20, 48, 31, 0.22)",
        float: "0 18px 40px -12px rgba(31, 181, 118, 0.45)",
        nav: "0 -10px 40px -12px rgba(20, 48, 31, 0.25)",
      },

      backgroundImage: {
        "leaf-gradient": "linear-gradient(135deg, #2f6845 0%, #1fb576 100%)",
        "hero-gradient":
          "radial-gradient(120% 120% at 0% 0%, #dcebdf 0%, #f8f6ee 55%, #fdfcf8 100%)",
      },

      spacing: {
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },

      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        scan: {
          "0%, 100%": { top: "6%" },
          "50%": { top: "92%" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(31, 181, 118, 0.45)" },
          "100%": { boxShadow: "0 0 0 16px rgba(31, 181, 118, 0)" },
        },
      },

      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "sheet-up": "sheet-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.4s linear infinite",
        scan: "scan 2.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
      },
    },
  },

  plugins: [],
};
