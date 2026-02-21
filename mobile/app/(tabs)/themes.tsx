import { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Plus, X, Trash2, Edit3, Sun, Moon, Sparkles, Type } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api, ServerTheme } from '../../src/lib/api';
import { spacing, radii, fontSize, cardShadow, fonts, botanical } from '../../src/constants/tokens';
import GlobalBackground from '../../src/components/GlobalBackground';

const DEFAULT_DARK = {
    name: 'Custom Dark',
    bg_color: '#1a1a18',
    surface_color: '#242422',
    text_color: '#e8e8e3',
    secondary_text_color: '#a1a19a',
    border_color: '#3d3d3a',
    accent_color: '#d97757',
    font_family_display: 'Inter',
    font_family_body: 'Inter'
};

const DEFAULT_LIGHT = {
    name: 'Custom Light',
    bg_color: '#fafaf9',
    surface_color: '#ffffff',
    text_color: '#1c1c1a',
    secondary_text_color: '#6b6b66',
    border_color: '#e5e5e2',
    accent_color: '#d97757',
    font_family_display: 'Cormorant Garamond',
    font_family_body: 'Lora'
};

const FONT_PRESETS = [
    { name: 'Elegant Serif', display: 'CormorantGaramond_700Bold', body: 'Lora_400Regular' },
    { name: 'Modern Sans', display: 'Inter_700Bold', body: 'Inter_400Regular' },
    { name: 'Monospace Tech', display: 'JetBrainsMono_700Bold', body: 'JetBrainsMono_400Regular' }
];

