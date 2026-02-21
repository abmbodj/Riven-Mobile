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
import { ArrowLeft, Sprout } from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { spacing, radii, fontSize, cardShadow, fonts, botanical } from '../src/constants/tokens';
import { default as GardenMasterpiece } from '../src/components/GardenMasterpiece';
import GlobalBackground from '../src/components/GlobalBackground';

const GARDEN_STAGES = [
    { days: 0, name: 'Barren Plot', icon: '0', description: 'Your garden awaits its first seeds...' },
    { days: 1, name: 'Seeded Soil', icon: '1', description: 'The first seeds have been planted!' },
    { days: 3, name: 'Tiny Sprout', icon: '2', description: 'A small sprout peeks through the soil.' },
    { days: 7, name: 'Seedling', icon: '3', description: 'Your seedling is growing stronger.' },
    { days: 14, name: 'Young Plant', icon: '4', description: 'A young plant reaches for the sun.' },
    { days: 30, name: 'Budding Garden', icon: '5', description: 'Buds are forming on your plant!' },
    { days: 60, name: 'Blooming Garden', icon: '6', description: 'Your garden is in full bloom!' },
    { days: 100, name: 'Flourishing Oasis', icon: '7', description: 'An oasis of knowledge and growth.' },
    { days: 200, name: 'Enchanted Grove', icon: '8', description: 'A magical grove of wisdom.' },
    { days: 365, name: 'Ancient Forest', icon: '9', description: 'An ancient forest of learning.' },
    { days: 1000, name: 'Celestial Eden', icon: '10', description: 'You have achieved paradise!' },
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
            <GlobalBackground />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
                    <ArrowLeft size={24} color={botanical.parchment} />
                </Pressable>
                <Text style={styles.title}>Your Garden</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Garden Visualization */}
                <View style={styles.gardenCard}>
                    <GardenMasterpiece streak={streakDays} size="xl" style={{ marginVertical: spacing.lg }} />
                    <Text style={styles.stageName}>{currentStage.name}</Text>
                    <Text style={styles.stageDesc}>{currentStage.description}</Text>

                    <View style={styles.streakBadge}>
                        <Sprout size={16} color={botanical.forest} />
                        <Text style={styles.streakText}>{streakDays} day streak</Text>
                    </View>
                </View>

                {/* Progress to Next Stage */}
                {nextStage ? (
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
                ) : (
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Maximum Stage Reached!</Text>
                            <Text style={styles.progressPercent}>100%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `100%` }]} />
                        </View>
                        <Text style={styles.progressDays}>
                            You have achieved the highest form of enlightenment.
                        </Text>
                    </View>
                )}

                {/* All Stages */}
                <Text style={styles.sectionTitle}>Evolution Log</Text>
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
                            <View style={styles.stageIconContainer}>
                                <GardenMasterpiece streak={stage.days} size="sm" />
                            </View>
                            <View style={styles.stageInfo}>
                                <Text style={[styles.stageItemName, !isUnlocked && { color: 'rgba(244, 241, 232, 0.5)' }]}>
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
        container: { flex: 1, backgroundColor: botanical.ink },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: radii.full,
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
        },
        title: { fontFamily: fonts.displayBold, fontSize: fontSize['2xl'], color: botanical.parchment },
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'] * 2, gap: spacing.md },
        gardenCard: {
            backgroundColor: 'rgba(252, 250, 242, 0.03)',
            borderRadius: radii['2xl'],
            padding: spacing.xl,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            ...cardShadow,
        },
        stageName: { fontFamily: fonts.displayBold, fontSize: fontSize['3xl'], color: botanical.parchment, marginTop: spacing.md },
        stageDesc: { fontFamily: fonts.display, fontSize: fontSize.md, color: botanical.sepia, textAlign: 'center', marginTop: spacing.xs, fontStyle: 'italic' },
        streakBadge: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            backgroundColor: 'rgba(122,158,114,0.15)',
            paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
            borderRadius: radii.full, marginTop: spacing.xl,
            borderWidth: 1, borderColor: 'rgba(122,158,114,0.25)',
        },
        streakText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: botanical.forest, textTransform: 'uppercase', letterSpacing: 1 },
        progressCard: {
            backgroundColor: 'rgba(252, 250, 242, 0.03)',
            borderRadius: radii.xl, padding: spacing.lg,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: spacing.md,
        },
        progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        progressLabel: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: botanical.sepia, textTransform: 'uppercase', letterSpacing: 1 },
        progressPercent: { fontFamily: fonts.displayBold, fontSize: fontSize.lg, color: botanical.forest },
        progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radii.full, overflow: 'hidden' },
        progressFill: { height: '100%', backgroundColor: botanical.forest, borderRadius: radii.full },
        progressDays: { fontFamily: fonts.display, fontSize: fontSize.sm, color: botanical.sepia, fontStyle: 'italic' },
        sectionTitle: {
            fontFamily: fonts.mono, fontSize: fontSize.sm, color: botanical.sepia,
            textTransform: 'uppercase', letterSpacing: 2, marginTop: spacing.xl, marginBottom: spacing.xs,
            paddingHorizontal: spacing.xs,
        },
        stageItem: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            backgroundColor: 'rgba(252, 250, 242, 0.03)', borderRadius: radii.xl, padding: spacing.md,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        },
        stageItemCurrent: { borderColor: botanical.forest, backgroundColor: 'rgba(122,158,114,0.05)' },
        stageItemLocked: { opacity: 0.5 },
        stageIconContainer: {
            width: 50, height: 50, borderRadius: radii.lg, overflow: 'hidden',
            justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
        },
        stageInfo: { flex: 1 },
        stageItemName: { fontFamily: fonts.displayBold, fontSize: fontSize.lg, color: botanical.parchment },
        stageDays: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: botanical.sepia, marginTop: 4 },
        currentBadge: {
            backgroundColor: 'rgba(122,158,114,0.15)', paddingHorizontal: spacing.md, paddingVertical: 4,
            borderRadius: radii.full, borderWidth: 1, borderColor: 'rgba(122,158,114,0.3)',
        },
        currentBadgeText: { fontFamily: fonts.mono, fontSize: 10, color: botanical.forest, textTransform: 'uppercase', letterSpacing: 1 },
    });
}
