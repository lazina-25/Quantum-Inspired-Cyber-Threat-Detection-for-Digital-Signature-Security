/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: {
          50: '#FFFDF5',
          100: '#FFF7D6',
          200: '#FFECA0',
          300: '#FFDF66',
          400: '#FFD84D',
          500: '#F5C400',
          600: '#D9AB00',
          700: '#B88F00',
          800: '#8C6D00',
          900: '#5C4700',
        },
        surface: {
          DEFAULT: '#FAFAF8',
          50: '#FFFFFF',
          100: '#FAFAF8',
          200: '#F5F5F0',
        },
        card: {
          DEFAULT: '#FFFFFF',
          light: '#FFFFFF',
        },
        charcoal: {
          DEFAULT: '#171717',
          50: '#F7F7F7',
          100: '#E3E3E3',
          200: '#C8C8C8',
          300: '#A4A4A4',
          400: '#808080',
          500: '#6B6B6B',
          600: '#4D4D4D',
          700: '#363636',
          800: '#242424',
          900: '#171717',
        },
        secondary: {
          DEFAULT: '#6B6B6B',
          50: '#F7F7F7',
          100: '#E3E3E3',
          200: '#C8C8C8',
          300: '#A4A4A4',
          400: '#808080',
          500: '#6B6B6B',
          600: '#4D4D4D',
          700: '#363636',
        },
        border: {
          DEFAULT: '#EAEAEA',
          light: '#F0F0F0',
        },
        success: '#22A06B',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 16px -2px rgba(0, 0, 0, 0.06), 0 3px 6px -2px rgba(0, 0, 0, 0.03)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
