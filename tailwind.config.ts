import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class" as const,
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B4FE9",
          soft: "#EDEBFF",
          hover: "#4A3ED1",
          dark: "#3B2FB9",
        },
        accent: {
          coral: "#FF7A59",
          "coral-soft": "#FFF0EC",
          teal: "#12B8A6",
          "teal-soft": "#E6F8F5",
          amber: "#F5A623",
          "amber-soft": "#FEF6E9",
        },
        danger: {
          DEFAULT: "#E5484D",
          soft: "#FDECE8",
          hover: "#CC393E",
        },
        ink: {
          DEFAULT: "#1A1B25",
          secondary: "#4B5162",
          muted: "#6B7280",
          light: "#9CA3AF",
        },
        canvas: {
          DEFAULT: "#FBFAFF",
          soft: "#F5F3FF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8F7FD",
          glass: "rgba(255, 255, 255, 0.85)",
        },
        border: {
          DEFAULT: "#E7E5F5",
          light: "#F0EEFA",
          dark: "#D5D1EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-sora)", "Sora", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(91, 79, 233, 0.08)",
        "card-hover": "0 8px 32px rgba(91, 79, 233, 0.14)",
        glass: "0 8px 32px 0 rgba(91, 79, 233, 0.07)",
        dropdown: "0 10px 38px -10px rgba(22, 23, 24, 0.15), 0 10px 20px -15px rgba(22, 23, 24, 0.1)",
      },
      backgroundImage: {
        "painted-canvas": "radial-gradient(circle at 10% 20%, rgba(237, 235, 255, 0.7) 0%, rgba(251, 250, 255, 0.9) 60%), radial-gradient(circle at 90% 80%, rgba(255, 240, 236, 0.5) 0%, rgba(251, 250, 255, 0.9) 50%)",
        "painted-header": "linear-gradient(135deg, #5B4FE9 0%, #766BFF 50%, #FF7A59 100%)",
        "card-gradient": "linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
