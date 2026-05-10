/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f11',
          1: '#17171a',
          2: '#1f1f24',
          3: '#28282f',
        },
        accent: {
          DEFAULT: '#6EE7B7',
          dim: '#34d399',
          muted: '#6EE7B720',
        },
        border: '#2d2d35',
      },
    },
  },
  plugins: [],
}
