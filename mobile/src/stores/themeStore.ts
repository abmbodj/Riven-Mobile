import { create } from 'zustand';
import { ThemeColors, RIVEN_DARK, Theme } from '../constants/tokens';

interface ThemeState {
    colors: ThemeColors;
    themes: Theme[];
    activeThemeId: number | null;
    setColors: (colors: ThemeColors) => void;
    setThemes: (themes: Theme[]) => void;
    setActiveTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    colors: RIVEN_DARK,
    themes: [],
    activeThemeId: null,
    setColors: (colors) => set({ colors }),
    setThemes: (themes) => set({ themes }),
    setActiveTheme: (theme) => set({
        activeThemeId: theme.id,
        colors: {
            bg: theme.colors.bg,
            surface: theme.colors.surface,
            text: theme.colors.text,
            textSecondary: theme.colors.textSecondary,
            border: theme.colors.border,
            accent: theme.colors.accent,
        },
    }),
}));
