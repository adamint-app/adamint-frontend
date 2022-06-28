const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts,md}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
         // 'white':     '#ffffff',
         // 'tahiti': {
         //    100: '#cffafe',
         //    200: '#a5f3fc',
         //    300: '#67e8f9',
         //    400: '#22d3ee',
         //    500: '#06b6d4',
         //    600: '#0891b2',
         //    700: '#0e7490',
         //    800: '#155e75',
         //    900: '#164e63',
         // },
         // ....
      },
      screens: {
        'xxs': '320px',
        // => @media (min-width: 320px) { ... }
        'xs': '380px',
        // => @media (min-width: 380px) { ... }

        //'sm': '640px',
        // => @media (min-width: 640px) { ... }

        //'md': '768px',
        // => @media (min-width: 768px) { ... }

        //'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        //'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        //'2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
        ...defaultTheme.screens,
      },
      neumorphismSize: {
        none: '0em',
        xs: '0.05em',
        sm: '0.1em',
        default: '0.2em',
        lg: '0.4em',
        xl: '0.8em',
      },
      neumorphismShadow: {
        shadowColor: [0.16, 0.11],
        highlightColor: [0.25, 0.2],
        shadowGradient: [0.1, 0.06],
        highlightGradient: [0.05, 0.1],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-neumorphism'),
  ],
  // future: {
  //   purgeLayersByDefault: true,
  //   removeDeprecatedGapUtilities: true,
  // },
}
