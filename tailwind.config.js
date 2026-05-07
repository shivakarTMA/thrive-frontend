/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightgray: '#E4E4E4',
        lightcolor: '#838383',
        white: '#ffffff',
        black2:'#1F1F28',
        textcolor:'#1C1C1C',
        buttonbg:'#23232C',
        bordergray:'#8F8F8F',
        primarycolor:"#568796",
        secondarycolor:"#9cc4d0",
        primarylight:"#f5fcff",
        
      },
    },
  },
  plugins: [],
}

