/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#020408", cyan: "#00f2ff" }
    }
  },
  plugins: []
}
