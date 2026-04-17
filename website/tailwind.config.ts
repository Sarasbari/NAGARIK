import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        'saffron-dark': '#E68A2E',
        brutal: {
          bg: '#FFFBF5',
          border: '#000000',
          shadow: '#000000',
          accent: '#A3FF00',
          orange: '#FF6B00',
        },
        'neon-green': '#A3FF00',
        'neon-orange': '#FF6B00',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      boxShadow: {
        brutal: '4px 4px 0px #1a1a1a',
        'brutal-sm': '2px 2px 0px #1a1a1a',
        'brutal-lg': '6px 6px 0px #1a1a1a',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
