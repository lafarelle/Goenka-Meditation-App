/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F5EC',
          50: '#FAFAF7',
          100: '#F5F5EC',
        },
        gold: {
          DEFAULT: '#E8B84B',
          light: '#F0CC73',
          dark: '#D4A23D',
        },
        charcoal: {
          DEFAULT: '#333333',
          light: '#4A4A4A',
          lighter: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        serene: '12px',
        'serene-lg': '16px',
      },
      boxShadow: {
        serene: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'serene-md': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'serene-lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
