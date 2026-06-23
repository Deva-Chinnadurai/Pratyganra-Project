export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          500: '#6366f1', // Indigo — primary CTA
          600: '#4f46e5', // Indigo darker — active/hover
          700: '#4338ca',
        },
        surface: {
          900: '#1e1b4b', // Deep Indigo-Violet — sidebar/navbar
          800: '#27235c',
          700: '#312e81',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
