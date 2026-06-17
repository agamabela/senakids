/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8BA888',
        'primary-light': '#E8EBE6',
        purple: '#9A8A9E',
        pink: '#C5948E',
        yellow: '#D9A05B',
        teal: '#8BA888',
        orange: '#C87A65',
        blue: '#7A8B99',
        green: '#8BA888',
        background: '#FAF6F0',
        card: '#FFFFFF',
        muted: '#F2EBE1',
        'muted-foreground': '#8C7A6B',
        'accent-foreground': '#4A3F35',
        text: '#4A3F35',
      },
      fontFamily: {
        heading: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}