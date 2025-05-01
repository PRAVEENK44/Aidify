
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      scale: {
        '102': '1.02',
      },
      colors: {
        // Update the colors to Aidify branding
        aidify: {
          blue: "#1e88e5",
          green: "#26a69a",
          red: "#e53935",
          purple: "#9c27b0",
          pink: "#f50057",
          teal: "#00bcd4",
          orange: "#ff6d00",
          amber: "#ffab00",
          lime: "#cddc39",
          deepPurple: "#5e35b1",
          indigo: "#3949ab",
          cyan: "#00acc1",
          fuchsia: "#d500f9",
        },
        injury: {
          bleeding: "#e53935",
          burn: "#ff8a65",
          sprain: "#8d6e63",
          cardiac: "#d32f2f",
          fracture: "#7b1fa2",
          poisoning: "#00897b",
        },
        pathway: {
          dark: "#0d192b",
          blue: "#1e47b5",
          light: "#e1edff",
          yellow: "#f7b93e",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
        display: ["Montserrat", ...fontFamily.sans],
        futuristic: ["Orbitron", "Futura", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "background-shine": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "ping-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.2" },
          "50%": { transform: "scale(1.2)", opacity: "0.5" },
        },
        "float-vertical": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-horizontal": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(10px)" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "pulse-emergency": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 0 10px rgba(239, 68, 68, 0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "gradient-movement": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "background-shine": "background-shine 8s linear infinite",
        "spin-slow": "spin-slow 15s linear infinite",
        "ping-slow": "ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "float-vertical": "float-vertical 3s ease-in-out infinite",
        "float-horizontal": "float-horizontal 5s ease-in-out infinite",
        "ripple": "ripple 1s ease-out",
        "pulse-emergency": "pulse-emergency 2s infinite cubic-bezier(0.4, 0, 0.6, 1)",
        "shimmer": "shimmer 2s infinite linear",
        "gradient-movement": "gradient-movement 3s ease infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('/img/hero-pattern.svg')",
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)',
        'glossy': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'holographic': 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.3) 100%)',
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.purple.400), 0 0 20px theme(colors.purple.600)',
        'neon-blue': '0 0 5px theme(colors.blue.400), 0 0 20px theme(colors.blue.600)',
        'neon-pink': '0 0 5px theme(colors.pink.400), 0 0 20px theme(colors.pink.600)',
        'inner-glow': 'inset 0 0 20px rgba(156, 39, 176, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(10px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
