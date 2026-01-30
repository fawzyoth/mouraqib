/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cta': {
          DEFAULT: '#f97316',
          hover: '#ea580c',
        },
        'primary-blue': {
          DEFAULT: '#4959b4',
          hover: '#3a4791',
        },
      },
    },
  },
  plugins: [],
}
