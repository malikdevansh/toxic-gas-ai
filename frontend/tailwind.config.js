/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saas-bg': '#0a0f18',
        'saas-card': 'rgba(17, 24, 39, 0.7)',
        'saas-cyan': '#00e5b3',
        'saas-purple': '#8b5cf6',
        'saas-blue': '#3b82f6',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(to right, #00e5b3, #3b82f6)',
        'card-gradient': 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
      }
    },
  },
  plugins: [],
}
