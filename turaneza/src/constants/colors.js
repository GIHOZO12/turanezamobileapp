/**
 * TURANEZA color palette, straight from stitch_turaneza_co_investment_platform/turaneza/DESIGN.md.
 *
 * Plain CommonJS (not .ts) on purpose: tailwind.config.js is evaluated by Node at build time via
 * `require()`, before Metro/Babel/TypeScript get involved, so it can only `require()` plain JS.
 * Component files import this same object for the rare cases NativeWind can't reach — a native
 * `color` prop (icons, ActivityIndicator) isn't a style, so no className can set it.
 */
module.exports = {
  surface: '#f8f9ff',
  'surface-dim': '#d4dae7',
  'surface-bright': '#f8f9ff',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#eef4ff',
  'surface-container': '#e7eefb',
  'surface-container-high': '#e2e8f5',
  'surface-container-highest': '#dce3f0',
  'on-surface': '#151c25',
  'on-surface-variant': '#404752',
  'inverse-surface': '#2a313b',
  'inverse-on-surface': '#eaf1fe',

  primary: '#005ea4',
  'on-primary': '#ffffff',
  'primary-container': '#0077ce',
  'on-primary-container': '#fdfcff',
  'inverse-primary': '#a2c9ff',
  'primary-fixed': '#d3e4ff',
  'primary-fixed-dim': '#a2c9ff',
  'on-primary-fixed': '#001c38',
  'on-primary-fixed-variant': '#004881',

  secondary: '#006c4b',
  'on-secondary': '#ffffff',
  'secondary-container': '#64f9bc',
  'on-secondary-container': '#00714e',
  'secondary-fixed': '#68fcbf',
  'secondary-fixed-dim': '#45dfa4',
  'on-secondary-fixed': '#002114',
  'on-secondary-fixed-variant': '#005137',

  tertiary: '#765700',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#956e00',
  'on-tertiary-container': '#fffbff',
  'tertiary-fixed': '#ffdf9f',
  'tertiary-fixed-dim': '#f9bd22',
  'on-tertiary-fixed': '#261a00',
  'on-tertiary-fixed-variant': '#5c4300',

  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',

  background: '#f8f9ff',
  'on-background': '#151c25',
  outline: '#707783',
  'outline-variant': '#c0c7d4',
  'surface-tint': '#0060a8',
  'surface-variant': '#dce3f0',


  success: '#34D399',
  warning: '#FBBF24',
};
