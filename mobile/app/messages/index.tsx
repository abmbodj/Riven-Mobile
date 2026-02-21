import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Leaf, Layers } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api, Conversation } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical } from '../../src/constants/tokens';

export default function MessagesScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: conversations, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: api.getConversations,
    });

    const styles = makeStyles(colors);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderConversation = useCallback(({ item }: { item: Conversation }) => (
        <Pressable
            style={({ pressed }) => [styles.convoCard, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/messages/${item.userId}`)}
        >
            <View style={styles.cardAccent} />
            <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                            {item.unreadCount > 9 ? '9+' : item.unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.convoInfo}>
                <View style={styles.convoHeader}>
                    <Text style={[styles.convoName, item.unreadCount > 0 ? { color: botanical.parchment } : { color: colors.text }]}>
                        {item.username}
                    </Text>
                    <Text style={styles.convoTime}>{formatTime(item.lastMessageAt)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.convoPreview, item.unreadCount > 0 ? { color: colors.text, fontWeight: '500' } : { color: botanical.sepia }]} numberOfLines={1}>
                        {item.isOwnMessage && <Text style={{ color: botanical.sepia, opacity: 0.7 }}>You: </Text>}
                        {/* If lastMessageType were exposed from API, we'd check it here, but checking for deck pattern */}
                        {item.lastMessage === 'deck' ? ( // Adjust if API exposes lastMessageType
                            <>
                                <Layers size={12} color={item.unreadCount > 0 ? colors.text : botanical.sepia} style={{ marginRight: 4 }} />
                                {' Shared a deck'}
                            </>
                        ) : (
                            item.lastMessage
                        )}
                    </Text>
                </View>
            </View>
        </Pressable>
    ), [colors, styles, router]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <View style={styles.headerTitleWrap}>
                    <View style={styles.leafBg}>
                        <Leaf size={40} color={botanical.forest} opacity={0.15} style={{ transform: [{ rotate: '12deg' }] }} />
                    </View>
                    <Text style={styles.title}>Messages</Text>
                    <Text style={styles.subtitle}>Chat with your friends</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={botanical.forest} />
                </View>
            ) : !conversations || conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconWrapRelative}>
                        <View style={styles.emptyIconWrap}>
                            <Send size={32} color={botanical.forest} />
                        </View>
                        <View style={styles.emptyIconBadge}>
                            <Leaf size={12} color={botanical.forest} />
                        </View>
                    </View>
                    <Text style={styles.emptyTitle}>No conversations yet</Text>
                    <Text style={styles.emptySub}>Start connecting with friends</Text>
                    <Pressable
                        style={styles.primaryBtn}
                        onPress={() => router.push('/friends')}
                    >
                        <Leaf size={16} color="#fff" style={{ marginRight: spacing.sm }} />
                        <Text style={styles.primaryBtnText}>Find Friends</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.content}>
                    {/* @ts-ignore */}
                    <FlashList
                        data={conversations}
                        renderItem={renderConversation}
                        estimatedItemSize={72}
                        keyExtractor={(item) => item.userId.toString()}
                        contentContainerStyle={{ paddingBottom: spacing.xl }}
                        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row', alignItems: 'flex-start',
            paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg,
        },
        backButton: { padding: spacing.xs, marginRight: spacing.sm },
        headerTitleWrap: { flex: 1, position: 'relative' },
        leafBg: { position: 'absolute', top: -10, left: -20, opacity: 0.5 },
        title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.text, marginBottom: 2 },
        subtitle: { fontFamily: fonts.mono, fontSize: 13, color: botanical.sepia },

        center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        content: { flex: 1, paddingHorizontal: spacing.md },

        emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: 100 },
        emptyIconWrapRelative: { position: 'relative', width: 80, height: 80, marginBottom: spacing.lg },
        emptyIconWrap: { flex: 1, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
        emptyIconBadge: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(122,158,114,0.2)', justifyContent: 'center', alignItems: 'center' },
        emptyTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, color: botanical.parchment, marginBottom: spacing.sm },
        emptySub: { fontFamily: fonts.mono, fontSize: 13, color: botanical.sepia, textAlign: 'center', marginBottom: spacing.xl },
        primaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: botanical.forest, paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: radii.full },
        primaryBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },

        convoCard: {
            backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md,
            flexDirection: 'row', alignItems: 'center', gap: spacing.md, position: 'relative', overflow: 'hidden'
        },
        cardAccent: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderTopWidth: 1, borderRightWidth: 1, borderColor: 'rgba(122,158,114,0.3)', borderTopRightRadius: 2 },
        avatarWrap: { position: 'relative' },
        avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: botanical.forest },
        avatarText: { fontFamily: fonts.displayBold, fontSize: 22, color: botanical.forest },
        unreadBadge: { position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: 12, backgroundColor: botanical.forest, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.surface },
        unreadText: { fontFamily: fonts.monoBold, fontSize: 10, color: '#fff' },

        convoInfo: { flex: 1, gap: 4 },
        convoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        convoName: { fontFamily: fonts.display, fontSize: 18, color: colors.text, fontWeight: '600', flex: 1, marginRight: spacing.sm },
        convoTime: { fontFamily: fonts.mono, fontSize: 12, color: botanical.sepia },
        convoPreview: { fontFamily: fonts.mono, fontSize: 13, flex: 1 },
    });
}
