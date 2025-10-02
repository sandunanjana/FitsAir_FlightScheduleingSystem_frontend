/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandNavy: "#001B71",
        brandRed: "#EA0029",
      },
      gridTemplateColumns: {
        gantt: "repeat(48, minmax(16px, 1fr))",
      },
      height: { ganttRow: "48px" },
    },
  },
  plugins: [],
};
