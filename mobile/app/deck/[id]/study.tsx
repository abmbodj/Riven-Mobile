import { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    CheckCircle,
    X,
    Shuffle,
    ChevronLeft,
    ChevronRight,
    Brain,
} from 'lucide-react-native';
import { useThemeStore } from '../../../src/stores/themeStore';
import { api, Card } from '../../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../../src/constants/tokens';
import GlobalBackground from '../../../src/components/GlobalBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StudyModeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const deckId = parseInt(id);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);

    const flipAnim = useRef(new Animated.Value(0)).current;

    const { data: deck } = useQuery({
        queryKey: ['deck', deckId],
        queryFn: () => api.getDeck(deckId),
        enabled: !!deckId,
    });

    const cards = deck?.cards || [];
    const currentCard = cards[currentIndex];

    const flipCard = useCallback(() => {
        const toValue = isFlipped ? 0 : 1;
        Animated.spring(flipAnim, {
            toValue,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
        }).start();
        setIsFlipped(!isFlipped);
    }, [isFlipped, flipAnim]);

    const handleAnswer = useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            setCorrect((c) => c + 1);
        } else {
            setIncorrect((c) => c + 1);
        }

        if (currentIndex < cards.length - 1) {
            setCurrentIndex((i) => i + 1);
            setIsFlipped(false);
            flipAnim.setValue(0);
        } else {
            setSessionComplete(true);
        }
    }, [currentIndex, cards.length, flipAnim]);

    const resetSession = useCallback(() => {
        setCurrentIndex(0);
        setCorrect(0);
        setIncorrect(0);
        setIsFlipped(false);
        setSessionComplete(false);
        flipAnim.setValue(0);
    }, [flipAnim]);

    const frontRotate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });
    const backRotate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });
    const frontOpacity = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
    });
    const backOpacity = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const styles = makeStyles(colors);

    // Session complete screen
    if (sessionComplete) {
        const total = correct + incorrect;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

        return (
            <SafeAreaView style={styles.container}>
                <GlobalBackground />
                <View style={styles.completeContainer}>
                    <Text style={styles.completeTitle}>Session complete</Text>
                    <Text style={styles.completeSubtitle}>
                        {correct}/{total} correct · {percentage}%
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{correct}</Text>
                            <Text style={styles.statLabel}>Correct</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{incorrect}</Text>
                            <Text style={styles.statLabel}>Incorrect</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: colors.accent }]}>{percentage}%</Text>
                            <Text style={styles.statLabel}>Score</Text>
                        </View>
                    </View>

                    <View style={styles.completeActions}>
                        <Pressable
                            style={({ pressed }) => [styles.completeButton, pressed && { transform: [{ scale: 0.97 }] }]}
                            onPress={resetSession}
                        >
                            <Text style={styles.completeButtonText}>Study Again</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.completeButtonOutline, pressed && { transform: [{ scale: 0.98 }] }]}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.completeButtonOutlineText}>Back to Deck</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <GlobalBackground />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerButton}>
                    <X size={20} color={colors.textSecondary} />
                </Pressable>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentIndex + 1) / cards.length) * 100}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {currentIndex + 1} / {cards.length}
                    </Text>
                </View>

                <Pressable style={styles.headerButton}>
                    <Shuffle size={20} color={colors.textSecondary} />
                </Pressable>
            </View>

            {/* Spaced Repetition Toggle */}
            <View style={styles.srContainer}>
                <Pressable style={styles.srToggle}>
                    <Brain size={14} color={colors.textSecondary} />
                    <Text style={styles.srText}>Spaced Repetition OFF</Text>
                </Pressable>
            </View>

            {/* Flashcard */}
            {currentCard && (
                <View style={styles.cardContainer}>
                    <Pressable onPress={flipCard} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <View style={{ width: '100%', maxWidth: 340, aspectRatio: 3 / 4 }}>
                            <Animated.View
                                style={[
                                    styles.card,
                                    styles.cardFrontContainer,
                                    {
                                        transform: [{ perspective: 1200 }, { rotateY: frontRotate }],
                                        opacity: frontOpacity,
                                    },
                                ]}
                            >
                                <Text style={styles.cardLabel}>Question</Text>
                                <Text style={styles.cardTextFront} adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={8}>{currentCard.front}</Text>
                                <Text style={styles.tapHint}>tap to reveal</Text>
                            </Animated.View>
                            <Animated.View
                                style={[
                                    styles.card,
                                    styles.cardBackContainer,
                                    {
                                        transform: [{ perspective: 1200 }, { rotateY: backRotate }],
                                        opacity: backOpacity,
                                    },
                                ]}
                            >
                                <Text style={styles.cardLabelBack}>Answer</Text>
                                <Text style={styles.cardTextBack} adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={8}>{currentCard.back}</Text>
                                <Text style={styles.tapHintBack}>tap to flip back</Text>
                            </Animated.View>
                        </View>
                    </Pressable>
                </View>
            )}

            {/* Answer Buttons */}
            <View style={styles.navigationOptions}>
                {isFlipped ? (
                    <View style={styles.answerButtons}>
                        <Pressable
                            style={({ pressed }) => [styles.answerButton, styles.incorrectButton, pressed && { transform: [{ scale: 0.93 }] }]}
                            onPress={() => handleAnswer(false)}
                        >
                            <ThumbsDown size={20} color="#f87171" />
                            <Text style={styles.incorrectButtonText}>Didn't Know</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.answerButton, styles.correctButton, pressed && { transform: [{ scale: 0.93 }] }]}
                            onPress={() => handleAnswer(true)}
                        >
                            <ThumbsUp size={20} color="#4ade80" />
                            <Text style={styles.correctButtonText}>Knew It</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.navButtons}>
                        <Pressable
                            style={({ pressed }) => [styles.navIconButton, pressed && { transform: [{ scale: 0.9 }] }, currentIndex === 0 && { opacity: 0.3 }]}
                            disabled={currentIndex === 0}
                            onPress={() => setCurrentIndex(i => i - 1)}
                        >
                            <ChevronLeft size={24} color={colors.textSecondary} />
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.flipButton, pressed && { transform: [{ scale: 0.95 }] }]}
                            onPress={flipCard}
                        >
                            <RotateCcw size={20} color={colors.textSecondary} />
                            <Text style={styles.flipButtonText}>Flip</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.navIconButton, pressed && { transform: [{ scale: 0.9 }] }, currentIndex === cards.length - 1 && { opacity: 0.3 }]}
                            disabled={currentIndex === cards.length - 1}
                            onPress={() => setCurrentIndex(i => i + 1)}
                        >
                            <ChevronRight size={24} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: botanical.ink },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            height: 56,
        },
        headerButton: {
            padding: spacing.sm,
            marginLeft: -spacing.sm,
        },
        progressContainer: {
            flex: 1,
            marginHorizontal: spacing.lg,
            alignItems: 'center',
        },
        progressBar: {
            height: 4,
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: botanical.forest,
            borderRadius: 2
        },
        progressText: {
            fontFamily: fonts.mono,
            fontSize: 10,
            color: botanical.sepia,
            marginTop: 6,
            letterSpacing: 0.5,
        },
        srContainer: {
            alignItems: 'center',
            marginVertical: spacing.sm,
        },
        srToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: 6,
            borderRadius: radii.full,
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
        },
        srText: {
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.textSecondary,
            letterSpacing: 0.5,
        },
        cardContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        card: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: radii['2xl'],
            padding: spacing.xl,
            justifyContent: 'center',
            alignItems: 'center',
            backfaceVisibility: 'hidden',
            ...cardShadow,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
        },
        cardFrontContainer: {
            backgroundColor: '#152d34',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
        },
        cardBackContainer: {
            backgroundColor: botanical.forest,
            borderWidth: 1,
            borderColor: 'rgba(122,158,114,0.25)',
        },
        cardLabel: {
            position: 'absolute',
            top: spacing.xl,
            fontFamily: fonts.mono,
            fontSize: 9,
            color: botanical.sepia,
            textTransform: 'uppercase',
            letterSpacing: 2,
            transform: [{ rotate: '-2deg' }],
        },
        cardLabelBack: {
            position: 'absolute',
            top: spacing.xl,
            fontFamily: fonts.mono,
            fontSize: 9,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: 2,
            transform: [{ rotate: '-2deg' }],
        },
        cardTextFront: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize['2xl'],
            color: botanical.parchment,
            textAlign: 'center',
            lineHeight: 32,
        },
        cardTextBack: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize['2xl'],
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 32,
        },
        tapHint: {
            position: 'absolute',
            bottom: spacing.xl,
            fontFamily: fonts.mono,
            fontSize: 10,
            color: 'rgba(244, 241, 232, 0.5)',
            letterSpacing: 0.5,
        },
        tapHintBack: {
            position: 'absolute',
            bottom: spacing.xl,
            fontFamily: fonts.mono,
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: 0.5,
        },
        navigationOptions: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing['2xl'],
        },
        answerButtons: {
            flexDirection: 'row',
            gap: spacing.md,
            maxWidth: 380,
            alignSelf: 'center',
            width: '100%',
        },
        answerButton: {
            flex: 1,
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.xl,
            gap: spacing.sm,
            borderWidth: 1,
        },
        incorrectButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'rgba(239, 68, 68, 0.25)',
        },
        correctButton: {
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            borderColor: 'rgba(34, 197, 94, 0.25)',
        },
        incorrectButtonText: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.md,
            color: '#f87171'
        },
        correctButtonText: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.md,
            color: '#4ade80'
        },
        navButtons: {
            flexDirection: 'row',
            gap: spacing.md,
            justifyContent: 'center',
            alignItems: 'center',
        },
        navIconButton: {
            width: 56,
            height: 56,
            borderRadius: radii.xl,
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        flipButton: {
            height: 56,
            paddingHorizontal: spacing['2xl'],
            borderRadius: radii.xl,
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.sm,
        },
        flipButtonText: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.md,
            color: botanical.parchment,
        },
        completeContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            gap: spacing.md,
        },
        completeTitle: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize['2xl'],
            color: botanical.parchment,
            fontStyle: 'italic',
        },
        completeSubtitle: {
            fontFamily: fonts.mono,
            fontSize: fontSize.xs,
            color: botanical.sepia,
            marginTop: 4,
        },
        statsRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
        statCard: {
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderRadius: radii.lg,
            padding: spacing.lg,
            alignItems: 'center',
            flex: 1,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
        },
        statNumber: { fontFamily: fonts.displayBold, fontSize: fontSize['2xl'], color: '#4ade80' },
        statLabel: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
        completeActions: { width: '100%', maxWidth: 320, gap: spacing.md, marginTop: spacing.xl },
        completeButton: {
            backgroundColor: colors.accent,
            borderRadius: radii.xl,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        completeButtonOutline: {
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderRadius: radii.xl,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(209, 201, 184, 0.3)',
        },
        completeButtonText: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.lg,
            color: botanical.ink
        },
        completeButtonOutlineText: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.lg,
            color: botanical.parchment
        },
    });
}
