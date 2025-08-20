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
        // Primary Brand Colors
        primary: {
          50: "rgb(var(--primary-50))",
          100: "rgb(var(--primary-100))",
          200: "rgb(var(--primary-200))",
          300: "rgb(var(--primary-300))",
          400: "rgb(var(--primary-400))",
          500: "rgb(var(--primary-500))",
          600: "rgb(var(--primary-600))",
          700: "rgb(var(--primary-700))",
          800: "rgb(var(--primary-800))",
          900: "rgb(var(--primary-900))",
        },
        // Secondary Colors
        secondary: {
          50: "rgb(var(--secondary-50))",
          100: "rgb(var(--secondary-100))",
          200: "rgb(var(--secondary-200))",
          300: "rgb(var(--secondary-300))",
          400: "rgb(var(--secondary-400))",
          500: "rgb(var(--secondary-500))",
          600: "rgb(var(--secondary-600))",
          700: "rgb(var(--secondary-700))",
          800: "rgb(var(--secondary-800))",
          900: "rgb(var(--secondary-900))",
        },
        // Success Colors
        success: {
          50: "rgb(var(--success-50))",
          100: "rgb(var(--success-100))",
          200: "rgb(var(--success-200))",
          300: "rgb(var(--success-300))",
          400: "rgb(var(--success-400))",
          500: "rgb(var(--success-500))",
          600: "rgb(var(--success-600))",
          700: "rgb(var(--success-700))",
          800: "rgb(var(--success-800))",
          900: "rgb(var(--success-900))",
        },
        // Warning Colors
        warning: {
          50: "rgb(var(--warning-50))",
          100: "rgb(var(--warning-100))",
          200: "rgb(var(--warning-200))",
          300: "rgb(var(--warning-300))",
          400: "rgb(var(--warning-400))",
          500: "rgb(var(--warning-500))",
          600: "rgb(var(--warning-600))",
          700: "rgb(var(--warning-700))",
          800: "rgb(var(--warning-800))",
          900: "rgb(var(--warning-900))",
        },
        // Danger Colors
        danger: {
          50: "rgb(var(--danger-50))",
          100: "rgb(var(--danger-100))",
          200: "rgb(var(--danger-200))",
          300: "rgb(var(--danger-300))",
          400: "rgb(var(--danger-400))",
          500: "rgb(var(--danger-500))",
          600: "rgb(var(--danger-600))",
          700: "rgb(var(--danger-700))",
          800: "rgb(var(--danger-800))",
          900: "rgb(var(--danger-900))",
        },
        // Neutral Colors
        neutral: {
          50: "rgb(var(--neutral-50))",
          100: "rgb(var(--neutral-100))",
          200: "rgb(var(--neutral-200))",
          300: "rgb(var(--neutral-300))",
          400: "rgb(var(--neutral-400))",
          500: "rgb(var(--neutral-500))",
          600: "rgb(var(--neutral-600))",
          700: "rgb(var(--neutral-700))",
          800: "rgb(var(--neutral-800))",
          900: "rgb(var(--neutral-900))",
        },
        // Semantic Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
        "3xl": "var(--space-3xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config; 