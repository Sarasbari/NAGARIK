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
          border: '#1a1a1a',
          shadow: '#1a1a1a',
          accent: '#FF9933',
        },
      },
      borderWidth: {
        '3': '3px',
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
