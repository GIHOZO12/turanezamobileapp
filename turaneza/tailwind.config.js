const colors = require('./src/constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      // 8px base spacing scale from DESIGN.md, additive to Tailwind's default scale
      // (so both the stock `p-4` and the design system's `p-md` work).
      spacing: {
        xs: '4px',
        base: '8px',
        sm: '12px',
        'margin-mobile': '16px',
        md: '24px',
        gutter: '24px',
        lg: '40px',
        xl: '64px',
      },
      // "Mixed Radius" strategy: pill-shaped interactive elements, 16px structural containers.
      borderRadius: {
        sm: '8px',
        DEFAULT: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        full: '9999px',
      },
      // One fontFamily key per (typeface, weight) pair actually used. React Native can't
      // synthesize font weights on custom fonts the way CSS can — each weight is a distinct
      // font file loaded via useFonts() in _layout.tsx — so the weight has to be baked into
      // which font file this key points at, not applied afterwards with a separate font-bold class.
      fontFamily: {
        'display-lg': ['Poppins_700Bold'],
        'headline-lg': ['Poppins_600SemiBold'],
        'headline-lg-mobile': ['Poppins_600SemiBold'],
        'headline-md': ['Poppins_600SemiBold'],
        'body-lg': ['Poppins_400Regular'],
        'body-md': ['Poppins_400Regular'],
        'body-editorial': ['Merriweather_400Regular'],
        'headline-editorial': ['Merriweather_700Bold'],
        'label-md': ['Poppins_500Medium'],
        'label-sm': ['Poppins_600SemiBold'],
        brand: ['Poppins_800ExtraBold'],
      },
      // Pair with the matching fontFamily-* class, e.g. `font-headline-md text-headline-md`.
      fontSize: {
        'display-lg': ['48px', { lineHeight: '58px', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '42px' }],
        'headline-lg-mobile': ['24px', { lineHeight: '31px' }],
        'headline-md': ['24px', { lineHeight: '34px' }],
        'headline-editorial': ['30px', { lineHeight: '38px' }],
        'body-lg': ['18px', { lineHeight: '29px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'body-editorial': ['16px', { lineHeight: '29px' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.14px' }],
        'label-sm': ['12px', { lineHeight: '14px' }],
      },
      // The mockups' tinted "Investment Shadow" (blue-tinted drop shadow on cards/buttons).
      boxShadow: {
        investment: '0px 4px 12px rgba(30, 136, 229, 0.15)',
      },
    },
  },
  plugins: [],
};
