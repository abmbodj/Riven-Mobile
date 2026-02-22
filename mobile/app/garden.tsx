import { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Trophy, Sprout, Palette } from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { spacing, radii, fontSize, cardShadow, fonts, botanical } from '../src/constants/tokens';
import GardenMasterpiece, { getStageIndex } from '../src/components/GardenMasterpiece';
import GlobalBackground from '../src/components/GlobalBackground';

// Stage definitions (matches PWA gardenCustomization.js exactly)
const gardenStages = [
    { minDays: 0, name: 'Barren Plot', description: 'A small patch of dirt waiting for seeds' },
    { minDays: 1, name: 'Sprouting Seeds', description: 'Tiny green sprouts peek through the soil' },
    { minDays: 3, name: 'Young Seedlings', description: 'Small plants reaching for the sun' },
    { minDays: 7, name: 'Growing Garden', description: 'A variety of young plants taking shape' },
    { minDays: 14, name: 'Blooming Patch', description: 'Colorful flowers begin to bloom' },
    { minDays: 30, name: 'Flourishing Garden', description: 'A lush garden full of life' },
    { minDays: 60, name: 'Thriving Oasis', description: 'A beautiful sanctuary of nature' },
    { minDays: 100, name: 'Enchanted Grove', description: 'A magical garden with rare flora' },
    { minDays: 200, name: 'Paradise Garden', description: 'A slice of paradise on earth' },
    { minDays: 365, name: 'Eternal Eden', description: 'The legendary Garden of Eden itself' },
    { minDays: 1000, name: 'Celestial Eden', description: 'A garden touched by the divine' },
];

function getGardenStage(streak: number) {
    let stage = gardenStages[0];
    for (const s of gardenStages) {
        if (streak >= s.minDays) stage = s;
        else break;
    }
    return stage;
}

function getStatusMessage(streakData: any) {
    const status = streakData?.status;
    const studiedToday = streakData?.studiedToday;
    const hoursRemaining = streakData?.hoursRemaining;
    if (status === 'broken') return 'Study to revive your garden!';
    if (status === 'at-risk') return `${Math.round(hoursRemaining || 0)}h left to water your garden`;
    if (studiedToday) return 'Garden is thriving!';
    return 'Study to grow your garden';
}

function getLast7Days(currentStreak: number) {
    const days: { label: string; active: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const isActive = currentStreak > i;
        days.push({ label: dayNames[d.getDay()], active: isActive, isToday: i === 0 });
    }
    return days;
}

