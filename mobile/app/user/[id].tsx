import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, UserPlus, UserMinus, Check, X, Clock, Layers, Calendar, Copy, User as UserIcon, Shield } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useThemeStore } from '../../src/stores/themeStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, cardShadow } from '../../src/constants/tokens';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [copied, setCopied] = useState(false);

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['user', id],
        queryFn: () => api.getUserProfile(parseInt(id)),
    });

    const sendRequest = useMutation({
        mutationFn: () => api.sendFriendRequest(parseInt(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    });

    const acceptRequest = useMutation({
        mutationFn: () => api.acceptFriendRequest(parseInt(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
    });

    const removeFriend = useMutation({
        mutationFn: () => api.removeFriend(parseInt(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
    });

    const copyShareCode = async () => {
        if (profile?.shareCode) {
            await Clipboard.setStringAsync(profile.shareCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const styles = makeStyles(colors);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing['3xl'] }} />
            </SafeAreaView>
        );
    }

    if (isError || !profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>ARCHIVE NOT FOUND</Text>
                    <Text style={styles.emptyDesc}>This researcher's records could not be located.</Text>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>RETURN</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const isFriend = profile.friendshipStatus === 'accepted';
    const isPendingOutgoing = profile.friendshipStatus === 'pending' && profile.friendshipDirection === 'outgoing';
    const isPendingIncoming = profile.friendshipStatus === 'pending' && profile.friendshipDirection === 'incoming';
    const isActionLoading = sendRequest.isPending || acceptRequest.isPending || removeFriend.isPending;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* User Info */}
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        {profile.avatar ? (
                            <UserIcon size={32} color={colors.text} /> // Fallback if no avatar URL loading
                        ) : (
                            <Text style={styles.avatarText}>
                                {profile.username?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.nameRow}>
                        <Text style={styles.username}>{profile.username}</Text>
                        {profile.isOwner ? (
                            <View style={[styles.roleBadge, { backgroundColor: '#f59e0b' }]}>
                                <Text style={styles.roleBadgeText}>OWNER</Text>
                            </View>
                        ) : profile.isAdmin ? (
                            <View style={[styles.roleBadge, { backgroundColor: '#ef4444' }]}>
                                <Text style={styles.roleBadgeText}>ADMIN</Text>
                            </View>
                        ) : null}
                    </View>

                    {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <View style={styles.statIconRow}>
                            <Layers size={20} color={colors.accent} />
                            <Text style={styles.statValue}>{profile.deckCount || 0}</Text>
                        </View>
                        <Text style={styles.statLabel}>DECKS</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={styles.statIconRow}>
                            <Calendar size={16} color={colors.textSecondary} />
                            <Text style={[styles.statValue, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                                {formatDate(profile.createdAt)}
                            </Text>
                        </View>
                        <Text style={styles.statLabel}>JOINED</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    {isFriend ? (
                        <>
                            <Pressable
                                style={styles.primaryBtn}
                                onPress={() => router.push(`/messages/${profile.id}` as any)}
                            >
                                <MessageCircle size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Message</Text>
                            </Pressable>
                            <Pressable
                                style={styles.dangerBtn}
                                onPress={() => removeFriend.mutate()}
                                disabled={isActionLoading}
                            >
                                <UserMinus size={20} color="#ef4444" />
                            </Pressable>
                        </>
                    ) : isPendingIncoming ? (
                        <>
                            <Pressable
                                style={[styles.primaryBtn, { backgroundColor: '#22c55e' }]}
                                onPress={() => acceptRequest.mutate()}
                                disabled={isActionLoading}
                            >
                                <Check size={20} color="#fff" />
                                <Text style={styles.primaryBtnText}>Accept Request</Text>
                            </Pressable>
                            <Pressable
                                style={styles.dangerBtn}
                                onPress={() => removeFriend.mutate()}
                                disabled={isActionLoading}
                            >
                                <X size={20} color="#ef4444" />
                            </Pressable>
                        </>
                    ) : isPendingOutgoing ? (
                        <Pressable
                            style={styles.outlineBtn}
                            onPress={() => removeFriend.mutate()}
                            disabled={isActionLoading}
                        >
                            <Clock size={20} color={colors.textSecondary} />
                            <Text style={styles.outlineBtnText}>Request Pending</Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            style={styles.primaryBtn}
                            onPress={() => sendRequest.mutate()}
                            disabled={isActionLoading}
                        >
                            <UserPlus size={20} color="#fff" />
                            <Text style={styles.primaryBtnText}>Add Friend</Text>
                        </Pressable>
                    )}
                </View>

                {/* Share Code */}
                {profile.shareCode && (
                    <View style={styles.shareCard}>
                        <View style={styles.shareRow}>
                            <View>
                                <Text style={styles.shareLabel}>SHARE CODE</Text>
                                <Text style={styles.shareCodeText}>{profile.shareCode}</Text>
                            </View>
                            <Pressable style={styles.copyBtn} onPress={copyShareCode}>
                                {copied ? <Check size={20} color="#22c55e" /> : <Copy size={20} color={colors.text} />}
                            </Pressable>
                        </View>
                        <Text style={styles.shareDesc}>
                            Use this code to find and share decks with {profile.username}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['3xl'] },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        },
        backButton: { padding: spacing.xs, marginLeft: -spacing.xs },
        headerTitle: { fontFamily: fonts.displayBold, fontSize: fontSize.xl, color: colors.text },

        empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
        emptyTitle: { fontFamily: fonts.monoBold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md, letterSpacing: 2 },
        emptyDesc: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
        backBtn: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
        backBtnText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.text },

        // Info
        userInfo: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.md },
        avatar: {
            width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surface,
            borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center',
            marginBottom: spacing.md
        },
        avatarText: { fontFamily: fonts.displayBold, fontSize: 36, color: colors.text },
        nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
        username: { fontFamily: fonts.displayBold, fontSize: fontSize['3xl'], color: colors.text },
        roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full },
        roleBadgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: '#fff', letterSpacing: 1 },
        bio: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, marginTop: spacing.sm },

        // Stats
        statsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing['3xl'], marginBottom: spacing.xl },
        statBox: { alignItems: 'center' },
        statIconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
        statValue: { fontFamily: fonts.bodyBold, fontSize: fontSize.xl, color: colors.text },
        statLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5 },

        // Actions
        actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
        primaryBtn: {
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
            backgroundColor: colors.accent, borderRadius: radii.xl, paddingVertical: 14
        },
        primaryBtnText: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: '#fff' },
        dangerBtn: {
            paddingHorizontal: spacing.xl, backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: radii.xl, justifyContent: 'center', alignItems: 'center'
        },
        outlineBtn: {
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.xl, paddingVertical: 14
        },
        outlineBtnText: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: colors.textSecondary },

        // Share Code
        shareCard: {
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: radii.xl, padding: spacing.md
        },
        shareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
        shareLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5, marginBottom: 4 },
        shareCodeText: { fontFamily: fonts.monoBold, fontSize: fontSize.xl, letterSpacing: 3, color: colors.text },
        copyBtn: { padding: spacing.sm, backgroundColor: colors.bg, borderRadius: radii.lg },
        shareDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary }
    });
}
