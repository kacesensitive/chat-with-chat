import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        nod: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(-20deg)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0px)" },
          "65%": { transform: "translateY(10px)" },
        },
      },
      animation: {
        nod: "nod 1s ease-in-out infinite bob 1.3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