export default function GardenScreen() {
    const colors = useThemeStore((s) => s.colors);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const streakData = user?.streakData as Record<string, any> || {};
    const currentStreak = streakData?.currentStreak || 0;
    const longestStreak = streakData?.longestStreak || 0;
    const isOwner = user?.isOwner || false;

    const [stageOverride, setStageOverride] = useState<number | null>(null);

    const effectiveStreak = stageOverride !== null
        ? gardenStages[stageOverride].minDays
        : currentStreak;

    const stage = getGardenStage(effectiveStreak);
    const currentStageIndex = getStageIndex(currentStreak);
    const weekDays = useMemo(() => getLast7Days(currentStreak), [currentStreak]);

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalBackground />
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header — centered like PWA */}
                <View style={styles.headerCenter}>
                    <Text style={styles.title}>My Garden</Text>
                    <Text style={styles.subtitle}>{getStatusMessage(streakData)}</Text>
                </View>

                {/* Garden Preview Card */}
                <View style={styles.gardenCard}>
                    {/* Corner marks */}
                    <View style={[styles.cornerMark, { top: 12, left: 12, borderTopWidth: 1, borderLeftWidth: 1 }]} />
                    <View style={[styles.cornerMark, { top: 12, right: 12, borderTopWidth: 1, borderRightWidth: 1 }]} />
                    <View style={[styles.cornerMark, { bottom: 12, left: 12, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
                    <View style={[styles.cornerMark, { bottom: 12, right: 12, borderBottomWidth: 1, borderRightWidth: 1 }]} />

                    <GardenMasterpiece
                        streak={effectiveStreak}
                        size="xl"
                        style={{ marginVertical: spacing.md }}
                    />

                    <Text style={styles.stageName}>{stage.name}</Text>
                    <Text style={styles.stageDesc}>{stage.description}</Text>
                </View>

                {/* 7-Day Activity Bar */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>THIS WEEK</Text>
                    <View style={styles.weekRow}>
                        {weekDays.map((day, i) => (
                            <View key={i} style={styles.dayCol}>
                                <View style={[
                                    styles.dayBox,
                                    day.active && styles.dayBoxActive,
                                    day.isToday && styles.dayBoxToday,
                                ]}>
                                    {day.active && <Text style={styles.dayCheckmark}>✓</Text>}
                                </View>
                                <Text style={[
                                    styles.dayLabel,
                                    day.isToday && styles.dayLabelToday,
                                ]}>{day.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats Cards — 2 columns */}
                <View style={styles.statsRow}>
                    <View style={[styles.card, styles.statCard]}>
                        <Text style={styles.statValue}>{currentStreak}</Text>
                        <Text style={styles.cardLabel}>CURRENT STREAK</Text>
                    </View>
                    <View style={[styles.card, styles.statCard]}>
                        <Text style={[styles.statValue, { color: '#EAB308' }]}>{longestStreak}</Text>
                        <Text style={styles.cardLabel}>BEST STREAK</Text>
                        <Text style={styles.statSub}>Personal Record</Text>
                    </View>
                </View>

                {/* Time Status — only shown when not broken */}
                {streakData?.status !== 'broken' && (
                    <View style={styles.card}>
                        <View style={styles.timeRow}>
                            <View style={[
                                styles.timeIconWrap,
                                streakData?.status === 'at-risk' && { backgroundColor: 'rgba(234,179,8,0.12)' }
                            ]}>
                                <Clock
                                    size={16}
                                    color={streakData?.status === 'at-risk' ? '#EAB308' : colors.accent}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.timeTitle}>
                                    {streakData?.studiedToday ? 'Studied Today ✓' : 'Garden Needs Care'}
                                </Text>
                                <Text style={styles.timeSub}>
                                    {(streakData?.hoursRemaining || 0) > 0
                                        ? `${Math.round(streakData.hoursRemaining)}h until garden wilts`
                                        : 'Study now to keep growing!'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Stage Override (Owner) / Stage Selector (User) */}
                {(isOwner || currentStreak >= gardenStages[1].minDays) && (
                    <View style={[
                        styles.overrideCard,
                        isOwner ? styles.overrideOwner : styles.overrideUser,
                    ]}>
                        {isOwner && (
                            <View style={styles.ownerTag}>
                                <Text style={styles.ownerTagText}>OWNER</Text>
                            </View>
                        )}
                        <View style={styles.overrideHeader}>
                            <View style={[
                                styles.overrideIconWrap,
                                isOwner ? { backgroundColor: 'rgba(234,179,8,0.2)' } : { backgroundColor: `${colors.accent}20` },
                            ]}>
                                <Palette size={16} color={isOwner ? '#EAB308' : colors.accent} />
                            </View>
                            <View>
                                <Text style={[styles.overrideTitle, isOwner && { color: '#EAB308' }]}>
                                    {isOwner ? 'Stage Override' : 'Select Garden Stage'}
                                </Text>
                                <Text style={[styles.overrideSub, isOwner && { color: 'rgba(234,179,8,0.7)' }]}>
                                    {isOwner ? 'Manually select any garden stage (0-10)' : 'Revisit stages you have unlocked'}
                                </Text>
                            </View>
                        </View>

                        {/* Stage selector dots */}
                        <View style={styles.stageDots}>
                            {Array.from({ length: (isOwner ? 11 : currentStageIndex + 1) }).map((_, i) => {
                                const isSelected = (stageOverride ?? currentStageIndex) === i;
                                const dotColor = isOwner ? '#EAB308' : colors.accent;
                                return (
                                    <Pressable
                                        key={i}
                                        onPress={() => setStageOverride(i)}
                                        style={[
                                            styles.stageDot,
                                            isSelected && { backgroundColor: dotColor, borderColor: dotColor },
                                            !isSelected && { borderColor: `${dotColor}50` },
                                        ]}
                                    >
                                        <Text style={[styles.stageDotText, isSelected && { color: '#000' }]}>{i}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={[styles.currentlyShowing, isOwner && { color: '#FBBF24' }]}>
                            Currently showing: {stageOverride != null ? gardenStages[stageOverride].name : 'Current Max Stage'}
                        </Text>

                        {stageOverride != null && (
                            <Pressable onPress={() => setStageOverride(null)}>
                                <Text style={styles.resetLink}>
                                    Reset to Natural Streak ({currentStreak})
                                </Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {/* Garden Memories Button */}
                <Pressable style={styles.memoriesBtn} onPress={() => router.push('/garden-settings')}>
                    <View style={styles.memoriesIconWrap}>
                        <Trophy size={20} color="#EAB308" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.memoriesTitle}>Garden Memories</Text>
                        <Text style={styles.memoriesSub}>View your past gardens & achievements</Text>
                    </View>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        scroll: { paddingHorizontal: spacing.md, paddingBottom: 120 },

        headerCenter: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
        title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.text, fontStyle: 'italic' },
        subtitle: { fontFamily: fonts.mono, fontSize: 12, color: botanical.sepia, letterSpacing: 0.5, marginTop: 4 },

        gardenCard: {
            borderRadius: radii['2xl'],
            padding: spacing.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
            position: 'relative',
            backgroundColor: 'rgba(122,158,114,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(122,158,114,0.08)',
        },
        cornerMark: {
            position: 'absolute',
            width: 12,
            height: 12,
            borderColor: `${colors.accent}25`,
        },
        stageName: { fontFamily: fonts.displayBold, fontSize: fontSize.lg, color: colors.text, fontStyle: 'italic', marginTop: spacing.md },
        stageDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },

        card: {
            borderRadius: radii.xl,
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cardLabel: {
            fontFamily: fonts.mono,
            fontSize: 10,
            color: botanical.sepia,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: spacing.sm,
        },
        weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
        dayCol: { flex: 1, alignItems: 'center', gap: 6 },
        dayBox: {
            width: 28, height: 28, borderRadius: radii.sm,
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: colors.bg,
        },
        dayBoxActive: { backgroundColor: `${colors.accent}20` },
        dayBoxToday: { borderWidth: 1, borderColor: `${colors.accent}50` },
        dayCheckmark: { fontFamily: fonts.mono, fontSize: 10, color: colors.accent },
        dayLabel: { fontFamily: fonts.mono, fontSize: 9, color: `${colors.textSecondary}90` },
        dayLabelToday: { color: colors.accent, fontFamily: fonts.monoBold },

        statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
        statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
        statValue: { fontFamily: fonts.displayBold, fontSize: 32, color: colors.accent, marginBottom: 4 },
        statSub: { fontFamily: fonts.mono, fontSize: 9, color: `${colors.textSecondary}80`, marginTop: spacing.sm },

        timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
        timeIconWrap: {
            width: 36, height: 36, borderRadius: radii.sm,
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: `${colors.accent}15`,
        },
        timeTitle: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.text },
        timeSub: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, marginTop: 2 },

        overrideCard: {
            borderRadius: radii['2xl'],
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 2,
            position: 'relative',
            overflow: 'hidden',
        },
        overrideOwner: { borderColor: 'rgba(234,179,8,0.3)', backgroundColor: 'rgba(234,179,8,0.05)' },
        overrideUser: { borderColor: `${colors.accent}50`, backgroundColor: `${colors.accent}08` },
        ownerTag: {
            position: 'absolute', top: 0, right: 0,
            backgroundColor: '#EAB308',
            paddingHorizontal: 8, paddingVertical: 2,
            borderBottomLeftRadius: radii.sm,
        },
        ownerTagText: { fontFamily: fonts.monoBold, fontSize: 10, color: '#fff' },
        overrideHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
        overrideIconWrap: { width: 32, height: 32, borderRadius: radii.sm, justifyContent: 'center', alignItems: 'center' },
        overrideTitle: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.accent },
        overrideSub: { fontFamily: fonts.mono, fontSize: 11, color: `${colors.accent}AA`, marginTop: 2 },
        stageDots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md, justifyContent: 'center' },
        stageDot: {
            width: 36, height: 36, borderRadius: 18,
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, backgroundColor: 'transparent',
        },
        stageDotText: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.textSecondary },
        currentlyShowing: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.text, textAlign: 'center', fontStyle: 'italic', marginTop: spacing.sm },
        resetLink: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, textDecorationLine: 'underline', textAlign: 'center', marginTop: spacing.sm },

        memoriesBtn: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.xl,
        },
        memoriesIconWrap: {
            width: 40, height: 40, borderRadius: radii.sm,
            backgroundColor: 'rgba(234,179,8,0.12)',
            justifyContent: 'center', alignItems: 'center',
        },
        memoriesTitle: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.text },
        memoriesSub: { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    });
}
