import { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sprout, TreeDeciduous, Flower2, Sun, Crown } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { spacing, radii, fontSize, cardShadow } from '../../src/constants/tokens';

const GARDEN_STAGES = [
    { days: 0, name: 'Barren Plot', icon: '🏜️', description: 'Your garden awaits its first seeds...' },
    { days: 1, name: 'Seeded Soil', icon: '🌱', description: 'The first seeds have been planted!' },
    { days: 3, name: 'Tiny Sprout', icon: '🌿', description: 'A small sprout peeks through the soil.' },
    { days: 7, name: 'Seedling', icon: '🪴', description: 'Your seedling is growing stronger.' },
    { days: 14, name: 'Young Plant', icon: '🌳', description: 'A young plant reaches for the sun.' },
    { days: 30, name: 'Budding Garden', icon: '🌸', description: 'Buds are forming on your plant!' },
    { days: 60, name: 'Blooming Garden', icon: '🌺', description: 'Your garden is in full bloom!' },
    { days: 100, name: 'Flourishing Oasis', icon: '🌴', description: 'An oasis of knowledge and growth.' },
    { days: 200, name: 'Enchanted Grove', icon: '🍀', description: 'A magical grove of wisdom.' },
    { days: 365, name: 'Ancient Forest', icon: '🌲', description: 'An ancient forest of learning.' },
    { days: 1000, name: 'Celestial Eden', icon: '✨', description: 'You have achieved paradise!' },
];

export default function GardenScreen() {
    const colors = useThemeStore((s) => s.colors);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const streakDays = (user?.streakData as Record<string, number>)?.currentStreak || 0;

    const currentStage = useMemo(() => {
        return [...GARDEN_STAGES].reverse().find((s) => streakDays >= s.days) || GARDEN_STAGES[0];
    }, [streakDays]);

    const nextStage = useMemo(() => {
        const idx = GARDEN_STAGES.findIndex((s) => s.name === currentStage.name);
        return idx < GARDEN_STAGES.length - 1 ? GARDEN_STAGES[idx + 1] : null;
    }, [currentStage]);

    const progressToNext = useMemo(() => {
        if (!nextStage) return 100;
        const currentMin = currentStage.days;
        const nextMin = nextStage.days;
        return Math.min(100, Math.round(((streakDays - currentMin) / (nextMin - currentMin)) * 100));
    }, [streakDays, currentStage, nextStage]);

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Garden</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Garden Visualization */}
                <View style={styles.gardenCard}>
                    <Text style={styles.gardenEmoji}>{currentStage.icon}</Text>
                    <Text style={styles.stageName}>{currentStage.name}</Text>
                    <Text style={styles.stageDesc}>{currentStage.description}</Text>

                    <View style={styles.streakBadge}>
                        <Sprout size={16} color={colors.accent} />
                        <Text style={styles.streakText}>{streakDays} day streak</Text>
                    </View>
                </View>

                {/* Progress to Next Stage */}
                {nextStage && (
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress to {nextStage.name}</Text>
                            <Text style={styles.progressPercent}>{progressToNext}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progressToNext}%` }]} />
                        </View>
                        <Text style={styles.progressDays}>
                            {nextStage.days - streakDays} more days needed
                        </Text>
                    </View>
                )}

                {/* All Stages */}
                <Text style={styles.sectionTitle}>All Stages</Text>
                {GARDEN_STAGES.map((stage) => {
                    const isUnlocked = streakDays >= stage.days;
                    const isCurrent = stage.name === currentStage.name;

                    return (
                        <View
                            key={stage.name}
                            style={[
                                styles.stageItem,
                                isCurrent && styles.stageItemCurrent,
                                !isUnlocked && styles.stageItemLocked,
                            ]}
                        >
                            <Text style={styles.stageEmoji}>{isUnlocked ? stage.icon : '🔒'}</Text>
                            <View style={styles.stageInfo}>
                                <Text style={[styles.stageItemName, !isUnlocked && { color: colors.textSecondary }]}>
                                    {stage.name}
                                </Text>
                                <Text style={styles.stageDays}>{stage.days} days</Text>
                            </View>
                            {isCurrent && (
                                <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>Current</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        },
        title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'], gap: spacing.md },
        gardenCard: {
            backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl,
            alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...cardShadow,
        },
        gardenEmoji: { fontSize: 80 },
        stageName: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text, marginTop: spacing.md },
        stageDesc: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
        streakBadge: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
            backgroundColor: colors.accent + '20', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
            borderRadius: radii.full, marginTop: spacing.md,
        },
        streakText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.accent },
        progressCard: {
            backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md,
            borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
        },
        progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        progressLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
        progressPercent: { fontSize: fontSize.sm, fontWeight: '600', color: colors.accent },
        progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
        progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
        progressDays: { fontSize: fontSize.xs, color: colors.textSecondary },
        sectionTitle: {
            fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary,
            textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md,
        },
        stageItem: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md,
            borderWidth: 1, borderColor: colors.border,
        },
        stageItemCurrent: { borderColor: colors.accent, borderWidth: 2 },
        stageItemLocked: { opacity: 0.5 },
        stageEmoji: { fontSize: 28 },
        stageInfo: { flex: 1 },
        stageItemName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        stageDays: { fontSize: fontSize.xs, color: colors.textSecondary },
        currentBadge: {
            backgroundColor: colors.accent + '20', paddingHorizontal: spacing.sm, paddingVertical: 2,
            borderRadius: radii.full,
        },
        currentBadgeText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.accent },
    });
}
