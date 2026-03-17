/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5d87ff',
          hover: '#4570ea',
          light: '#ecf2ff',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        },
        'background-light': '#f4f6f9',
        'background-dark': '#0f172a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.05)',
        'soft-lg': '0 4px 12px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
