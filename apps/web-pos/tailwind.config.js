/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luhur: {
          red: '#8ABFF8',       // Primary Accent: Soft Sky Blue (CTA & Active Pill sesuai referensi)
          redDark: '#6CAEF5',   // Hover Sky Blue
          redLight: '#B6D9FC',  // Light Sky Blue
          navy: '#241C16',      // Deep Espresso Charcoal (Top Bar & Dark Surfaces)
          navyLight: '#3A2E25', // Warm Espresso Hover
          cream: '#EAE2D3',     // Main Canvas: Warm Oat / Sandstone Beige
          creamDark: '#E0D6C5', // Secondary Surface / Subheader
          card: '#F7F3EB',      // Clean Alabaster / Warm Ivory Card
          coffee: '#241C16',    // Deep Espresso Text
          coffeeLight: '#6E6258', // Muted Taupe Text
          amber: '#8ABFF8',     // Sky Blue Accent Border
          border: '#D5CBB8'     // Subtle Hairline Border
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
