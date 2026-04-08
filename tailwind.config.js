/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: '#5F2AF3', // SurgePay Purple
        'primary-dark': '#4A1ED4',
        secondary: '#ADEE68', // SurgePay Lime
        'secondary-dark': '#8ECC4A',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 24px rgba(15, 23, 42, 0.06)',
        'panel-dark':
          '0 1px 2px rgba(0, 0, 0, 0.2), 0 4px 24px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
