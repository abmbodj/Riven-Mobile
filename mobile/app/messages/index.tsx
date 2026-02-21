import { useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api, Conversation } from '../../src/lib/api';
import { spacing, radii, fontSize } from '../../src/constants/tokens';

export default function MessagesScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();

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
        if (diffHrs < 24) return `${diffHrs}h`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    const renderConversation = useCallback(({ item }: { item: Conversation }) => (
        <Pressable
            style={({ pressed }) => [styles.convoCard, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/messages/${item.userId}`)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.convoInfo}>
                <View style={styles.convoHeader}>
                    <Text style={styles.convoName}>{item.username}</Text>
                    <Text style={styles.convoTime}>{formatTime(item.lastMessageAt)}</Text>
                </View>
                <Text style={styles.convoPreview} numberOfLines={1}>
                    {item.isOwnMessage ? 'You: ' : ''}{item.lastMessage}
                </Text>
            </View>
            {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
            )}
        </Pressable>
    ), [colors, styles, router]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Messages</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : !conversations || conversations.length === 0 ? (
                <View style={styles.empty}>
                    <MessageSquare size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No messages yet</Text>
                    <Text style={styles.emptySubtitle}>Start a conversation from your friends list</Text>
                </View>
            ) : (
                <FlashList
                    data={conversations}
                    renderItem={renderConversation}
                    estimatedItemSize={72}
                    keyExtractor={(item) => item.userId.toString()}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                />
            )}
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        },
        title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        empty: {
            flex: 1, justifyContent: 'center', alignItems: 'center',
            gap: spacing.md, paddingHorizontal: spacing.xl,
        },
        emptyTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text },
        emptySubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
        convoCard: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            backgroundColor: colors.surface, borderRadius: radii.lg,
            padding: spacing.md, borderWidth: 1, borderColor: colors.border,
        },
        avatar: {
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center',
        },
        avatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.accent },
        convoInfo: { flex: 1, gap: 2 },
        convoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        convoName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        convoTime: { fontSize: fontSize.xs, color: colors.textSecondary },
        convoPreview: { fontSize: fontSize.sm, color: colors.textSecondary },
        unreadBadge: {
            minWidth: 22, height: 22, borderRadius: 11,
            backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
            paddingHorizontal: 6,
        },
        unreadText: { fontSize: 11, fontWeight: '700', color: '#1a1a18' },
    });
}
