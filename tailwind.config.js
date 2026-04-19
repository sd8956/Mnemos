/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        "bg-primary": "#1a1b26",
        "bg-canvas": "#13131f",
        "bg-surface": "#1e2030",
        border: "#292e42",
        "text-primary": "#c0caf5",
        "text-muted": "#565f89",
        "accent-blue": "#7aa2f7",
        "accent-purple": "#bb9af7",
        "accent-cyan": "#7dcfff",
        "accent-green": "#9ece6a",
        "accent-red": "#f7768e",
        "accent-orange": "#ff9e64",
      },
    },
  },
  plugins: [],
};
