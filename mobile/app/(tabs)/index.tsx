import { useCallback, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { BookOpen, Plus, FolderOpen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api, Deck } from '../../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../../src/constants/tokens';

export default function HomeScreen() {
    const colors = useThemeStore((s) => s.colors);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const { data: decks, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['decks'],
        queryFn: api.getDecks,
    });

    const handleDeckPress = useCallback((id: number) => {
        router.push(`/deck/${id}`);
    }, [router]);

    const styles = makeStyles(colors);

    const renderDeck = useCallback(({ item }: { item: Deck }) => (
        <Pressable
            style={({ pressed }) => [styles.deckCard, pressed && styles.deckCardPressed]}
            onPress={() => handleDeckPress(item.id)}
        >
            <View style={styles.deckHeader}>
                <BookOpen size={20} color={colors.accent} />
                <Text style={styles.deckTitle} numberOfLines={1}>{item.title}</Text>
            </View>
            {item.description ? (
                <Text style={styles.deckDescription} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.deckFooter}>
                <Text style={styles.cardCount}>{item.cardCount} cards</Text>
                {item.tags?.length > 0 && (
                    <View style={styles.tagRow}>
                        {item.tags.slice(0, 3).map((tag) => (
                            <View key={tag.id} style={[styles.tag, { backgroundColor: tag.color + '30' }]}>
                                <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </Pressable>
    ), [colors, handleDeckPress, styles]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.username}>{user?.username || 'Student'}</Text>
                </View>
            </View>

            {/* Deck List */}
            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : !decks || decks.length === 0 ? (
                <View style={styles.empty}>
                    <FolderOpen size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No decks yet</Text>
                    <Text style={styles.emptySubtitle}>Create your first flashcard deck to get started</Text>
                    <Pressable
                        style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
                        onPress={() => router.push('/(tabs)/create')}
                    >
                        <Plus size={20} color="#1a1a18" />
                        <Text style={styles.createButtonText}>Create Deck</Text>
                    </Pressable>
                </View>
            ) : (
                <FlashList
                    data={decks}
                    renderItem={renderDeck}
                    estimatedItemSize={120}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />
                    }
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                />
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        greeting: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        username: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text,
        },
        loader: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        empty: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            gap: spacing.md,
        },
        emptyTitle: {
            fontSize: fontSize.xl,
            fontWeight: '600',
            color: colors.text,
        },
        emptySubtitle: {
            fontSize: fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        createButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.accent,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radii.md,
            gap: spacing.sm,
            marginTop: spacing.md,
        },
        createButtonPressed: {
            opacity: 0.85,
            transform: [{ scale: 0.98 }],
        },
        createButtonText: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: '#1a1a18',
        },
        deckCard: {
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            ...cardShadow,
        },
        deckCardPressed: {
            opacity: 0.9,
            transform: [{ scale: 0.98 }],
        },
        deckHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.xs,
        },
        deckTitle: {
            fontSize: fontSize.lg,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
        },
        deckDescription: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginBottom: spacing.sm,
        },
        deckFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        cardCount: {
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        tagRow: {
            flexDirection: 'row',
            gap: spacing.xs,
        },
        tag: {
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
            borderRadius: radii.sm,
        },
        tagText: {
            fontSize: 10,
            fontWeight: '600',
        },
    });
}
