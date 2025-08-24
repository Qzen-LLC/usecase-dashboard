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
        // Primary fonts for different use cases
        sans: ["var(--font-geist-sans)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "var(--font-geist-mono)", "monospace"],
        
        // Specialized font families
        display: ["var(--font-poppins)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        code: ["var(--font-jetbrains-mono)", "var(--font-geist-mono)", "monospace"],
        
        // Legacy support
        geist: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "system-ui", "sans-serif"],
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
      // Enhanced typography utilities
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '0.025em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '0.025em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '0.025em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '0.025em' }],
      },
      // Enhanced font weights
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      // Enhanced letter spacing
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      // Enhanced line heights
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
        '3': '.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
      },
      // Text rendering and font smoothing
      textRendering: {
        'optimizeLegibility': 'optimizeLegibility',
        'optimizeSpeed': 'optimizeSpeed',
        'geometricPrecision': 'geometricPrecision',
      },
      // Font feature settings for better typography
      fontFeatureSettings: {
        'numeric': 'tnum',
        'tabular': 'tnum',
        'ordinal': 'ordn',
        'slashed-zero': 'zero',
        'diagonal-fractions': 'frac',
        'stacked-fractions': 'afrc',
        'proportional-nums': 'pnum',
        'oldstyle-nums': 'onum',
        'lining-nums': 'lnum',
      },
      // Font variant numeric for better number display
      fontVariantNumeric: {
        'normal': 'normal',
        'ordinal': 'ordinal',
        'slashed-zero': 'slashed-zero',
        'lining-nums': 'lining-nums',
        'oldstyle-nums': 'oldstyle-nums',
        'proportional-nums': 'proportional-nums',
        'tabular-nums': 'tabular-nums',
        'diagonal-fractions': 'diagonal-fractions',
        'stacked-fractions': 'stacked-fractions',
      },
      // Font variant caps for better text display
      fontVariantCaps: {
        'normal': 'normal',
        'small-caps': 'small-caps',
        'all-small-caps': 'all-small-caps',
        'petite-caps': 'petite-caps',
        'all-petite-caps': 'all-petite-caps',
        'unicase': 'unicase',
        'titling-caps': 'titling-caps',
      },
      // Font variant ligatures for better text display
      fontVariantLigatures: {
        'normal': 'normal',
        'none': 'none',
        'common-ligatures': 'common-ligatures',
        'no-common-ligatures': 'no-common-ligatures',
        'discretionary-ligatures': 'discretionary-ligatures',
        'no-discretionary-ligatures': 'no-discretionary-ligatures',
        'historical-ligatures': 'historical-ligatures',
        'no-historical-ligatures': 'no-historical-ligatures',
        'contextual': 'contextual',
        'no-contextual': 'no-contextual',
      },
      // Font variant position for better text display
      fontVariantPosition: {
        'normal': 'normal',
        'sub': 'sub',
        'super': 'super',
      },
      // Font variant east asian for better text display
      fontVariantEastAsian: {
        'normal': 'normal',
        'jis78': 'jis78',
        'jis83': 'jis83',
        'jis90': 'jis90',
        'jis04': 'jis04',
        'simplified': 'simplified',
        'traditional': 'traditional',
        'full-width': 'full-width',
        'proportional-width': 'proportional-width',
        'ruby': 'ruby',
      },
      // Font variant alternates for better text display
      fontVariantAlternates: {
        'normal': 'normal',
        'historical-forms': 'historical-forms',
      },
      // Font variant kerning for better text display
      fontVariantKerning: {
        'normal': 'normal',
        'none': 'none',
        'auto': 'auto',
      },
      // Font variant language for better text display
      fontVariantLanguage: {
        'normal': 'normal',
        'historical-forms': 'historical-forms',
      },
      // Font variant emoji for better text display
      fontVariantEmoji: {
        'normal': 'normal',
        'emoji': 'emoji',
        'text': 'text',
        'unicode': 'unicode',
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