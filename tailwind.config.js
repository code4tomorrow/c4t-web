module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-grey-primary": "#111111",
        "dark-grey-secondary": "#202124",
        "dark-blue-primary": "#292A32",
        "medium-grey-primary": "#8C8796",
        "dim-grey-primary": "#68656F", // 
        "brand-blue-primary": " #5A4CAD", // #4F9FB0
        "brand-green": "#7892EE", //"#74E1B3",
        "brand-dark-green": "#57A88A"// "#57A88A"
      }
    },
  },
  plugins: [],
}
