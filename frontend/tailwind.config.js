/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0c0c14',
          surface: '#13131f',
          border: '#2d1f4e',
          primary: '#a855f7',
          secondary: '#d946ef',
          muted: '#6b5b8a',
        },
      },
    },
  },
  plugins: [],
}
