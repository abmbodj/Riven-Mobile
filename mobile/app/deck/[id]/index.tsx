import { useCallback, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Play,
    ClipboardCheck,
    Plus,
    Trash2,
    X,
    Check,
    BookOpen,
} from 'lucide-react-native';
import { useThemeStore } from '../../../src/stores/themeStore';
import { api, Card } from '../../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../../src/constants/tokens';
import GlobalBackground from '../../../src/components/GlobalBackground';

export default function DeckViewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [showAddCard, setShowAddCard] = useState(false);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    const deckId = parseInt(id);

    const { data: deck, isLoading } = useQuery({
        queryKey: ['deck', deckId],
        queryFn: () => api.getDeck(deckId),
        enabled: !!deckId,
    });

    const addCard = useMutation({
        mutationFn: () => api.addCard(deckId, front.trim(), back.trim()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            setFront('');
            setBack('');
            setShowAddCard(false);
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const deleteCard = useMutation({
        mutationFn: (cardId: number) => api.deleteCard(cardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
            queryClient.invalidateQueries({ queryKey: ['decks'] });
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const handleDeleteCard = (cardId: number) => {
        Alert.alert('Delete Card', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteCard.mutate(cardId) },
        ]);
    };

    const handleAddCard = () => {
        if (!front.trim() || !back.trim()) {
            Alert.alert('Error', 'Both front and back are required');
            return;
        }
        addCard.mutate();
    };

    const styles = makeStyles(colors);

    const renderCard = useCallback(({ item }: { item: Card }) => (
        <View style={styles.cardItem}>
            <View style={styles.cardContent}>
                <Text style={styles.cardFront} numberOfLines={2}>{item.front}</Text>
                <View style={styles.cardDivider} />
                <Text style={styles.cardBack} numberOfLines={2}>{item.back}</Text>
            </View>
            <Pressable
                onPress={() => handleDeleteCard(item.id)}
                style={styles.deleteButton}
                hitSlop={8}
            >
                <Trash2 size={16} color="#ef4444" />
            </Pressable>
        </View>
    ), [colors, styles]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            </SafeAreaView>
        );
    }

    if (!deck) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <Text style={styles.errorText}>Deck not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalBackground />
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.textSecondary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={styles.title} numberOfLines={1}>{deck.title}</Text>
                    <Text style={styles.deckSubtitle} numberOfLines={1}>
                        {deck.description || 'No description'} · {deck.cards?.length || 0} cards
                    </Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        deck?.cards?.length > 0 ? styles.studyButton : styles.studyButtonDisabled,
                        pressed && deck?.cards?.length > 0 && styles.actionButtonPressed
                    ]}
                    onPress={() => {
                        if (deck?.cards?.length > 0) router.push(`/deck/${deckId}/study`);
                        else Alert.alert('Notice', 'Add some cards first');
                    }}
                >
                    <BookOpen size={20} color={deck?.cards?.length > 0 ? botanical.parchment : 'rgba(244, 241, 232, 0.7)'} />
                    <Text style={[styles.actionButtonText, deck?.cards?.length === 0 && { color: 'rgba(244, 241, 232, 0.7)' }]}>Study</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        deck?.cards?.length >= 4 ? styles.testButton : styles.testButtonDisabled,
                        pressed && deck?.cards?.length >= 4 && styles.actionButtonPressed
                    ]}
                    onPress={() => {
                        if (deck?.cards?.length >= 4) router.push(`/deck/${deckId}/test`);
                        else Alert.alert('Notice', 'Need 4+ cards for test mode');
                    }}
                >
                    <Play size={20} color={deck?.cards?.length >= 4 ? botanical.parchment : colors.textSecondary} />
                    <Text style={[styles.actionButtonText, deck?.cards?.length >= 4 ? { color: botanical.parchment } : { color: colors.textSecondary }]}>Test</Text>
                </Pressable>
            </View>

            {/* Card List */}
            <FlashList
                data={deck.cards || []}
                renderItem={renderCard}
                estimatedItemSize={80}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing['3xl'] }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                ListHeaderComponent={() => (
                    <View style={{ paddingVertical: spacing.sm }}>
                        <Text style={styles.sectionTitle}>Cards</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyCards}>
                        <Text style={styles.emptyText}>No cards yet. Add your first card below!</Text>
                    </View>
                )}
            />

            {/* Add Card FAB / Form */}
            {showAddCard ? (
                <View style={styles.addCardForm}>
                    <View style={styles.addCardHeader}>
                        <Text style={styles.addCardTitle}>Add Card</Text>
                        <Pressable onPress={() => { setShowAddCard(false); setFront(''); setBack(''); }}>
                            <X size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                    <TextInput
                        style={styles.addCardInput}
                        placeholder="Front"
                        placeholderTextColor={colors.textSecondary}
                        value={front}
                        onChangeText={setFront}
                        multiline
                    />
                    <TextInput
                        style={styles.addCardInput}
                        placeholder="Back"
                        placeholderTextColor={colors.textSecondary}
                        value={back}
                        onChangeText={setBack}
                        multiline
                    />
                    <Pressable
                        style={({ pressed }) => [styles.addCardSubmit, pressed && { opacity: 0.85 }]}
                        onPress={handleAddCard}
                        disabled={addCard.isPending}
                    >
                        {addCard.isPending ? (
                            <ActivityIndicator color={colors.bg} size="small" />
                        ) : (
                            <>
                                <Check size={18} color="#1a1a18" />
                                <Text style={styles.addCardSubmitText}>Save Card</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] }]}
                    onPress={() => setShowAddCard(true)}
                >
                    <Plus size={24} color="#1a1a18" />
                </Pressable>
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: botanical.ink },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        errorText: { fontSize: fontSize.lg, color: colors.textSecondary, fontFamily: fonts.body },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
            gap: spacing.sm,
            marginBottom: spacing.md,
            minHeight: 80,
        },
        backButton: {
            padding: spacing.xs,
            marginLeft: -spacing.xs,
            height: '100%',
            justifyContent: 'center',
        },
        headerCenter: {
            flex: 1,
            justifyContent: 'center',
            flexShrink: 1,
        },
        title: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize['3xl'],
            color: botanical.parchment,
            marginBottom: 4,
        },
        deckSubtitle: {
            fontFamily: fonts.body,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        actions: {
            flexDirection: 'row',
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl,
            gap: spacing.md,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.lg,
            borderRadius: radii.xl,
            gap: spacing.sm,
            ...cardShadow,
        },
        studyButton: {
            backgroundColor: botanical.forest,
            borderWidth: 1,
            borderColor: 'rgba(122, 158, 114, 0.2)',
        },
        studyButtonDisabled: {
            backgroundColor: 'rgba(122, 158, 114, 0.5)',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        testButton: {
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(209, 201, 184, 0.3)',
        },
        testButtonDisabled: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        actionButtonPressed: {
            transform: [{ scale: 0.98 }],
        },
        actionButtonText: {
            fontFamily: fonts.display,
            fontWeight: '600',
            fontSize: fontSize.lg,
            letterSpacing: 0.5,
        },
        sectionTitle: {
            fontFamily: fonts.monoBold,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginLeft: spacing.xs,
        },
        cardItem: {
            flexDirection: 'row',
            backgroundColor: 'rgba(252, 250, 242, 0.05)',
            borderRadius: radii.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            alignItems: 'center',
        },
        cardContent: { flex: 1, gap: spacing.md },
        cardFront: {
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: botanical.parchment,
        },
        cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: spacing.xs },
        cardBack: {
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        deleteButton: { padding: spacing.sm, marginLeft: spacing.sm },
        emptyCards: { paddingVertical: spacing['2xl'], alignItems: 'center' },
        emptyText: {
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
        },
        fab: {
            position: 'absolute',
            bottom: spacing['2xl'],
            right: spacing.xl,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            ...cardShadow,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
        },
        addCardForm: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: botanical.ink,
            borderTopLeftRadius: radii['2xl'],
            borderTopRightRadius: radii['2xl'],
            padding: spacing.xl,
            gap: spacing.md,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            ...cardShadow,
            shadowOffset: { width: 0, height: -8 },
            shadowRadius: 24,
        },
        addCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
        addCardTitle: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.xl,
            color: botanical.parchment,
        },
        addCardInput: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: radii.md,
            padding: spacing.md,
            paddingTop: spacing.md,
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: botanical.parchment,
            minHeight: 80,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            textAlignVertical: 'top',
        },
        addCardSubmit: {
            flexDirection: 'row',
            backgroundColor: botanical.forest,
            borderRadius: radii.lg,
            paddingVertical: spacing.md + 4,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            marginTop: spacing.md,
        },
        addCardSubmitText: {
            fontFamily: fonts.displayBold,
            fontSize: fontSize.md,
            color: '#ffffff',
            letterSpacing: 1,
        },
    });
}
