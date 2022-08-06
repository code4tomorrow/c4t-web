module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '360px',
      },  
      colors: {
        "dark-grey-primary": "#111111",
        "dark-grey-secondary": "#202124",
        "dark-grey-accent": "#292A32",
        "medium-grey": "#8C8796",
        "dim-grey": "#68656F", // 
        "brand-blue-primary": " #5A4CAD",
        "brand-purple-secondary": "#7892EE",
        // "brand-blue-primary": "#71DBB6", 
        // "brand-purple-secondary": "#52A4B1",
      }
    },
  },
  plugins: [],
}