const ACCENT_PRESETS = [
    { name: 'Coral', color: '#d97757' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Pink', color: '#ec4899' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Teal', color: '#14b8a6' },
    { name: 'Red', color: '#ef4444' },
];

export default function ThemesScreen() {
    const colors = useThemeStore((s) => s.colors);
    const setActiveTheme = useThemeStore((s) => s.setActiveTheme);
    const activeThemeId = useThemeStore((s) => s.activeThemeId);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [showEditor, setShowEditor] = useState(false);
    const [editingTheme, setEditingTheme] = useState<ServerTheme | null>(null);
    const [themeForm, setThemeForm] = useState({ ...DEFAULT_DARK, name: '' });

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

    const createTheme = useMutation({
        mutationFn: (data: Partial<ServerTheme>) => api.createTheme(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            setShowEditor(false);
        }
    });

    const updateTheme = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<ServerTheme> }) => api.updateTheme(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            setShowEditor(false);
        }
    });

    const deleteTheme = useMutation({
        mutationFn: (id: number) => api.deleteTheme(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['themes'] })
    });

    const handleCreateNew = () => {
        setEditingTheme(null);
        setThemeForm({ ...DEFAULT_DARK, name: '' });
        setShowEditor(true);
    };

    const handleEditTheme = (theme: ServerTheme) => {
        setEditingTheme(theme);
        setThemeForm({
            name: theme.name,
            bg_color: theme.bg_color,
            surface_color: theme.surface_color,
            text_color: theme.text_color,
            secondary_text_color: theme.secondary_text_color,
            border_color: theme.border_color,
            accent_color: theme.accent_color,
            font_family_display: theme.font_family_display || 'Inter_700Bold',
            font_family_body: theme.font_family_body || 'Inter_400Regular'
        });
        setShowEditor(true);
    };

    const handleDeleteLine = (theme: ServerTheme) => {
        Alert.alert('Delete Theme', `Are you sure you want to delete ${theme.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTheme.mutate(theme.id) }
        ]);
    };

    const handleSaveTheme = () => {
        if (!themeForm.name.trim()) {
            Alert.alert('Error', 'Please enter a theme name');
            return;
        }

        if (editingTheme) {
            updateTheme.mutate({ id: editingTheme.id, data: themeForm });
        } else {
            createTheme.mutate(themeForm);
        }
    };

    const applyBaseTheme = (base: 'light' | 'dark') => {
        const preset = base === 'light' ? DEFAULT_LIGHT : DEFAULT_DARK;
        setThemeForm(prev => ({
            ...prev,
            bg_color: preset.bg_color,
            surface_color: preset.surface_color,
            text_color: preset.text_color,
            secondary_text_color: preset.secondary_text_color,
            border_color: preset.border_color
        }));
    };

    const categories = useMemo(() => {
        if (!themes) return { official: [], professional: [], custom: [] };
        return {
            official: themes.filter(t => t.is_default && (t.name === 'Riven' || t.name === 'Arctic Frost' || t.name === 'Modern Minimal' || t.name === 'Tech Innovation')),
            professional: themes.filter(t => t.is_default && !(t.name === 'Riven' || t.name === 'Arctic Frost' || t.name === 'Modern Minimal' || t.name === 'Tech Innovation')),
            custom: themes.filter(t => t.is_default === 0)
        };
    }, [themes]);

    const styles = makeStyles(colors);

    const renderCard = (theme: ServerTheme, isCustom: boolean) => {
        const isActive = theme.id === activeThemeId;
        return (
            <Pressable
                key={theme.id}
                style={[
                    styles.cardContainer,
                    isActive ? styles.cardContainerActive : undefined,
                    { backgroundColor: colors.surface }
                ]}
                onPress={() => activateTheme.mutate(theme.id)}
            >
                {/* Visual Preview */}
                <View style={[styles.cardPreview, { backgroundColor: theme.bg_color, borderColor: theme.border_color }]}>
                    <View style={[styles.cardSimText, { width: 40, top: 12, left: 12, backgroundColor: theme.text_color }]} />
                    <View style={[styles.cardSimText, { width: 30, top: 22, left: 12, backgroundColor: theme.text_color, opacity: 0.1 }]} />

                    <View style={[styles.cardSimInner, { backgroundColor: theme.surface_color, borderColor: theme.border_color }]}>
                        <View style={[styles.cardSimAccent, { backgroundColor: theme.accent_color }]} />
                        <View style={[styles.cardSimText, { width: '80%', opacity: 0.3, backgroundColor: theme.text_color }]} />
                        <View style={[styles.cardSimText, { width: '60%', opacity: 0.2, marginTop: 4, backgroundColor: theme.text_color }]} />
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardTitle, isActive && { color: colors.accent }]} numberOfLines={1}>{theme.name}</Text>
                        {isActive && (
                            <View style={styles.activeCheckmark}>
                                <Check size={12} color="#fff" />
                            </View>
                        )}
                    </View>

                    <View style={styles.cardPaletteRow}>
                        <View style={styles.paletteDots}>
                            <View style={[styles.paletteDot, { backgroundColor: theme.bg_color }]} />
                            <View style={[styles.paletteDot, { backgroundColor: theme.surface_color }]} />
                            <View style={[styles.paletteDot, { backgroundColor: theme.accent_color }]} />
                        </View>
                        <Text style={styles.fontDisplayPreview}>{theme.font_family_display.split('_')[0]}</Text>
                    </View>
                </View>

                {/* Custom Actions */}
                {isCustom && (
                    <View style={styles.customActions}>
                        <Pressable onPress={() => handleEditTheme(theme)} style={styles.actionBtn}>
                            <Edit3 size={14} color="#000" />
                        </Pressable>
                        <Pressable onPress={() => handleDeleteLine(theme)} style={[styles.actionBtn, { marginLeft: 6 }]}>
                            <Trash2 size={14} color="#ef4444" />
                        </Pressable>
                    </View>
                )}
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalBackground />

            <View style={styles.topNav}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
                    <ArrowLeft size={24} color={botanical.parchment} />
                </Pressable>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.headerArea}>
                        <View style={styles.atmosphereBadge}>
                            <Sparkles size={16} color={colors.accent} />
                            <Text style={styles.atmosphereText}>Atmosphere</Text>
                        </View>
                        <Text style={styles.mainTitle}>Themes</Text>
                        <Text style={styles.subtitle}>Elevate your focus with curated professional environments and custom palettes.</Text>

                        <Pressable style={styles.designBtn} onPress={handleCreateNew}>
                            <Plus size={20} color="#fff" />
                            <Text style={styles.designBtnText}>Design Yours</Text>
                        </Pressable>
                    </View>

                    {/* Foundation */}
                    {categories.official.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Foundation</Text>
                            <Text style={styles.sectionSubtitle}>Core Riven experiences</Text>
                            <View style={styles.grid}>
                                {categories.official.map(t => renderCard(t, false))}
                            </View>
                        </View>
                    )}

                    {/* Professional */}
                    {categories.professional.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.proRow}>
                                <Text style={styles.sectionTitle}>Professional Collection</Text>
                                <View style={styles.proBadge}>
                                    <Text style={styles.proBadgeText}>PRO</Text>
                                </View>
                            </View>
                            <Text style={styles.sectionSubtitle}>Masterfully crafted environments for deep work</Text>
                            <View style={styles.grid}>
                                {categories.professional.map(t => renderCard(t, false))}
                            </View>
                        </View>
                    )}

                    {/* Custom */}
                    {(categories.custom.length > 0 || true) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Your Creation</Text>
                            <Text style={styles.sectionSubtitle}>Themes handcrafted by you</Text>
                            <View style={styles.grid}>
                                {categories.custom.map(t => renderCard(t, true))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Editor Modal */}
            <Modal visible={showEditor} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingTheme ? 'Refine Theme' : 'New Creation'}</Text>
                            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Design System</Text>
                        </View>
                        <Pressable onPress={() => setShowEditor(false)} style={styles.closeBtn}>
                            <X size={24} color={colors.text} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {/* Name */}
                        <Text style={styles.label}>Identity</Text>
                        <TextInput
                            style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Theme Name..."
                            placeholderTextColor={colors.textSecondary}
                            value={themeForm.name}
                            onChangeText={(t) => setThemeForm({ ...themeForm, name: t })}
                        />

                        {/* Base */}
                        <Text style={[styles.label, { marginTop: spacing.xl }]}>Base Palette</Text>
                        <View style={styles.baseRow}>
                            <Pressable
                                style={[styles.baseBtn, { borderColor: themeForm.bg_color === DEFAULT_DARK.bg_color ? colors.accent : colors.border }]}
                                onPress={() => applyBaseTheme('dark')}
                            >
                                <Moon size={20} color={colors.text} />
                                <Text style={[styles.baseBtnText, { color: colors.text }]}>Deep</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.baseBtn, { borderColor: themeForm.bg_color === DEFAULT_LIGHT.bg_color ? colors.accent : colors.border }]}
                                onPress={() => applyBaseTheme('light')}
                            >
                                <Sun size={20} color={colors.text} />
                                <Text style={[styles.baseBtnText, { color: colors.text }]}>Bright</Text>
                            </Pressable>
                        </View>

                        {/* Accent */}
                        <Text style={[styles.label, { marginTop: spacing.xl }]}>Accent Color</Text>
                        <View style={styles.accentGrid}>
                            {ACCENT_PRESETS.map(p => (
                                <Pressable
                                    key={p.color}
                                    style={[
                                        styles.accentDot,
                                        { backgroundColor: p.color },
                                        themeForm.accent_color === p.color && styles.accentDotActive,
                                    ]}
                                    onPress={() => setThemeForm({ ...themeForm, accent_color: p.color })}
                                />
                            ))}
                        </View>

                        {/* Typography */}
                        <Text style={[styles.label, { marginTop: spacing.xl }]}>Typography</Text>
                        <View style={styles.fontList}>
                            {FONT_PRESETS.map(f => (
                                <Pressable
                                    key={f.name}
                                    style={[
                                        styles.fontItem,
                                        { borderColor: themeForm.font_family_display === f.display ? colors.accent : colors.border }
                                    ]}
                                    onPress={() => setThemeForm({ ...themeForm, font_family_display: f.display, font_family_body: f.body })}
                                >
                                    <View>
                                        <Text style={{ fontFamily: f.display, fontSize: 16, color: colors.text }}>{f.name}</Text>
                                        <Text style={{ fontFamily: f.body, fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>Preview text for body</Text>
                                    </View>
                                    {themeForm.font_family_display === f.display && <Check size={16} color={colors.accent} />}
                                </Pressable>
                            ))}
                        </View>

                    </ScrollView>

                    <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                        <Pressable style={styles.saveBtn} onPress={handleSaveTheme}>
                            <Text style={styles.saveBtnText}>{editingTheme ? 'Update Collection' : 'Add to Collection'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: botanical.ink },
        topNav: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        },
        backButton: {
            width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
            borderRadius: radii.full, backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] * 2 },

        headerArea: { marginVertical: spacing.xl },
        atmosphereBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
        atmosphereText: { fontFamily: fonts.mono, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: colors.accent },
        mainTitle: { fontFamily: fonts.displayBold, fontSize: 40, color: botanical.parchment, lineHeight: 44 },
        subtitle: { fontFamily: fonts.body, fontSize: 16, color: botanical.sepia, marginTop: spacing.sm, fontStyle: 'italic' },

        designBtn: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
            backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 24,
            borderRadius: radii.full, marginTop: spacing.xl, alignSelf: 'flex-start',
            shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
        },
        designBtnText: { fontFamily: fonts.mono, fontSize: 14, fontWeight: '700', color: '#fff' },

        section: { marginTop: spacing['2xl'] },
        proRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        sectionTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: botanical.parchment },
        proBadge: { backgroundColor: 'rgba(234, 179, 8, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full },
        proBadgeText: { fontSize: 9, fontWeight: '700', color: '#eab308', textTransform: 'uppercase' },
        sectionSubtitle: { fontFamily: fonts.body, fontSize: 14, color: botanical.sepia, marginTop: 4, marginBottom: spacing.lg, fontStyle: 'italic' },

        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },

        cardContainer: {
            width: '47%', borderRadius: radii['2xl'], borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)',
            padding: spacing.md, overflow: 'hidden', ...cardShadow,
        },
        cardContainerActive: { borderColor: colors.accent, backgroundColor: colors.accent + '05' },
        cardPreview: {
            aspectRatio: 4 / 3, borderRadius: radii.xl, borderWidth: 1,
            padding: spacing.sm, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: spacing.md
        },
        cardSimInner: {
            width: '100%', height: '66%', borderRadius: radii.md, borderWidth: 1, padding: 8,
            transform: [{ rotate: '-2deg' }], shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
        },
        cardSimText: { height: 4, borderRadius: 2, position: 'absolute', opacity: 0.2 },
        cardSimAccent: { width: '50%', height: 6, borderRadius: 3, marginBottom: 6 },

        cardFooter: { flex: 1, justifyContent: 'space-between' },
        cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
        cardTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.text, flex: 1 },
        activeCheckmark: { backgroundColor: colors.accent, padding: 2, borderRadius: radii.full, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 4 },

        cardPaletteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        paletteDots: { flexDirection: 'row', alignItems: 'center' },
        paletteDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', marginLeft: -4 },
        fontDisplayPreview: { fontFamily: fonts.mono, fontSize: 9, color: colors.textSecondary, opacity: 0.6, textTransform: 'uppercase' },

        customActions: { position: 'absolute', top: 12, right: 12, flexDirection: 'row' },
        actionBtn: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: radii.full, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },

        // Modal Styles
        modalContainer: { flex: 1 },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
        modalTitle: { fontFamily: fonts.displayBold, fontSize: 24 },
        modalSubtitle: { fontFamily: fonts.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
        closeBtn: { padding: spacing.sm, backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: radii.full },

        modalScroll: { padding: spacing.xl },
        label: { fontFamily: fonts.mono, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: colors.textSecondary, marginBottom: spacing.sm },
        nameInput: { fontFamily: fonts.displayBold, fontSize: 24, borderBottomWidth: 2, paddingVertical: spacing.sm },

        baseRow: { flexDirection: 'row', gap: spacing.md },
        baseBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderWidth: 2, borderRadius: radii.xl },
        baseBtnText: { fontFamily: fonts.displayBold, fontSize: 16 },

        accentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
        accentDot: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'transparent' },
        accentDotActive: { borderColor: '#fff', shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },

        fontList: { gap: spacing.md },
        fontItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderWidth: 2, borderRadius: radii.xl },

        modalFooter: { padding: spacing.xl, borderTopWidth: 1 },
        saveBtn: { backgroundColor: '#000', paddingVertical: spacing.xl, borderRadius: radii.xl, alignItems: 'center' },
        saveBtnText: { fontFamily: fonts.displayBold, fontSize: 18, color: '#fff' }
    });
}
