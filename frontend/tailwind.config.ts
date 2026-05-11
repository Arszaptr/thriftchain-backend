import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1A0A2E',
          mid: '#2D1B4E',
          pink: '#FF6B9D',
          gold: '#FFD93D',
          mint: '#6BCB77'
        }
      }
    }
  },
  plugins: []
};

export default config;
