import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { fonts, spacing, radii, fontSize, botanical } from '../src/constants/tokens';
import { GARDEN_STAGES } from '../src/utils/gardenUtils';
import { api } from '../src/lib/api';

export default function GardenSettingsScreen() {
    const colors = useThemeStore((s) => s.colors);
    const user = useAuthStore((s) => s.user);
    const { loadToken } = useAuthStore.getState();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [overrideEnabled, setOverrideEnabled] = useState(user?.petCustomization ? true : false);
    const [selectedStage, setSelectedStage] = useState(
        user?.petCustomization ? parseInt(user.petCustomization) : -1
    );

    const updateProfile = useMutation({
        mutationFn: (data: { petCustomization: string | null }) => api.updateProfile(data),
        onSuccess: async () => {
            await loadToken(); // Refresh auth store with new profile data
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });

    const handleSave = () => {
        const val = overrideEnabled && selectedStage >= 0 ? selectedStage.toString() : null;
        updateProfile.mutate({ petCustomization: val });
    };

    const styles = makeStyles(colors);

    // Only owners can access this
    if (!user?.isOwner) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>UNAUTHORIZED</Text>
                    <Text style={styles.emptyDesc}>This area is reserved for head archivists only.</Text>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>RETURN</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Garden Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Stage Override</Text>
                    <Text style={styles.description}>
                        As an owner, you can manually set your exhibited garden stage independent of your actual study streak.
                    </Text>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Enable Override</Text>
                        <Switch
                            value={overrideEnabled}
                            onValueChange={(v) => {
                                setOverrideEnabled(v);
                                if (!v) {
                                    updateProfile.mutate({ petCustomization: null });
                                }
                            }}
                            trackColor={{ false: colors.border, true: botanical.forest }}
                            thumbColor={colors.text}
                        />
                    </View>
                </View>

                {overrideEnabled && (
                    <View style={styles.grid}>
                        {GARDEN_STAGES.map((stage, i) => (
                            <Pressable
                                key={i}
                                style={[styles.stageItem, selectedStage === i && styles.stageItemActive]}
                                onPress={() => setSelectedStage(i)}
                            >
                                <Text style={styles.stageIcon}>{stage.icon}</Text>
                                <Text style={[styles.stageName, selectedStage === i && { color: colors.accent }]}>
                                    {stage.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {overrideEnabled && (
                    <Pressable
                        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
                        onPress={handleSave}
                        disabled={updateProfile.isPending}
                    >
                        {updateProfile.isPending ? (
                            <ActivityIndicator color={botanical.ink} />
                        ) : (
                            <Text style={styles.saveBtnText}>SAVE OVERRIDE</Text>
                        )}
                    </Pressable>
                )}
            </ScrollView>
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
        title: { fontFamily: fonts.bodyBold, fontSize: fontSize.xl, color: colors.text },
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['3xl'], gap: spacing.md },
        empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
        emptyTitle: { fontFamily: fonts.monoBold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md, letterSpacing: 2 },
        emptyDesc: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
        backBtn: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
        backBtnText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.text },
        card: {
            backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md,
            borderWidth: 1, borderColor: colors.border,
        },
        sectionTitle: { fontFamily: 'Lora_700Bold', fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.sm },
        description: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
        settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        settingLabel: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.text },
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
        stageItem: {
            width: '48%', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md,
            borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.sm,
        },
        stageItemActive: { borderColor: colors.accent, backgroundColor: colors.surface + '80' },
        stageIcon: { fontSize: 32 },
        stageName: { fontFamily: fonts.mono, fontSize: 10, textAlign: 'center', color: colors.textSecondary, textTransform: 'uppercase' },
        saveBtn: {
            backgroundColor: colors.accent, paddingVertical: spacing.md, borderRadius: radii.lg,
            alignItems: 'center', marginTop: spacing.lg,
        },
        saveBtnText: { fontFamily: fonts.monoBold, fontSize: fontSize.md, color: botanical.ink, letterSpacing: 1.5 },
    });
}
