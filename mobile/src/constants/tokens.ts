/**
 * Design tokens — exact match of the Riven PWA CSS variables.
 * Fonts: Cormorant Garamond (display), Lora (body), JetBrains Mono (mono/labels)
 */

// ────────────── FONTS ──────────────

export const fonts = {
    display: 'CormorantGaramond_400Regular', // headings
    displayLight: 'CormorantGaramond_300Light', // explicit light weight
    displayItalic: 'CormorantGaramond_400Regular_Italic',
    displayBold: 'CormorantGaramond_700Bold',
    displayBoldItalic: 'CormorantGaramond_700Bold_Italic',
    body: 'Lora_400Regular', // body text
    bodyItalic: 'Lora_400Regular_Italic',
    bodyBold: 'Lora_700Bold',
    mono: 'JetBrainsMono_400Regular', // labels, tags, nav
    monoBold: 'JetBrainsMono_700Bold',
} as const;

// ────────────── COLORS ──────────────

export interface ThemeColors {
    bg: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
}

export const RIVEN_DARK: ThemeColors = {
    bg: '#162a31',
    surface: '#1e3840',
    text: '#e4ddd0',
    textSecondary: '#8fa6a8',
    border: '#233e46',
    accent: '#deb96a',
};

export const RIVEN_LIGHT: ThemeColors = {
    bg: '#f5f0e8',
    surface: '#ffffff',
    text: '#1a1c1d',
    textSecondary: '#6b7280',
    border: '#e5e0d5',
    accent: '#deb96a',
};

// Botanical palette (from PWA CSS)
export const botanical = {
    forest: '#7a9e72',    // FAB / create button
    sepia: '#8fa6a8',     // secondary text
    parchment: '#e4ddd0', // card text / light surfaces
    ink: '#162a31',       // dark text on light bg
    paper: '#fcfaf2',     // herbarium card bg
    tape: '#e8e4d8',      // specimen tape accent
    tapePin: '#d1c9b8',   // specimen pin accent
} as const;

// ────────────── SPACING ──────────────

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

// ────────────── BORDER RADII ──────────────

export const radii = {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
} as const;

// ────────────── FONT SIZES ──────────────

export const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 44,
} as const;

// ────────────── SHADOWS ──────────────

export const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
} as const;

export const botanicalGlow = {
    shadowColor: '#7a9e72',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
} as const;

// ────────────── THEME TYPE ──────────────

export interface Theme {
    id: number;
    name: string;
    colors: ThemeColors;
    fontDisplay: string;
    fontBody: string;
    isActive: boolean;
    isDefault: boolean;
}
