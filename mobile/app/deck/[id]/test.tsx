import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    TextInput,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    X,
    Trophy,
    Target,
    CheckCircle2,
    XCircle,
    List,
    Keyboard,
    Send,
    RefreshCw
} from 'lucide-react-native';
import { useThemeStore } from '../../../src/stores/themeStore';
import { api, Card } from '../../../src/lib/api';
import { spacing, radii, fontSize, cardShadow, fonts, botanical } from '../../../src/constants/tokens';
import GlobalBackground from '../../../src/components/GlobalBackground';
import * as Haptics from 'expo-haptics';


export default function TestModeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const deckId = parseInt(id);

    const [testMode, setTestMode] = useState<'multiple' | 'typed' | null>(null);
    const [questions, setQuestions] = useState<{ card: Card; options?: string[]; correctAnswer: string }[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [typedAnswer, setTypedAnswer] = useState('');
    const inputRef = useRef<TextInput>(null);

    const { data: deck, isLoading } = useQuery({
        queryKey: ['deck', deckId],
        queryFn: () => api.getDeck(deckId),
        enabled: !!deckId,
    });

    const cards = useMemo(() => deck?.cards || [], [deck?.cards]);

    const generateTest = useCallback((deckCards: Card[], mode: 'multiple' | 'typed') => {
        const minCards = mode === 'multiple' ? 4 : 1;
        if (deckCards.length < minCards) {
            setQuestions([]);
            return;
        }

        const shuffled = [...deckCards].sort(() => 0.5 - Math.random());
        const newQuestions = shuffled.map(card => {
            if (mode === 'multiple') {
                const distractors = deckCards
                    .filter(c => c.id !== card.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(c => c.back);

                const options = [...distractors, card.back].sort(() => 0.5 - Math.random());

                return {
                    card,
                    options,
                    correctAnswer: card.back
                };
            } else {
                return {
                    card,
                    correctAnswer: card.back
                };
            }
        });

        setQuestions(newQuestions);
        setCurrentQIndex(0);
        setScore(0);
        setShowResult(false);
        setTypedAnswer('');
    }, []);

    const startTest = (mode: 'multiple' | 'typed') => {
        setTestMode(mode);
        generateTest(cards, mode);
    };

    useEffect(() => {
        if (testMode === 'typed' && inputRef.current && !showFeedback) {
            // Slight delay needed in RN to ensure layout is complete before focusing
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [currentQIndex, testMode, showFeedback]);

    const handleMultipleAnswer = (selectedOption: string) => {
        if (showFeedback) return;

        setSelectedAnswer(selectedOption);
        setShowFeedback(true);

        const isCorrect = selectedOption === questions[currentQIndex].correctAnswer;
        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScore(s => s + 1);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setTimeout(() => {
            setSelectedAnswer(null);
            setShowFeedback(false);

            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(i => i + 1);
            } else {
                setShowResult(true);
            }
        }, 1200);
    };

    const normalizeAnswer = (answer: string) => {
        return answer
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')  // normalize whitespace
            .replace(/[.,!?;:'"]/g, ''); // remove punctuation
    };

    const handleTypedSubmit = () => {
        if (showFeedback || !typedAnswer.trim()) return;

        setShowFeedback(true);

        const correctAnswer = questions[currentQIndex].correctAnswer;
        const isCorrect = normalizeAnswer(typedAnswer) === normalizeAnswer(correctAnswer);

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScore(s => s + 1);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setTimeout(() => {
            setShowFeedback(false);
            setTypedAnswer('');

            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(i => i + 1);
            } else {
                setShowResult(true);
            }
        }, 2000);
    };

    const styles = makeStyles(colors);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <GlobalBackground />
                <View style={styles.centerContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (cards.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <GlobalBackground />
                <View style={styles.centerContainer}>
                    <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🎯</Text>
                    <Text style={styles.emptyTitle}>No Cards Yet</Text>
                    <Text style={styles.emptySubtitle}>Add some cards to take a quiz</Text>
                    <Pressable style={styles.primaryButton} onPress={() => router.back()}>
                        <Text style={styles.primaryButtonText}>Back to Deck</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Mode selection screen
    if (!testMode) {
        return (
            <SafeAreaView style={styles.container}>
                <GlobalBackground />
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerButton}>
                        <X size={24} color={colors.textSecondary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Choose Quiz Mode</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.modeContainer}>
                    <View style={styles.modeCards}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.modeCard,
                                cards.length < 4 && styles.modeCardDisabled,
                                pressed && cards.length >= 4 && { transform: [{ scale: 0.98 }] }
                            ]}
                            disabled={cards.length < 4}
                            onPress={() => startTest('multiple')}
                        >
                            <View style={[styles.modeIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <List size={24} color="#3b82f6" />
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeTitle}>Multiple Choice</Text>
                                <Text style={styles.modeSubtitle}>Choose the correct answer from 4 options</Text>
                                {cards.length < 4 && (
                                    <Text style={styles.modeErrorText}>Requires at least 4 cards</Text>
                                )}
                            </View>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.modeCard,
                                pressed && { transform: [{ scale: 0.98 }] }
                            ]}
                            onPress={() => startTest('typed')}
                        >
                            <View style={[styles.modeIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                                <Keyboard size={24} color="#22c55e" />
                            </View>
                            <View style={styles.modeInfo}>
                                <Text style={styles.modeTitle}>Type Answer</Text>
                                <Text style={styles.modeSubtitle}>Type the exact answer to test your recall</Text>
                            </View>
                        </Pressable>
                    </View>

                    <Text style={styles.deckCountText}>{cards.length} cards in this deck</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (showResult) {
        const percentage = Math.round((score / questions.length) * 100);
        const isSuccess = percentage >= 70;

        return (
            <SafeAreaView style={styles.container}>
                <GlobalBackground />
                <View style={styles.resultContainer}>
                    <View style={[styles.resultIconBox, isSuccess ? { backgroundColor: 'rgba(34, 197, 94, 0.2)' } : { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                        {isSuccess ? (
                            <Trophy size={40} color="#22c55e" />
                        ) : (
                            <Target size={40} color="#f97316" />
                        )}
                    </View>

                    <Text style={styles.resultTitle}>Complete!</Text>
                    <Text style={styles.resultPercentage}>{percentage}% correct</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#22c55e' }]}>{score}</Text>
                            <Text style={styles.statLabel}>Correct</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{questions.length - score}</Text>
                            <Text style={styles.statLabel}>Wrong</Text>
                        </View>
                    </View>

                    <View style={styles.resultActions}>
                        <Pressable
                            style={styles.primaryButton}
                            onPress={() => generateTest(cards, testMode)}
                        >
                            <RefreshCw size={20} color="#1a1a18" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryButtonText}>Try Again</Text>
                        </Pressable>
                        <Pressable
                            style={styles.secondaryButton}
                            onPress={() => setTestMode(null)}
                        >
                            <Text style={styles.secondaryButtonText}>Change Mode</Text>
                        </Pressable>
                        <Pressable
                            style={styles.textLink}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.textLinkText}>Back to Deck</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const currentQ = questions[currentQIndex];
    const progress = ((currentQIndex) / questions.length) * 100;

    return (
        <SafeAreaView style={styles.container}>
            <GlobalBackground />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header Sequence */}
                <View style={styles.testHeader}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerButton}>
                        <X size={24} color={colors.textSecondary} />
                    </Pressable>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progress}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>Question {currentQIndex + 1} of {questions.length}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                {/* Common Question Card */}
                <View style={styles.questionSection}>
                    <View style={styles.questionCard}>
                        <Text style={styles.questionLabel}>What is:</Text>
                        {/* If front_image exists, render it. Note: RN requires uri formatting */}
                        {false /* Replace with currentQ.card.front_image check if images are added to schema */}
                        <Text style={styles.questionText} adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={4}>
                            {currentQ.card.front}
                        </Text>
                    </View>
                </View>

                {/* Specific Mode Inputs */}
                {testMode === 'typed' ? (
                    <View style={styles.typedInputContainer}>
                        <View style={[
                            styles.typedInputWrapper,
                            showFeedback && normalizeAnswer(typedAnswer) === normalizeAnswer(currentQ.correctAnswer) ? styles.inputCorrect :
                                showFeedback ? styles.inputWrong : null
                        ]}>
                            <TextInput
                                ref={inputRef}
                                style={[
                                    styles.typedInput,
                                    showFeedback && normalizeAnswer(typedAnswer) === normalizeAnswer(currentQ.correctAnswer) ? { color: '#22c55e' } :
                                        showFeedback ? { color: '#ef4444' } : null
                                ]}
                                value={typedAnswer}
                                onChangeText={setTypedAnswer}
                                placeholder="Type your answer..."
                                placeholderTextColor={colors.textSecondary}
                                editable={!showFeedback}
                                autoCapitalize="none"
                                returnKeyType="send"
                                onSubmitEditing={handleTypedSubmit}
                            />
                            <Pressable
                                style={[
                                    styles.typedSubmitBtn,
                                    typedAnswer.trim() && !showFeedback ? styles.typedSubmitBtnActive : null
                                ]}
                                onPress={handleTypedSubmit}
                                disabled={showFeedback || !typedAnswer.trim()}
                            >
                                <Send size={20} color={typedAnswer.trim() && !showFeedback ? '#ffffff' : colors.textSecondary} />
                            </Pressable>
                        </View>

                        {showFeedback && (
                            <View style={[
                                styles.feedbackBox,
                                normalizeAnswer(typedAnswer) === normalizeAnswer(currentQ.correctAnswer) ? styles.feedbackBoxCorrect : styles.feedbackBoxWrong
                            ]}>
                                <View style={styles.feedbackHeader}>
                                    {normalizeAnswer(typedAnswer) === normalizeAnswer(currentQ.correctAnswer) ? (
                                        <>
                                            <CheckCircle2 size={24} color="#22c55e" />
                                            <Text style={styles.feedbackTitleCorrect}>Correct!</Text>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={24} color="#ef4444" />
                                            <Text style={styles.feedbackTitleWrong}>Incorrect</Text>
                                        </>
                                    )}
                                </View>
                                {normalizeAnswer(typedAnswer) !== normalizeAnswer(currentQ.correctAnswer) && (
                                    <Text style={styles.feedbackText}>
                                        <Text style={{ color: colors.textSecondary }}>Correct answer: </Text>
                                        <Text style={{ color: '#22c55e', fontWeight: '500' }}>{currentQ.correctAnswer}</Text>
                                    </Text>
                                )}
                            </View>
                        )}
                        <Text style={styles.hintText}>Press return or tap send to submit</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.optionsScroll} contentContainerStyle={styles.optionsContainer}>
                        {currentQ.options?.map((option, idx) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === currentQ.correctAnswer;
                            const showCorrect = showFeedback && isCorrect;
                            const showWrong = showFeedback && isSelected && !isCorrect;

                            return (
                                <Pressable
                                    key={idx}
                                    style={[
                                        styles.optionBtn,
                                        showCorrect ? styles.optionCorrect :
                                            showWrong ? styles.optionWrong : null,
                                        showFeedback && !isSelected && !isCorrect ? { opacity: 0.5 } : null
                                    ]}
                                    disabled={showFeedback}
                                    onPress={() => handleMultipleAnswer(option)}
                                >
                                    <View style={[
                                        styles.optionLetterBox,
                                        showCorrect ? styles.optionLetterBoxCorrect :
                                            showWrong ? styles.optionLetterBoxWrong : null
                                    ]}>
                                        {showCorrect ? (
                                            <CheckCircle2 size={20} color="#ffffff" />
                                        ) : showWrong ? (
                                            <XCircle size={20} color="#ffffff" />
                                        ) : (
                                            <Text style={styles.optionLetterText}>
                                                {String.fromCharCode(65 + idx)}
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.optionText,
                                        showCorrect ? { color: '#22c55e' } :
                                            showWrong ? { color: '#ef4444' } : null
                                    ]}>
                                        {option}
                                    </Text>
                                    {showCorrect && <Text style={styles.optionLabelCorrect}>Correct!</Text>}
                                    {showWrong && <Text style={styles.optionLabelWrong}>Wrong</Text>}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: botanical.ink },
        centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
        loadingText: { fontFamily: fonts.body, fontSize: fontSize.lg, color: colors.textSecondary },

        emptyTitle: { fontFamily: fonts.displayBold, fontSize: fontSize.xl, color: botanical.parchment, marginBottom: spacing.sm, textAlign: 'center' },
        emptySubtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' },

        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 56, flexShrink: 0 },
        headerButton: { padding: spacing.sm, marginLeft: -spacing.sm },
        headerTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.displayBold, fontSize: fontSize.lg, color: botanical.parchment },

        testHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 56, flexShrink: 0 },
        progressContainer: { flex: 1, marginHorizontal: spacing.md },
        progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
        progressFill: { height: '100%', backgroundColor: botanical.forest },
        progressText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },

        modeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
        modeCards: { width: '100%', maxWidth: 360, gap: spacing.md },
        modeCard: {
            flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
            padding: spacing.xl, borderRadius: radii['2xl'],
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        },
        modeCardDisabled: { borderColor: 'rgba(255,255,255,0.02)', opacity: 0.5 },
        modeIconBox: { width: 48, height: 48, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        modeInfo: { flex: 1 },
        modeTitle: { fontFamily: fonts.displayBold, fontSize: fontSize.lg, color: botanical.parchment, marginBottom: 4 },
        modeSubtitle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
        modeErrorText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: '#f97316', marginTop: spacing.sm },
        deckCountText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing['2xl'], textAlign: 'center' },

        questionSection: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
        questionCard: {
            backgroundColor: 'rgba(252, 250, 242, 0.05)', borderRadius: radii.xl, padding: spacing.xl,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        },
        questionLabel: { fontFamily: fonts.mono, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: colors.textSecondary, marginBottom: spacing.md },
        questionText: { fontFamily: fonts.displayBold, fontSize: fontSize['2xl'], color: botanical.parchment },

        typedInputContainer: { flex: 1, paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'] },
        typedInputWrapper: {
            flexDirection: 'row', position: 'relative',
            backgroundColor: 'rgba(252, 250, 242, 0.05)', borderRadius: radii.xl,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        },
        inputCorrect: { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
        inputWrong: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
        typedInput: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, paddingRight: 56, fontFamily: fonts.body, fontSize: fontSize.lg, color: botanical.parchment },
        typedSubmitBtn: { position: 'absolute', right: 8, top: '50%', marginTop: -20, width: 40, height: 40, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
        typedSubmitBtnActive: { backgroundColor: botanical.forest },

        feedbackBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: radii.xl },
        feedbackBoxCorrect: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
        feedbackBoxWrong: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
        feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
        feedbackTitleCorrect: { fontFamily: fonts.displayBold, fontSize: fontSize.md, color: '#22c55e' },
        feedbackTitleWrong: { fontFamily: fonts.displayBold, fontSize: fontSize.md, color: '#ef4444' },
        feedbackText: { fontFamily: fonts.body, fontSize: fontSize.sm },
        hintText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },

        optionsScroll: { flex: 1 },
        optionsContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'], gap: spacing.md },
        optionBtn: {
            flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radii.xl, gap: spacing.md,
            backgroundColor: 'rgba(252, 250, 242, 0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        },
        optionCorrect: { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
        optionWrong: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
        optionLetterBox: { width: 32, height: 32, borderRadius: radii.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
        optionLetterBoxCorrect: { borderColor: '#22c55e', backgroundColor: '#22c55e' },
        optionLetterBoxWrong: { borderColor: '#ef4444', backgroundColor: '#ef4444' },
        optionLetterText: { fontFamily: fonts.displayBold, fontSize: fontSize.sm, color: botanical.parchment },
        optionText: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.md, color: botanical.parchment },
        optionLabelCorrect: { fontFamily: fonts.displayBold, fontSize: fontSize.xs, color: '#22c55e' },
        optionLabelWrong: { fontFamily: fonts.displayBold, fontSize: fontSize.xs, color: '#ef4444' },

        resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
        resultIconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
        resultTitle: { fontFamily: fonts.displayBold, fontSize: fontSize['3xl'], color: botanical.parchment, marginBottom: spacing.xs },
        resultPercentage: { fontFamily: fonts.body, fontSize: fontSize.lg, color: colors.textSecondary, marginBottom: spacing.xl },

        statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing['2xl'], width: '100%', maxWidth: 320 },
        statCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, backgroundColor: 'rgba(252, 250, 242, 0.05)', borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
        statNumber: { fontFamily: fonts.displayBold, fontSize: fontSize['2xl'], marginBottom: 4 },
        statLabel: { fontFamily: fonts.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.textSecondary },

        resultActions: { width: '100%', maxWidth: 320, gap: spacing.md },
        primaryButton: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.accent, paddingVertical: spacing.lg, borderRadius: radii.lg, height: 56
        },
        primaryButtonText: { fontFamily: fonts.displayBold, fontSize: fontSize.md, color: botanical.ink },
        secondaryButton: {
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'transparent', paddingVertical: spacing.lg, borderRadius: radii.lg, height: 56,
            borderWidth: 1, borderColor: 'rgba(209, 201, 184, 0.3)'
        },
        secondaryButtonText: { fontFamily: fonts.displayBold, fontSize: fontSize.md, color: botanical.parchment },
        textLink: { alignItems: 'center', paddingVertical: spacing.sm },
        textLinkText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
    });
}
