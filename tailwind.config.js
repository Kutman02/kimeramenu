/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed', // purple-600
        secondary: '#ec4899', // pink-500
      },
      maxWidth: {
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
}
