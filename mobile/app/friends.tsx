import { useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, UserPlus, UserCheck, UserX, MessageSquare, Clock } from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { api, Friend } from '../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../src/constants/tokens';

export default function FriendsScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: friends, isLoading } = useQuery({
        queryKey: ['friends'],
        queryFn: api.getFriends,
    });

    const acceptRequest = useMutation({
        mutationFn: (userId: number) => api.acceptFriendRequest(userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const removeFriend = useMutation({
        mutationFn: (userId: number) => api.removeFriend(userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const handleRemove = (friend: Friend) => {
        Alert.alert('Remove Friend', `Remove ${friend.username}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeFriend.mutate(friend.id) },
        ]);
    };

    const styles = makeStyles(colors);

    const accepted = friends?.filter((f) => f.status === 'accepted') || [];
    const pending = friends?.filter((f) => f.status === 'pending' && !f.isOutgoing) || [];
    const outgoing = friends?.filter((f) => f.status === 'pending' && f.isOutgoing) || [];

    const renderFriend = useCallback(({ item }: { item: Friend }) => {
        const isPending = item.status === 'pending';
        const isIncoming = isPending && !item.isOutgoing;

        return (
            <View style={styles.friendCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.username}</Text>
                    {item.role && item.role !== 'user' && (
                        <Text style={styles.friendRole}>{item.role}</Text>
                    )}
                    {isPending && (
                        <View style={styles.pendingBadge}>
                            <Clock size={12} color={colors.textSecondary} />
                            <Text style={styles.pendingText}>
                                {item.isOutgoing ? 'Request sent' : 'Wants to be friends'}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.friendActions}>
                    {isIncoming && (
                        <Pressable
                            style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}
                            onPress={() => acceptRequest.mutate(item.id)}
                        >
                            <UserCheck size={18} color="#1a1a18" />
                        </Pressable>
                    )}
                    {item.status === 'accepted' && (
                        <Pressable
                            style={({ pressed }) => [styles.messageBtn, pressed && { opacity: 0.85 }]}
                            onPress={() => router.push(`/messages/${item.id}`)}
                        >
                            <MessageSquare size={18} color={colors.accent} />
                        </Pressable>
                    )}
                    <Pressable
                        style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.85 }]}
                        onPress={() => handleRemove(item)}
                    >
                        <UserX size={18} color="#ef4444" />
                    </Pressable>
                </View>
            </View>
        );
    }, [colors, styles, acceptRequest, removeFriend, router]);

    const allFriends = [...pending, ...accepted, ...outgoing];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Friends</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : allFriends.length === 0 ? (
                <View style={styles.empty}>
                    <UserPlus size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No friends yet</Text>
                    <Text style={styles.emptySubtitle}>Search for users to add friends</Text>
                </View>
            ) : (
                <FlashList
                    data={allFriends}
                    renderItem={renderFriend}
                    estimatedItemSize={80}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                    ListHeaderComponent={
                        pending.length > 0 ? (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {pending.length} pending request{pending.length > 1 ? 's' : ''}
                                </Text>
                            </View>
                        ) : null
                    }
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
        sectionHeader: { paddingVertical: spacing.sm },
        sectionTitle: {
            fontSize: fontSize.sm, fontWeight: '600', color: colors.accent,
        },
        friendCard: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            backgroundColor: colors.surface, borderRadius: radii.lg,
            padding: spacing.md, borderWidth: 1, borderColor: colors.border,
        },
        avatar: {
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center',
        },
        avatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.accent },
        friendInfo: { flex: 1 },
        friendName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        friendRole: { fontSize: fontSize.xs, color: colors.accent, fontWeight: '500' },
        pendingBadge: {
            flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2,
        },
        pendingText: { fontSize: fontSize.xs, color: colors.textSecondary },
        friendActions: { flexDirection: 'row', gap: spacing.xs },
        acceptBtn: {
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
        },
        messageBtn: {
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center',
        },
        removeBtn: {
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#ef444415', justifyContent: 'center', alignItems: 'center',
        },
    });
}
