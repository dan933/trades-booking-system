/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primaryColour: "#292e40",
        secondaryColour: "#25293a",
        textColour: "#f2f4fa",
        primaryHover: "#3c4257",
        secondaryHover: "#4a5062",
        btnPrimary: "#4a5568",
      },
    },
  },
  plugins: [],
};
