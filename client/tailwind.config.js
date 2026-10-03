/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070403',
        panel: '#110a08',
        neon: { orange: '#ff7a1a', red: '#ff2e3a', amber: '#ffb020' },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,122,26,.3), 0 12px 48px -12px rgba(255,70,30,.45)',
        neon: '0 0 28px -6px rgba(255,80,30,.75)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: { marquee: 'marquee 36s linear infinite', float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
