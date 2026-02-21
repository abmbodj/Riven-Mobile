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
} from 'lucide-react-native';
import { useThemeStore } from '../../../src/stores/themeStore';
import { api, Card } from '../../../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../../../src/constants/tokens';

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
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={styles.title} numberOfLines={1}>{deck.title}</Text>
                    <Text style={styles.cardCount}>{deck.cards?.length || 0} cards</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Action Buttons */}
            {deck.cards && deck.cards.length > 0 && (
                <View style={styles.actions}>
                    <Pressable
                        style={({ pressed }) => [styles.actionButton, styles.studyButton, pressed && styles.actionButtonPressed]}
                        onPress={() => router.push(`/deck/${deckId}/study`)}
                    >
                        <Play size={18} color="#1a1a18" />
                        <Text style={styles.actionButtonText}>Study</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.actionButton, styles.testButton, pressed && styles.actionButtonPressed]}
                        onPress={() => router.push(`/deck/${deckId}/test`)}
                    >
                        <ClipboardCheck size={18} color={colors.accent} />
                        <Text style={[styles.actionButtonText, { color: colors.accent }]}>Test</Text>
                    </Pressable>
                </View>
            )}

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
        container: { flex: 1, backgroundColor: 'transparent' },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        errorText: { fontSize: fontSize.lg, color: colors.textSecondary },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            gap: spacing.md,
        },
        headerCenter: { flex: 1 },
        title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
        cardCount: { fontSize: fontSize.xs, color: colors.textSecondary },
        actions: {
            flexDirection: 'row',
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
            gap: spacing.sm,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.sm + 2,
            borderRadius: radii.md,
            gap: spacing.sm,
        },
        actionButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
        studyButton: { backgroundColor: colors.accent },
        testButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent },
        actionButtonText: { fontSize: fontSize.md, fontWeight: '600', color: '#1a1a18' },
        sectionTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
        cardItem: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        cardContent: { flex: 1, gap: spacing.xs },
        cardFront: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        cardDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
        cardBack: { fontSize: fontSize.sm, color: colors.textSecondary },
        deleteButton: { padding: spacing.sm },
        emptyCards: { paddingVertical: spacing.xl, alignItems: 'center' },
        emptyText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
        fab: {
            position: 'absolute',
            bottom: spacing.lg,
            right: spacing.lg,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            ...cardShadow,
        },
        addCardForm: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing.lg,
            gap: spacing.md,
            borderTopWidth: 1,
            borderColor: colors.border,
            ...cardShadow,
        },
        addCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        addCardTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
        addCardInput: {
            backgroundColor: colors.bg,
            borderRadius: radii.md,
            padding: spacing.md,
            fontSize: fontSize.md,
            color: colors.text,
            minHeight: 50,
            borderWidth: 1,
            borderColor: colors.border,
        },
        addCardSubmit: {
            flexDirection: 'row',
            backgroundColor: colors.accent,
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        addCardSubmitText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
    });
}
