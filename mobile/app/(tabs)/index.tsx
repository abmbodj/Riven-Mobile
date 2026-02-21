import { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    RefreshControl,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import GardenHero from '../../src/components/GardenHero';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search,
    RefreshCw,
    Layers,
    Sparkles,
    SlidersHorizontal,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api, Deck } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../src/constants/tokens';

export default function HomeScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: decks, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['decks'],
        queryFn: api.getDecks,
    });

    const filteredDecks = (decks || []).filter((d) =>
        search ? d.title.toLowerCase().includes(search.toLowerCase()) : true
    );

    const styles = makeStyles(colors);

    const renderDeck = useCallback(({ item, index }: { item: Deck; index: number }) => {
        const folderColor = '#7a9e72';

        return (
            <Pressable
                style={({ pressed }) => [styles.deckCard, pressed && { transform: [{ scale: 0.98 }] }]}
                onPress={() => router.push(`/deck/${item.id}`)}
            >
                {/* Specimen Tape Accent */}
                <View style={styles.specimenTape} />
                <View style={styles.specimenPin} />

                {/* Paper gradient overlay */}
                <ImageBackground
                    source={{ uri: 'https://www.transparenttextures.com/patterns/natural-paper.png' }}
                    style={StyleSheet.absoluteFill}
                    imageStyle={{ opacity: 0.5 }}
                />

                {/* Content */}
                <View style={styles.deckContent}>
                    {/* Date Line */}
                    <Text style={styles.deckDate}>
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </Text>

                    <View style={styles.deckRow}>
                        {/* Folder icon */}
                        <View style={[styles.folderIcon, { backgroundColor: folderColor + '15' }]}>
                            <Layers size={20} color={folderColor} style={{ opacity: 0.6 }} />
                        </View>

                        <View style={styles.deckInfo}>
                            {/* Title */}
                            <Text style={styles.deckTitle} numberOfLines={2}>{item.title}</Text>

                            {/* Card count + Tags */}
                            <View style={styles.deckMeta}>
                                <Text style={styles.deckCount}>
                                    {item.cardCount} {item.cardCount === 1 ? 'specimen' : 'specimens'}
                                </Text>
                                {item.tags?.length > 0 && (
                                    <View style={styles.tagsRow}>
                                        {item.tags.slice(0, 3).map((tag) => (
                                            <View key={tag.id} style={[styles.tag, { backgroundColor: tag.color + '20' }]}>
                                                <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Archival Stamp Watermark */}
                <View style={styles.watermark}>
                    <Sparkles size={64} color={botanical.tapePin} style={{ opacity: 0.04 }} />
                </View>
            </Pressable>
        );
    }, [colors, styles, router]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <View style={[styles.tagBadge, { marginBottom: 0 }]}>
                            <Text style={styles.tagBadgeText}>LIBRARY</Text>
                        </View>
                        <GardenHero />
                    </View>
                    <Text style={styles.pageTitle}>Decks</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => refetch()}
                >
                    <RefreshCw size={18} color={colors.textSecondary} />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Search size={16} color={colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="SEARCH COLLECTION..."
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
            </View>

            {/* Sort Controls */}
            <View style={styles.sortRow}>
                <View style={styles.sortLine} />
                <Text style={styles.sortLabel}>YOUR DECKS</Text>
                <View style={{ flex: 1 }} />
                <Pressable style={styles.sortBtn}>
                    <Text style={styles.sortBtnText}>NEWEST</Text>
                    <SlidersHorizontal size={14} color={colors.textSecondary} />
                </Pressable>
            </View>

            {/* Deck List */}
            {filteredDecks.length === 0 && !isLoading ? (
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                        <Sparkles size={40} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                    </View>
                    <Text style={styles.emptyTitle}>No Decks</Text>
                    <Text style={styles.emptyDesc}>
                        YOUR DECK COLLECTION IS EMPTY. CREATE YOUR FIRST DECK BELOW.
                    </Text>
                </View>
            ) : (
                <FlashList
                    data={filteredDecks}
                    renderItem={renderDeck}
                    estimatedItemSize={140}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing['3xl'] }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => refetch()}
                            tintColor={colors.accent}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        header: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
            paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md,
        },
        tagBadge: {
            backgroundColor: colors.accent, paddingHorizontal: spacing.sm + 2, paddingVertical: 2,
            borderRadius: radii.sm, alignSelf: 'flex-start', marginBottom: spacing.xs,
        },
        tagBadgeText: {
            fontFamily: fonts.monoBold, fontSize: 9, color: botanical.ink, letterSpacing: 1.5,
        },
        pageTitle: {
            fontFamily: fonts.displayBold, fontSize: fontSize['4xl'], color: colors.text,
            letterSpacing: -1,
        },
        refreshBtn: {
            width: 44, height: 44, borderRadius: radii.md,
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            justifyContent: 'center', alignItems: 'center', marginTop: spacing.md,
        },
        searchBar: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: radii['2xl'], marginHorizontal: spacing.md, marginBottom: spacing.lg,
            paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
        },
        searchInput: {
            flex: 1, fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.text,
            letterSpacing: 1, paddingVertical: spacing.xs,
        },
        sortRow: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            paddingHorizontal: spacing.md, marginBottom: spacing.md,
        },
        sortLine: { width: 16, height: 1, backgroundColor: colors.border },
        sortLabel: {
            fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.textSecondary, letterSpacing: 1.5,
        },
        sortBtn: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        },
        sortBtnText: {
            fontFamily: fonts.monoBold, fontSize: fontSize.xs, color: colors.textSecondary, letterSpacing: 1,
        },
        // Herbarium Deck Card
        deckCard: {
            backgroundColor: botanical.paper,
            borderRadius: radii.xl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: botanical.tapePin + '60',
            ...cardShadow,
            position: 'relative',
        },
        specimenTape: {
            position: 'absolute', top: -1, left: '25%',
            width: 40, height: 12,
            backgroundColor: botanical.tape,
            transform: [{ rotate: '-2deg' }],
            borderRadius: 2,
            zIndex: 10,
            opacity: 0.8,
        },
        specimenPin: {
            position: 'absolute', top: -1, right: '25%',
            width: 16, height: 16,
            backgroundColor: botanical.tapePin + '40',
            transform: [{ rotate: '15deg' }],
            borderRadius: 8,
            zIndex: 10,
        },
        paperOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255,255,255,0.2)',
            opacity: 0.3,
        },
        deckContent: {
            padding: spacing.md + 4,
            zIndex: 5,
        },
        deckDate: {
            fontFamily: fonts.mono, fontSize: 9, color: botanical.ink + '50',
            letterSpacing: 1.5, marginBottom: spacing.md,
        },
        deckRow: {
            flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
        },
        folderIcon: {
            width: 40, height: 40, borderRadius: radii.md,
            justifyContent: 'center', alignItems: 'center',
        },
        deckInfo: { flex: 1, minWidth: 0 },
        deckTitle: {
            fontFamily: 'Lora_700Bold', fontSize: fontSize.lg,
            color: botanical.ink, fontStyle: 'italic',
            lineHeight: fontSize.lg * 1.2, marginBottom: spacing.sm,
        },
        deckMeta: { gap: spacing.xs },
        deckCount: {
            fontFamily: fonts.mono, fontSize: fontSize.xs, color: botanical.ink + '60',
            letterSpacing: 0.5,
        },
        tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
        tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm },
        tagText: { fontFamily: fonts.mono, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
        watermark: {
            position: 'absolute', bottom: -8, right: -8, opacity: 1, zIndex: 1,
        },
        // Empty State
        empty: {
            flex: 1, justifyContent: 'center', alignItems: 'center',
            paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'],
        },
        emptyIcon: {
            backgroundColor: colors.surface, width: 80, height: 80, borderRadius: 40,
            justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
        },
        emptyTitle: {
            fontFamily: fonts.displayBoldItalic, fontSize: fontSize['2xl'], color: colors.text,
            marginBottom: spacing.sm,
        },
        emptyDesc: {
            fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.textSecondary,
            textAlign: 'center', letterSpacing: 0.5, lineHeight: fontSize.xs * 1.8,
        },
    });
}
