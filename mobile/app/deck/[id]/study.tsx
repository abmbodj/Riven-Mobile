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
} from 'lucide-react-native';
import { useThemeStore } from '../../../src/stores/themeStore';
import { api, Card } from '../../../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../../../src/constants/tokens';

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
                <View style={styles.completeContainer}>
                    <CheckCircle size={64} color={colors.accent} />
                    <Text style={styles.completeTitle}>Session Complete!</Text>
                    <Text style={styles.completeSubtitle}>{deck?.title}</Text>

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
                            style={({ pressed }) => [styles.completeButton, pressed && { opacity: 0.85 }]}
                            onPress={resetSession}
                        >
                            <RotateCcw size={18} color="#1a1a18" />
                            <Text style={styles.completeButtonText}>Study Again</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.completeButtonOutline, pressed && { opacity: 0.85 }]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.completeButtonText, { color: colors.accent }]}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.progress}>
                    {currentIndex + 1} / {cards.length}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${((currentIndex + 1) / cards.length) * 100}%` },
                    ]}
                />
            </View>

            {/* Flashcard */}
            {currentCard && (
                <Pressable style={styles.cardContainer} onPress={flipCard}>
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
                                opacity: frontOpacity,
                            },
                        ]}
                    >
                        <Text style={styles.cardLabel}>Front</Text>
                        <Text style={styles.cardText}>{currentCard.front}</Text>
                        <Text style={styles.tapHint}>Tap to flip</Text>
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardBack,
                            {
                                transform: [{ perspective: 1000 }, { rotateY: backRotate }],
                                opacity: backOpacity,
                            },
                        ]}
                    >
                        <Text style={styles.cardLabel}>Back</Text>
                        <Text style={styles.cardText}>{currentCard.back}</Text>
                    </Animated.View>
                </Pressable>
            )}

            {/* Answer Buttons */}
            {isFlipped && (
                <View style={styles.answerButtons}>
                    <Pressable
                        style={({ pressed }) => [styles.answerButton, styles.incorrectButton, pressed && { opacity: 0.85 }]}
                        onPress={() => handleAnswer(false)}
                    >
                        <ThumbsDown size={22} color="#ffffff" />
                        <Text style={styles.answerButtonText}>Incorrect</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.answerButton, styles.correctButton, pressed && { opacity: 0.85 }]}
                        onPress={() => handleAnswer(true)}
                    >
                        <ThumbsUp size={22} color="#ffffff" />
                        <Text style={styles.answerButtonText}>Correct</Text>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
        },
        progress: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
        progressBar: {
            height: 4,
            backgroundColor: colors.border,
            marginHorizontal: spacing.md,
            borderRadius: 2,
            overflow: 'hidden',
        },
        progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
        cardContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
        },
        card: {
            width: SCREEN_WIDTH - spacing.lg * 2,
            minHeight: 280,
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            padding: spacing.xl,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            backfaceVisibility: 'hidden',
            ...cardShadow,
        },
        cardBack: {
            position: 'absolute',
            backgroundColor: colors.accent + '15',
            borderColor: colors.accent + '40',
        },
        cardLabel: {
            position: 'absolute',
            top: spacing.md,
            left: spacing.md,
            fontSize: fontSize.xs,
            fontWeight: '600',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        cardText: {
            fontSize: fontSize['2xl'],
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
        },
        tapHint: {
            position: 'absolute',
            bottom: spacing.md,
            fontSize: fontSize.xs,
            color: colors.textSecondary,
        },
        answerButtons: {
            flexDirection: 'row',
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl,
            gap: spacing.md,
        },
        answerButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            borderRadius: radii.md,
            gap: spacing.sm,
        },
        incorrectButton: { backgroundColor: '#ef4444' },
        correctButton: { backgroundColor: '#22c55e' },
        answerButtonText: { fontSize: fontSize.md, fontWeight: '700', color: '#ffffff' },
        completeContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            gap: spacing.md,
        },
        completeTitle: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text },
        completeSubtitle: { fontSize: fontSize.md, color: colors.textSecondary },
        statsRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
        statCard: {
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            alignItems: 'center',
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
        },
        statNumber: { fontSize: fontSize['2xl'], fontWeight: '700', color: '#22c55e' },
        statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
        completeActions: { width: '100%', gap: spacing.sm, marginTop: spacing.md },
        completeButton: {
            flexDirection: 'row',
            backgroundColor: colors.accent,
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        completeButtonOutline: {
            backgroundColor: 'transparent',
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.accent,
        },
        completeButtonText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
    });
}
