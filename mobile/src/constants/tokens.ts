// Riven design tokens — mirrors the PWA's CSS custom properties
export interface ThemeColors {
    bg: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
}

export interface Theme {
    id: number;
    name: string;
    colors: ThemeColors;
    fontDisplay: string;
    fontBody: string;
    isActive: boolean;
    isDefault: boolean;
}

// Default Riven theme (dark)
export const RIVEN_DARK: ThemeColors = {
    bg: '#162a31',
    surface: '#1e3840',
    text: '#e4ddd0',
    textSecondary: '#8fa6a8',
    border: '#233e46',
    accent: '#deb96a',
};

// Riven Light theme
export const RIVEN_LIGHT: ThemeColors = {
    bg: '#f5f0e8',
    surface: '#ffffff',
    text: '#1e3840',
    textSecondary: '#6b7d7f',
    border: '#ddd5c8',
    accent: '#deb96a',
};

// Spacing scale (4px base)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

// Border radius
export const radii = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
} as const;

// Font sizes
export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
} as const;

// Common shadow for cards
export const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
} as const;
