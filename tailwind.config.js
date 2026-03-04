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
        primary: '#5F2AF3', // SurgePay Purple
        'primary-dark': '#4A1ED4',
        secondary: '#ADEE68', // SurgePay Lime
        'secondary-dark': '#8ECC4A',
      },
    },
  },
  plugins: [],
}
