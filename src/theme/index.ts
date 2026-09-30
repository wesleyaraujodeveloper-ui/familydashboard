export const colors = {
  // Brand
  primary: '#E06D53',     // Terracotta/Coral
  primaryHover: '#D45E44',
  primaryActive: '#C5533A',
  
  secondary: '#52796F',   // Sage Green
  tertiary: '#E9B44C',    // Warm Honey
  accentSky: '#6B9AC4',   // Soft Sky
  
  // Text
  textPrimary: '#23272A',
  textSecondary: '#686E74',
  textMuted: '#9CA3AF',
  
  // Surfaces (Light Mode)
  surface: '#FFFFFF',
  surfaceSubdued: '#F4F4F2',
  background: '#FBFBFA',
  
  // Borders
  border: '#EAEAEA',
  borderSubtle: '#F0F0EE',
  
  // Feedback
  error: '#ba1a1a',
  success: '#52796F',
  warning: '#E9B44C',
};

export const darkColors = {
  // Dark Mode equivalents
  surface: '#1B1D21',
  surfaceSubdued: '#23262C',
  background: '#121316',
  border: '#2B2E36',
  borderSubtle: '#21242A',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  primary: '#E7826B',
  secondary: '#69978B',
};

export const typography = {
  fontFamily: 'System', // Fallback until Plus Jakarta Sans is loaded
  sizes: {
    labelSm: 11,
    labelMd: 12,
    bodySm: 13,
    bodyMd: 14,
    bodyLg: 16,
    titleSm: 14,
    titleMd: 16,
    headlineSm: 20,
    headlineMd: 24,
    headlineLg: 32,
    headlineXl: 40,
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 4,
  md: 8,     // Inputs, Buttons
  lg: 16,    // Cards
  xl: 24,    // Modals
  full: 9999, // Avatars, Pills
};

export const shadows = {
  level1: {
    shadowColor: '#23272A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: '#23272A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  level3: { // Modals
    shadowColor: '#23272A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 36,
    elevation: 8,
  },
};

export const theme = {
  colors,
  darkColors,
  typography,
  spacing,
  radius,
  shadows,
};
