import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class', // toggle with .dark on <html>
  content: ['./src/**/*.{html,js,svelte,ts,jsx,tsx}'],
  theme: {
    extend: {

      // -------------------------
      // Fonts
      // -------------------------
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },

      // -------------------------
      // Brand Colors
      // -------------------------
      colors: {
        brand: {
          primary: '#2563eb',     // blue
          secondary: '#7c3aed',   // violet
          accent: '#f59e0b',      // amber
          success: '#10b981',     // emerald
          danger: '#ef4444',      // red
        },

        // Neutral system (gray based)
        neutral: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        }
      },

      // -------------------------
      // Spacing System
      // -------------------------
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },

      // -------------------------
      // Border Radius
      // -------------------------
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },

      // -------------------------
      // Shadows
      // -------------------------
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        medium: '0 6px 20px rgba(0,0,0,0.08)',
        large: '0 12px 40px rgba(0,0,0,0.12)',
      },
    }
  },
  plugins: []
}
