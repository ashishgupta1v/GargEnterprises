/**
 * Theme — GargEnterprises Neumorphic Design System v2.0
 *
 * Neumorphism (soft UI): ONE background color for ALL surfaces.
 * Depth comes entirely from dual shadows (light top-left, dark bottom-right).
 * Gradients used ONLY for: CTA buttons, status badges, icon fills, brand highlights.
 *
 * Source: Stitch Design System — GargBizSuite_Neumorphic_Design_System.html
 */

// ═══════════════════════════════════════════
//  COLORS
// ═══════════════════════════════════════════

export const colors = {
  // ── Base Surface (THE one color everything shares) ──
  base: '#EEF0F5',
  baseLt: '#F8F9FC',    // light highlight (inner shadow light side)
  baseDk: '#E4E6ED',    // subtle darker variant

  // ── Shadow Colors ──
  shadowDark: '#D1D4DE',
  shadowLight: '#FFFFFF',
  shadowDarker: '#C8CBDA',  // for large card shadows

  // ── Text Scale ──
  textPrimary: '#1A202C',     // headings, important values
  textSecondary: '#2D3748',   // body, labels
  textMuted: '#4A5568',       // descriptions, hints
  textSubtle: '#718096',      // timestamps, metadata, captions
  textPlaceholder: '#A0AEC0', // input placeholders

  // ── Gradient Endpoints (used in LinearGradient/manual) ──
  primaryStart: '#4F7BF7',
  primaryEnd: '#667EEA',

  successStart: '#38A169',
  successEnd: '#68D391',

  warningStart: '#D69E2E',
  warningEnd: '#F6C90E',

  dangerStart: '#E53E3E',
  dangerEnd: '#FC8181',

  infoStart: '#4FACFE',
  infoEnd: '#00F2FE',

  goldStart: '#F6D365',
  goldEnd: '#FDA085',

  tealStart: '#38B2AC',
  tealEnd: '#4FD1C5',

  purpleStart: '#805AD5',
  purpleEnd: '#B794F4',

  // ── Flat variants (for non-gradient contexts) ──
  primary: '#4F7BF7',
  success: '#38A169',
  warning: '#D69E2E',
  danger: '#E53E3E',
  info: '#4FACFE',

  // ── Utilities ──
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(26, 32, 44, 0.5)',
  divider: 'rgba(79, 123, 247, 0.08)',
};

// ═══════════════════════════════════════════
//  NEUMORPHIC SHADOWS (React Native format)
// ═══════════════════════════════════════════
// React Native only supports single-source shadows on Android via `elevation`.
// On iOS, we use shadowColor/Offset/Opacity/Radius.
// For true neumorphism on Android, we simulate with elevation + backgroundColor.

