import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0dccf2',
          dark: '#0ab8da',
        },
        'background-dark': '#102023',
        'surface-dark': '#16282c',
        'surface-darker': '#0b1719',
        // keep legacy tokens so admin/blog pages don't break
        cyan: {
          DEFAULT: '#0dccf2',
          dark: '#0aa8c8',
        },
        dark: {
          DEFAULT: '#0a0a14',
          card: '#12121f',
          border: '#1e1e35',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 15px -3px rgba(13, 204, 242, 0.3)',
        'glow-lg': '0 0 25px -5px rgba(13, 204, 242, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
