/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // macOS-native font stack
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      // macOS-inspired colors
      colors: {
        // macOS system colors
        'macos-blue': '#007AFF',
        'macos-purple': '#AF52DE',
        'macos-pink': '#FF2D55',
        'macos-red': '#FF3B30',
        'macos-orange': '#FF9500',
        'macos-yellow': '#FFCC00',
        'macos-green': '#34C759',
        'macos-teal': '#5AC8FA',
        'macos-gray': {
          50: '#F5F5F7',
          100: '#EFEFF0',
          200: '#D1D1D6',
          300: '#C7C7CC',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#2C2C2E',
        },
        // Finder tag colors (for Aurora)
        'finder-red': '#FF3B30',
        'finder-orange': '#FF9500',
        'finder-yellow': '#FFCC00',
        'finder-green': '#34C759',
        'finder-blue': '#007AFF',
        'finder-purple': '#AF52DE',
        'finder-gray': '#8E8E93',
      },
      // macOS-style shadows
      boxShadow: {
        'macos': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'macos-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'macos-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      // macOS-style border radius
      borderRadius: {
        'macos': '10px',
        'macos-lg': '14px',
      },
      // macOS-style backdrop blur
      backdropBlur: {
        'macos': '40px',
      },
      // Grid columns for heat map
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
