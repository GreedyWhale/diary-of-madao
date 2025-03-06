/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
  ],
  theme: {
    extend: {
      colors: {
        'theme-black': '#1A1A1A',
        'theme-yellow': '#F9C846',
        'theme-yellow-light': '#F8E8B8',
        'theme-red': '#E6704D',
        'theme-red-light': '#F59F88',
        'theme-blue': '#82A8C9',
        'theme-blue-light': '#A1C4D8',
        'theme-green': '#B5D27F',
        'theme-green-light': '#C6E298',
        'theme-purple': '#9B6B9E',
        'theme-purple-light': '#C190C5',
        'theme-pink': '#FF69B4',
        'theme-pink-light': '#FFB6C1',
        'theme-white': '#FAFAFA',
      },
      width: {
        main: '1200px'
      }
    },
  },
  plugins: [],
}

