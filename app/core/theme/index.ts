// core/theme — Colors, typography, spacing tokens

export const Colors = {
  // Primary
  saffron: '#FF9933',
  dark: '#1a1a1a',
  white: '#FFFFFF',
  background: '#fafafa',

  // Status
  success: '#00ff88',
  error: '#ff4444',
  warning: '#FCC419',
  info: '#339AF0',

  // Neutrals
  gray100: '#f0f0f0',
  gray200: '#e0e0e0',
  gray300: '#ddd',
  gray400: '#bbb',
  gray500: '#999',
  gray600: '#888',
  gray700: '#666',
  gray800: '#333',
};

export const Typography = {
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.dark,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.dark,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.dark,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.dark,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.gray600,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  round: 20,
  full: 9999,
};
