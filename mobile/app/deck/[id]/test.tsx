import { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    TextInput,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react-native';
import { useThemeStore } from '../../../src/stores/themeStore';
import { api, Card } from '../../../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../../../src/constants/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TestModeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const deckId = parseInt(id);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [results, setResults] = useState<{ card: Card; userAnswer: string; correct: boolean }[]>([]);
    const [testComplete, setTestComplete] = useState(false);

    const { data: deck } = useQuery({
        queryKey: ['deck', deckId],
        queryFn: () => api.getDeck(deckId),
        enabled: !!deckId,
    });

    const cards = useMemo(() => {
        if (!deck?.cards) return [];
        // Shuffle cards for test mode
        return [...deck.cards].sort(() => Math.random() - 0.5);
    }, [deck?.cards]);

    const currentCard = cards[currentIndex];

    const checkAnswer = useCallback(() => {
        if (!currentCard || !userAnswer.trim()) return;

        const isCorrect = userAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
        setResults((prev) => [...prev, { card: currentCard, userAnswer: userAnswer.trim(), correct: isCorrect }]);
        setShowResult(true);
    }, [currentCard, userAnswer]);

    const nextCard = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex((i) => i + 1);
            setUserAnswer('');
            setShowResult(false);
        } else {
            setTestComplete(true);
        }
    }, [currentIndex, cards.length]);

    const resetTest = useCallback(() => {
        setCurrentIndex(0);
        setUserAnswer('');
        setShowResult(false);
        setResults([]);
        setTestComplete(false);
    }, []);

    const styles = makeStyles(colors);
    const correctCount = results.filter((r) => r.correct).length;
    const percentage = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    // Test complete
    if (testComplete) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.completeScroll}>
                    <CheckCircle size={64} color={colors.accent} />
                    <Text style={styles.completeTitle}>Test Complete!</Text>
                    <Text style={styles.completeSubtitle}>{deck?.title}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{correctCount}</Text>
                            <Text style={styles.statLabel}>Correct</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{results.length - correctCount}</Text>
                            <Text style={styles.statLabel}>Wrong</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: colors.accent }]}>{percentage}%</Text>
                            <Text style={styles.statLabel}>Score</Text>
                        </View>
                    </View>

                    {/* Review wrong answers */}
                    {results.filter((r) => !r.correct).length > 0 && (
                        <View style={styles.reviewSection}>
                            <Text style={styles.reviewTitle}>Review Incorrect Answers</Text>
                            {results.filter((r) => !r.correct).map((r, i) => (
                                <View key={i} style={styles.reviewCard}>
                                    <Text style={styles.reviewQuestion}>{r.card.front}</Text>
                                    <Text style={styles.reviewYours}>Your answer: {r.userAnswer}</Text>
                                    <Text style={styles.reviewCorrect}>Correct: {r.card.back}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.completeActions}>
                        <Pressable style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]} onPress={resetTest}>
                            <RotateCcw size={18} color="#1a1a18" />
                            <Text style={styles.actionBtnText}>Retake Test</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.actionBtnOutline, pressed && { opacity: 0.85 }]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.actionBtnText, { color: colors.accent }]}>Done</Text>
                        </Pressable>
                    </View>
                </ScrollView>
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
                <Text style={styles.progress}>{currentIndex + 1} / {cards.length}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((currentIndex + 1) / cards.length) * 100}%` }]} />
            </View>

            <View style={styles.content}>
                {/* Question Card */}
                {currentCard && (
                    <View style={styles.questionCard}>
                        <Text style={styles.questionLabel}>Question</Text>
                        <Text style={styles.questionText}>{currentCard.front}</Text>
                    </View>
                )}

                {/* Answer Input */}
                {!showResult ? (
                    <View style={styles.answerSection}>
                        <TextInput
                            style={styles.answerInput}
                            placeholder="Type your answer..."
                            placeholderTextColor={colors.textSecondary}
                            value={userAnswer}
                            onChangeText={setUserAnswer}
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={checkAnswer}
                        />
                        <Pressable
                            style={({ pressed }) => [
                                styles.submitBtn,
                                !userAnswer.trim() && { opacity: 0.5 },
                                pressed && { opacity: 0.85 },
                            ]}
                            onPress={checkAnswer}
                            disabled={!userAnswer.trim()}
                        >
                            <Text style={styles.submitBtnText}>Check Answer</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.resultSection}>
                        {results[results.length - 1]?.correct ? (
                            <View style={styles.resultCorrect}>
                                <CheckCircle size={28} color="#22c55e" />
                                <Text style={styles.resultCorrectText}>Correct!</Text>
                            </View>
                        ) : (
                            <View style={styles.resultWrong}>
                                <XCircle size={28} color="#ef4444" />
                                <Text style={styles.resultWrongText}>Incorrect</Text>
                                <Text style={styles.resultAnswer}>Correct answer: {currentCard?.back}</Text>
                            </View>
                        )}
                        <Pressable style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]} onPress={nextCard}>
                            <Text style={styles.nextBtnText}>
                                {currentIndex < cards.length - 1 ? 'Next Question' : 'See Results'}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
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
        progress: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
        progressBar: { height: 4, backgroundColor: colors.border, marginHorizontal: spacing.md, borderRadius: 2, overflow: 'hidden' },
        progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
        content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.lg },
        questionCard: {
            backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl,
            minHeight: 180, justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor: colors.border, ...cardShadow,
        },
        questionLabel: {
            position: 'absolute', top: spacing.md, left: spacing.md,
            fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1,
        },
        questionText: { fontSize: fontSize['2xl'], fontWeight: '600', color: colors.text, textAlign: 'center' },
        answerSection: { gap: spacing.md },
        answerInput: {
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
            fontSize: fontSize.md, color: colors.text,
        },
        submitBtn: {
            backgroundColor: colors.accent, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: 'center',
        },
        submitBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
        resultSection: { gap: spacing.md },
        resultCorrect: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            backgroundColor: '#22c55e15', borderRadius: radii.md, padding: spacing.md,
            borderWidth: 1, borderColor: '#22c55e40',
        },
        resultCorrectText: { fontSize: fontSize.lg, fontWeight: '600', color: '#22c55e' },
        resultWrong: {
            backgroundColor: '#ef444415', borderRadius: radii.md, padding: spacing.md,
            borderWidth: 1, borderColor: '#ef444440', gap: spacing.xs,
        },
        resultWrongText: { fontSize: fontSize.lg, fontWeight: '600', color: '#ef4444', flexDirection: 'row' },
        resultAnswer: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
        nextBtn: {
            backgroundColor: colors.accent, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: 'center',
        },
        nextBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
        // Complete
        completeScroll: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing['2xl'], gap: spacing.md },
        completeTitle: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text },
        completeSubtitle: { fontSize: fontSize.md, color: colors.textSecondary },
        statsRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.md, width: '100%' },
        statCard: {
            backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg,
            alignItems: 'center', flex: 1, borderWidth: 1, borderColor: colors.border,
        },
        statNumber: { fontSize: fontSize['2xl'], fontWeight: '700', color: '#22c55e' },
        statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
        reviewSection: { width: '100%', gap: spacing.sm, marginTop: spacing.md },
        reviewTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
        reviewCard: {
            backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md,
            borderWidth: 1, borderColor: '#ef444430', gap: spacing.xs,
        },
        reviewQuestion: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        reviewYours: { fontSize: fontSize.sm, color: '#ef4444' },
        reviewCorrect: { fontSize: fontSize.sm, color: '#22c55e', fontWeight: '500' },
        completeActions: { width: '100%', gap: spacing.sm, marginTop: spacing.lg },
        actionBtn: {
            flexDirection: 'row', backgroundColor: colors.accent, borderRadius: radii.md,
            paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        },
        actionBtnOutline: {
            backgroundColor: 'transparent', borderRadius: radii.md,
            paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: colors.accent,
        },
        actionBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
    });
}
