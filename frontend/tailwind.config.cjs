/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extract colors from demo website
        'background': '#f2f2f2', // rgb(242, 242, 242) from demo site
        'primary': '#1a1a1a',    // Dark text color from demo
        'secondary': '#4a4a4a',  // Medium gray
        'accent': '#10b981',     // Emerald (for success/paid status)
        'warning': '#f59e0b',    // Amber (for warning/status)
        'error': '#ef4444',      // Red (for error/status)
      },
      fontFamily: {
        // Fonts from demo website
        'sans': ['Manrope', 'system-ui', 'sans-serif'],
        'mono': ['Fragment Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
