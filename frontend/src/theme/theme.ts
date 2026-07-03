/**
 * src/theme/theme.ts
 *
 * Design Token Registry
 * ส่งออก CSS Variable names เป็น constants เพื่อใช้อ้างอิงใน TypeScript
 * ค่าจริงๆ กำหนดใน theme.css ผ่าน :root { --variable-name: value }
 */

export const colors = {
  primary: 'var(--color-primary)',
  primaryDark: 'var(--color-primary-dark)',
  primaryLight: 'var(--color-primary-light)',
  secondary: 'var(--color-secondary)',
  accent: 'var(--color-accent)',

  bgBase: 'var(--color-bg-base)',
  bgSurface: 'var(--color-bg-surface)',
  bgCard: 'var(--color-bg-card)',
  bgOverlay: 'var(--color-bg-overlay)',

  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted: 'var(--color-text-muted)',
  textInverse: 'var(--color-text-inverse)',

  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',

  border: 'var(--color-border)',
  borderFocus: 'var(--color-border-focus)',
} as const;

export const spacing = {
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  xxl: 'var(--spacing-xxl)',
} as const;

export const typography = {
  fontFamily: 'var(--font-family-base)',
  fontFamilyMono: 'var(--font-family-mono)',

  fontSizeXs: 'var(--font-size-xs)',
  fontSizeSm: 'var(--font-size-sm)',
  fontSizeMd: 'var(--font-size-md)',
  fontSizeLg: 'var(--font-size-lg)',
  fontSizeXl: 'var(--font-size-xl)',
  fontSizeXxl: 'var(--font-size-xxl)',
  fontSizeDisplay: 'var(--font-size-display)',

  fontWeightNormal: 'var(--font-weight-normal)',
  fontWeightMedium: 'var(--font-weight-medium)',
  fontWeightSemibold: 'var(--font-weight-semibold)',
  fontWeightBold: 'var(--font-weight-bold)',

  lineHeightTight: 'var(--line-height-tight)',
  lineHeightBase: 'var(--line-height-base)',
  lineHeightRelaxed: 'var(--line-height-relaxed)',
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
} as const;

export const shadow = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  glow: 'var(--shadow-glow)',
  glowStrong: 'var(--shadow-glow-strong)',
} as const;

export const transition = {
  fast: 'var(--transition-fast)',
  base: 'var(--transition-base)',
  slow: 'var(--transition-slow)',
} as const;

export const zIndex = {
  base: 'var(--z-base)',
  dropdown: 'var(--z-dropdown)',
  modal: 'var(--z-modal)',
  toast: 'var(--z-toast)',
} as const;

const theme = { colors, spacing, typography, radius, shadow, transition, zIndex };
export default theme;
