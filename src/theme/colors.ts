export const colors = {
  primary: '#C45C26',
  primaryDark: '#8B3A12',
  primarySoft: '#F4A261',
  accent: '#D62828',
  amber: '#E9A825',
  gold: '#F4C95F',
  cream: '#FBF6EE',
  creamDark: '#F0E6D6',
  surface: '#FFFCF7',
  charcoal: '#2C241B',
  muted: '#6B5E52',
  outline: '#D9CBB8',
  success: '#3D7A4A',
  error: '#BA1A1A',
  white: '#FFFFFF',
  black: '#000000',
  tabInactive: '#9A8B7A',
  pro: '#8B5E34',
} as const;

export type ColorName = keyof typeof colors;
