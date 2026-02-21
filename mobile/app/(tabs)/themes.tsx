import { useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Palette } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api, ServerTheme } from '../../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../../src/constants/tokens';

export default function ThemesScreen() {
    const colors = useThemeStore((s) => s.colors);
    const setActiveTheme = useThemeStore((s) => s.setActiveTheme);
    const activeThemeId = useThemeStore((s) => s.activeThemeId);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: themes, isLoading } = useQuery({
        queryKey: ['themes'],
        queryFn: api.getThemes,
    });

    const activateTheme = useMutation({
        mutationFn: (id: number) => api.setActiveTheme(id),
        onSuccess: (_, themeId) => {
            const theme = themes?.find((t) => t.id === themeId);
            if (theme) {
                setActiveTheme({
                    id: theme.id,
                    name: theme.name,
                    colors: {
                        bg: theme.bg_color,
                        surface: theme.surface_color,
                        text: theme.text_color,
                        textSecondary: theme.secondary_text_color,
                        border: theme.border_color,
                        accent: theme.accent_color,
                    },
                    fontDisplay: theme.font_family_display,
                    fontBody: theme.font_family_body,
                    isActive: true,
                    isDefault: theme.is_default === 1,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['themes'] });
        },
    });

    const styles = makeStyles(colors);

    const renderTheme = useCallback(({ item }: { item: ServerTheme }) => {
        const isActive = item.is_active === 1 || item.id === activeThemeId;

        return (
            <Pressable
                style={({ pressed }) => [styles.themeCard, isActive && styles.themeCardActive, pressed && { opacity: 0.85 }]}
                onPress={() => activateTheme.mutate(item.id)}
            >
                <View style={styles.themePreview}>
                    <View style={[styles.colorDot, { backgroundColor: item.bg_color }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.surface_color }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.text_color }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.accent_color }]} />
                    <View style={[styles.colorDot, { backgroundColor: item.border_color }]} />
                </View>
                <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>{item.name}</Text>
                    {item.is_default === 1 && <Text style={styles.themeDefault}>Default</Text>}
                </View>
                {isActive && <Check size={20} color={colors.accent} />}
            </Pressable>
        );
    }, [colors, activeThemeId, styles, activateTheme]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Themes</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <FlashList
                    data={themes || []}
                    renderItem={renderTheme}
                    estimatedItemSize={80}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                />
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        },
        title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        themeCard: {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.surface, borderRadius: radii.lg,
            padding: spacing.md, borderWidth: 1, borderColor: colors.border,
            gap: spacing.md,
        },
        themeCardActive: { borderColor: colors.accent, borderWidth: 2 },
        themePreview: { flexDirection: 'row', gap: 4 },
        colorDot: { width: 20, height: 20, borderRadius: 10 },
        themeInfo: { flex: 1 },
        themeName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        themeDefault: { fontSize: fontSize.xs, color: colors.textSecondary },
    });
}
