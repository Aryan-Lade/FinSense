/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reelo design system colors
        'white': '#FFFFFF',
        'background': '#f2f2f2', // Light grey panels
        'background-light': '#e6e6e6', // Lighter grey panels
        'text-primary': '#000000', // Black
        'text-secondary': '#333333', // Secondary text
        'text-muted': '#999999', // Muted text
        'border': '#dbdbdb', // Borders/dividers
        'border-light': '#d9d9d9', // Lighter borders
        'accent': '#0099ff', // Electric blue (CTAs, highlights, links)
        'accent-hover': '#0088e6', // Slightly darker for hover
        'positive': '#4ea100', // Green (positive/check states)
        'negative': '#ff4f4f', // Red (crosses in comparison)
        'tint-blue': '#66cbfd', // Light blue
        'tint-blue-dark': '#48bdf7', // Darker light blue
        'tint-pink': '#f9a9f0', // Pink
        'tint-mint': '#dcffdb', // Mint
        'card-dark': '#171717', // Near-black card
      },
      fontFamily: {
        // Reelo design system fonts
        'sans': ['Inter', 'system-ui', 'sans-serif'], // Body font
        'heading': ['Clash Grotesk', 'Satoshi', 'General Sans', 'Helvetica', 'Arial', 'sans-serif'], // Headings
        'ui': ['Manrope', 'system-ui', 'sans-serif'], // UI text
        'mono': ['Fragment Mono', 'monospace'], // Small tags/labels
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px', // Generously rounded cards
        '3xl': '24px',
        '4xl': '40px', // Big panels
        'full': '9999px', // Pill buttons
      }
    },
  },
  plugins: [],
}