export const shadows = {
  /** Standard raised card */
  raise: {
    shadowColor: '#B8BAC3',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Small raised element (list rows, small cards) */
  raiseSm: {
    shadowColor: '#B8BAC3',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Large raised element (hero cards, feature panels) */
  raiseLg: {
    shadowColor: '#B0B3BF',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  /** Flat shadow (badges, chips, subtle elements) */
  flat: {
    shadowColor: '#B8BAC3',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  /** Tab bar top shadow */
  tabBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 16,
  },
  /** Primary button colored shadow */
  primaryBtn: {
    shadowColor: '#4F7BF7',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  /** Success button colored shadow */
  successBtn: {
    shadowColor: '#38A169',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  /** Danger button colored shadow */
  dangerBtn: {
    shadowColor: '#E53E3E',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ═══════════════════════════════════════════
//  TYPOGRAPHY
// ═══════════════════════════════════════════
// Inter for all UI, JetBrains Mono for data.
// Using system font fallback since custom fonts aren't bundled yet.

export const fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
  mono: 'monospace',
};

export const typography = {
  /** 28pt · 800 · Screen hero titles */
  display: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  /** 18pt · 700 · Navigation bar title */
  titleLarge: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  /** 16pt · 700 · Card headings */
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  /** 14pt · 600 · List row primary text */
  titleSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  /** 15pt · 400 · Large body text */
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  /** 14pt · 400 · Standard body text */
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  /** 12pt · 400 · Captions, timestamps, helper text */
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSubtle,
    lineHeight: 18,
  },
  /** 11pt · 700 · Labels, tags */
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  /** 10pt · 700 · Overline — ALL CAPS section labels */
  overline: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.textPlaceholder,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  /** 13pt · 500 · Mono data (SKUs, prices, quantities) */
  mono: {
    fontSize: 13,
    fontWeight: '500' as const,
    fontFamily: fonts.mono,
    color: colors.textSecondary,
  },
  /** 26pt · 800 · KPI values */
  kpiValue: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  /** 11pt · 600 · KPI labels */
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textSubtle,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
};

// ═══════════════════════════════════════════
//  SPACING (4pt base grid)
// ═══════════════════════════════════════════

export const spacing = {
  xs: 4,    // micro gap — icon-to-label, badge padding
  sm: 8,    // tight — within component
  md: 12,   // small — between sibling items
  lg: 16,   // medium — card padding, list row sides
  xl: 20,   // base — screen horizontal margin
  xxl: 24,  // between card groups
  xxxl: 32, // major sections
  hero: 48, // top of screen, hero area
};

// ═══════════════════════════════════════════
//  BORDER RADIUS
// ═══════════════════════════════════════════

export const borderRadius = {
  xs: 6,      // badges, chips
  sm: 10,     // buttons, inputs
  md: 16,     // cards, modals
  lg: 20,     // bottom sheets, feature cards
  xl: 28,     // hero cards, main panels
  full: 999,  // avatar, toggle, search pill
};

// ═══════════════════════════════════════════
//  STOCK STATUS CONFIG (gradient-based)
// ═══════════════════════════════════════════

export const stockStatusConfig = {
  in_stock: {
    label: 'In Stock',
    gradientStart: colors.successStart,
    gradientEnd: colors.successEnd,
    color: colors.success,
  },
  low_stock: {
    label: 'Low Stock',
    gradientStart: colors.warningStart,
    gradientEnd: colors.warningEnd,
    color: colors.warning,
  },
  out_of_stock: {
    label: 'Out of Stock',
    gradientStart: colors.dangerStart,
    gradientEnd: colors.dangerEnd,
    color: colors.danger,
  },
  dead_stock: {
    label: 'Dead Stock',
    gradientStart: '#4A5568',
    gradientEnd: '#718096',
    color: '#718096',
  },
  excess_stock: {
    label: 'Excess Stock',
    gradientStart: colors.purpleStart,
    gradientEnd: colors.purpleEnd,
    color: colors.purpleStart,
  },
  out_of_trend: {
    label: 'Out of Trend',
    gradientStart: colors.goldStart,
    gradientEnd: colors.goldEnd,
    color: colors.warning,
  },
};

/** Role-based gradient colors for avatars and role badges */
export const roleConfig = {
  owner: {
    label: 'Owner',
    icon: '👑',
    gradientStart: colors.primaryStart,
    gradientEnd: colors.primaryEnd,
  },
  manager: {
    label: 'Manager',
    icon: '📋',
    gradientStart: colors.tealStart,
    gradientEnd: colors.tealEnd,
  },
  staff: {
    label: 'Staff',
    icon: '🏷️',
    gradientStart: colors.successStart,
    gradientEnd: colors.successEnd,
  },
  godown: {
    label: 'Godown Keeper',
    icon: '📦',
    gradientStart: colors.goldStart,
    gradientEnd: colors.goldEnd,
  },
};

export default {
  colors,
  shadows,
  fonts,
  typography,
  spacing,
  borderRadius,
  stockStatusConfig,
  roleConfig,
};
