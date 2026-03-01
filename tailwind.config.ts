import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sboc-yellow": "#F5C400",
        "sboc-dark": "#1A1A1A",
        "sboc-white": "#FAFAF5",
        "sboc-green": "#22C55E",
        "sboc-red": "#EF4444",
        "sboc-neutral": "#6B7280",
      },
      fontFamily: {
        display: ["Fredoka", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
export default config
