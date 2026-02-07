/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#009B77', // SurgePay Teal
        'primary-dark': '#007B5F',
        secondary: '#F5A623', // SurgePay Orange
        'secondary-dark': '#E09400',
      },
    },
  },
  plugins: [],
}
