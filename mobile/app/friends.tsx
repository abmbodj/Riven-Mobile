import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, UserMinus, Check, X, MessageCircle, Users, Clock, Leaf, User as UserIcon } from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { api, Friend } from '../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../src/constants/tokens';

export default function FriendsScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();

    const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const { data: friendsData, isLoading } = useQuery({
        queryKey: ['friends'],
        queryFn: api.getFriends,
    });

    // Normalize return so it's always an array
    const friends = friendsData || [];

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                try {
                    const results = await api.searchUsers(searchQuery);
                    setSearchResults(results as any[]);
                } catch {
                    // silent fail
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const sendRequest = useMutation({
        mutationFn: (userId: number) => api.sendFriendRequest(userId),
        onSuccess: (data, variables) => {
            setSearchResults(prev => prev.map(u => u.id === variables ? { ...u, requestSent: true } : u));
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
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

    const styles = makeStyles(colors);

    const acceptedFriends = friends.filter((f) => f.status === 'accepted');
    const incomingRequests = friends.filter((f) => f.status === 'pending' && !f.isOutgoing);
    const outgoingRequests = friends.filter((f) => f.status === 'pending' && f.isOutgoing);

    const handleDeclineOrRemove = (userId: number, isRequest = false) => {
        Alert.alert(
            isRequest ? 'Decline Request' : 'Remove Friend',
            isRequest ? 'Decline this friend request?' : 'Remove this user from your friends?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: isRequest ? 'Decline' : 'Remove', style: 'destructive', onPress: () => removeFriend.mutate(userId) },
            ]
        );
    };

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <View style={styles.friendCard}>
            <View style={styles.cardAccent} />
            <Pressable style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: spacing.md }} onPress={() => router.push(`/user/${item.id}`)}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.friendInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.friendName}>{item.username}</Text>
                        {item.role && item.role !== 'user' && (
                            <View style={[styles.roleBadge, item.role === 'owner' ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#ef4444' }]}>
                                <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                    {item.bio && <Text style={styles.friendBio} numberOfLines={1}>{item.bio}</Text>}
                </View>
            </Pressable>
            <View style={styles.actionRow}>
                <Pressable
                    style={styles.messageBtn}
                    onPress={() => router.push(`/messages/${item.id}` as any)}
                >
                    <MessageCircle size={20} color={botanical.forest} />
                </Pressable>
                <Pressable
                    style={styles.dangerBtn}
                    onPress={() => handleDeclineOrRemove(item.id)}
                >
                    <UserMinus size={20} color="#ef4444" />
                </Pressable>
            </View>
        </View>
    );

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
                    <Text style={styles.title}>Friends</Text>
                    <Text style={styles.subtitle}>Connect with other learners</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    <Pressable
                        style={[styles.tabBtn, tab === 'friends' ? styles.tabBtnActive : styles.tabBtnInactive]}
                        onPress={() => setTab('friends')}
                    >
                        <Users size={16} color={tab === 'friends' ? '#fff' : botanical.sepia} />
                        <Text style={[styles.tabText, tab === 'friends' ? styles.tabTextActive : styles.tabTextInactive]}>
                            Friends ({acceptedFriends.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tabBtn, tab === 'requests' ? styles.tabBtnActive : styles.tabBtnInactive]}
                        onPress={() => setTab('requests')}
                    >
                        <Clock size={16} color={tab === 'requests' ? '#fff' : botanical.sepia} />
                        <Text style={[styles.tabText, tab === 'requests' ? styles.tabTextActive : styles.tabTextInactive]}>
                            Requests
                        </Text>
                        {incomingRequests.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{incomingRequests.length}</Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable
                        style={[styles.tabBtn, tab === 'search' ? styles.tabBtnActive : styles.tabBtnInactive]}
                        onPress={() => setTab('search')}
                    >
                        <Search size={16} color={tab === 'search' ? '#fff' : botanical.sepia} />
                        <Text style={[styles.tabText, tab === 'search' ? styles.tabTextActive : styles.tabTextInactive]}>
                            Find
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            <View style={styles.content}>
                {/* FRIENDS TAB */}
                {tab === 'friends' && (
                    isLoading ? (
                        <View style={styles.center}><ActivityIndicator size="large" color={botanical.forest} /></View>
                    ) : acceptedFriends.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <View style={styles.emptyIconWrap}>
                                <Users size={32} color={botanical.forest} />
                            </View>
                            <Text style={styles.emptyTitle}>No friends yet</Text>
                            <Text style={styles.emptySub}>Search for users to add them as friends</Text>
                            <Pressable style={styles.primaryBtn} onPress={() => setTab('search')}>
                                <Text style={styles.primaryBtnText}>Find Friends</Text>
                            </Pressable>
                        </View>
                    ) : (
                        // @ts-ignore
                        <FlashList
                            data={acceptedFriends}
                            renderItem={renderFriendItem}
                            estimatedItemSize={80}
                            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                            contentContainerStyle={{ paddingBottom: spacing.xl }}
                        />
                    )
                )}

                {/* REQUESTS TAB */}
                {tab === 'requests' && (
                    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
                        {incomingRequests.length > 0 && (
                            <View style={styles.reqSection}>
                                <View style={styles.reqHeader}>
                                    <View style={styles.reqDotRed} />
                                    <Text style={styles.reqTitle}>INCOMING REQUESTS</Text>
                                </View>
                                {incomingRequests.map(req => (
                                    <View key={req.id} style={[styles.friendCard, { borderLeftWidth: 2, borderLeftColor: '#ef4444' }]}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{req.username.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.friendInfo}>
                                            <Text style={styles.friendName}>{req.username}</Text>
                                            <Text style={styles.friendBio}>Wants to be friends</Text>
                                        </View>
                                        <View style={styles.actionRow}>
                                            <Pressable style={[styles.messageBtn, { backgroundColor: botanical.forest }]} onPress={() => acceptRequest.mutate(req.id)}>
                                                <Check size={20} color="#fff" />
                                            </Pressable>
                                            <Pressable style={styles.dangerBtn} onPress={() => removeFriend.mutate(req.id)}>
                                                <X size={20} color="#ef4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {outgoingRequests.length > 0 && (
                            <View style={styles.reqSection}>
                                <Text style={[styles.reqTitle, { marginLeft: spacing.xs, marginTop: spacing.md }]}>PENDING REQUESTS</Text>
                                {outgoingRequests.map(req => (
                                    <View key={req.id} style={[styles.friendCard, { opacity: 0.8, marginTop: spacing.sm }]}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{req.username.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.friendInfo}>
                                            <Text style={styles.friendName}>{req.username}</Text>
                                            <Text style={[styles.friendBio, { fontStyle: 'italic' }]}>Request sent...</Text>
                                        </View>
                                        <Pressable style={styles.cancelBtn} onPress={() => removeFriend.mutate(req.id)}>
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}

                        {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyIconWrap}>
                                    <Clock size={32} color={botanical.forest} />
                                </View>
                                <Text style={styles.emptySub}>No pending requests</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* SEARCH TAB */}
                {tab === 'search' && (
                    <View style={{ flex: 1 }}>
                        <View style={styles.searchBar}>
                            <Search size={20} color={botanical.forest} style={{ marginLeft: spacing.md }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by username or block code"
                                placeholderTextColor="rgba(143,166,168,0.5)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                                autoFocus
                            />
                        </View>

                        {searching ? (
                            <View style={styles.center}><ActivityIndicator size="large" color={botanical.forest} /></View>
                        ) : searchQuery.length < 2 ? (
                            <View style={styles.emptyCard}>
                                <View style={[styles.emptyIconWrap, { backgroundColor: 'rgba(122,158,114,0.1)' }]}>
                                    <Search size={24} color={botanical.sepia} />
                                </View>
                                <Text style={styles.emptySub}>Enter at least 2 characters to search</Text>
                            </View>
                        ) : searchResults.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptySub}>No users found</Text>
                            </View>
                        ) : (
                            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
                                {searchResults.map(user => {
                                    const existingFriend = friends.find(f => f.id === user.id);
                                    const isFriend = existingFriend?.status === 'accepted';
                                    const isPending = existingFriend?.status === 'pending';

                                    return (
                                        <View key={user.id} style={[styles.friendCard, { marginBottom: spacing.sm }]}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <View style={styles.friendInfo}>
                                                <Text style={styles.friendName}>{user.username}</Text>
                                                {user.bio && <Text style={styles.friendBio} numberOfLines={1}>{user.bio}</Text>}
                                            </View>
                                            {isFriend ? (
                                                <View style={styles.badgeLabel}>
                                                    <Text style={styles.badgeLabelText}>FRIENDS</Text>
                                                </View>
                                            ) : isPending || user.requestSent ? (
                                                <Text style={[styles.friendBio, { fontStyle: 'italic', paddingRight: spacing.sm }]}>Pending</Text>
                                            ) : (
                                                <Pressable
                                                    style={styles.addBtn}
                                                    onPress={() => sendRequest.mutate(user.id)}
                                                >
                                                    <UserPlus size={20} color="#fff" />
                                                </Pressable>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row', alignItems: 'flex-start',
            paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md,
        },
        backButton: { padding: spacing.xs, marginRight: spacing.sm },
        headerTitleWrap: { flex: 1, position: 'relative' },
        leafBg: { position: 'absolute', top: -10, left: -20, opacity: 0.5 },
        title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.text, marginBottom: 2 },
        subtitle: { fontFamily: fonts.mono, fontSize: 13, color: botanical.sepia },

        tabsContainer: { paddingVertical: spacing.sm, paddingBottom: spacing.md },
        tabsScroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
        tabBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radii.full, position: 'relative' },
        tabBtnActive: { backgroundColor: botanical.forest },
        tabBtnInactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: 'transparent' },
        tabText: { fontFamily: fonts.bodyBold, fontSize: 14 },
        tabTextActive: { color: '#fff' },
        tabTextInactive: { color: botanical.sepia },
        badge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.bg },
        badgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: '#fff' },

        content: { flex: 1, paddingHorizontal: spacing.md },
        center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

        // Empty States
        emptyCard: {
            backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl,
            alignItems: 'center', marginVertical: spacing.xl, position: 'relative', overflow: 'hidden'
        },
        emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
        emptyTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, color: botanical.parchment, marginBottom: spacing.xs },
        emptySub: { fontFamily: fonts.mono, fontSize: 13, color: botanical.sepia, textAlign: 'center', marginBottom: spacing.lg },
        primaryBtn: { backgroundColor: botanical.forest, paddingHorizontal: spacing.xl, paddingVertical: 10, borderRadius: radii.full },
        primaryBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },

        // List Cards
        friendCard: {
            backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md,
            flexDirection: 'row', alignItems: 'center', gap: spacing.md, position: 'relative', overflow: 'hidden'
        },
        cardAccent: { position: 'absolute', top: 8, left: 8, width: 8, height: 8, borderTopWidth: 1, borderLeftWidth: 1, borderColor: 'rgba(122,158,114,0.3)', borderTopLeftRadius: 2 },
        avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: botanical.forest },
        avatarText: { fontFamily: fonts.displayBold, fontSize: 20, color: botanical.forest },
        friendInfo: { flex: 1 },
        nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
        friendName: { fontFamily: fonts.display, fontSize: 18, color: botanical.parchment, fontWeight: '600' },
        friendBio: { fontFamily: fonts.mono, fontSize: 11, color: botanical.sepia, marginTop: 2 },
        roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full },
        roleText: { fontFamily: fonts.monoBold, fontSize: 8, color: '#fff', letterSpacing: 0.5 },

        actionRow: { flexDirection: 'row', gap: spacing.xs },
        messageBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center' },
        dangerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },
        addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: botanical.forest, justifyContent: 'center', alignItems: 'center' },
        cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(122,158,114,0.2)' },
        cancelBtnText: { fontFamily: fonts.mono, fontSize: 12, color: botanical.sepia },
        badgeLabel: { backgroundColor: 'rgba(122,158,114,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.md },
        badgeLabelText: { fontFamily: fonts.bodyBold, fontSize: 10, color: botanical.forest, letterSpacing: 1 },

        // Req Section
        reqSection: { marginBottom: spacing.lg },
        reqHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm, marginLeft: spacing.xs },
        reqDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
        reqTitle: { fontFamily: fonts.monoBold, fontSize: 10, letterSpacing: 1.5, color: botanical.sepia },

        // Search
        searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 2, borderColor: 'transparent', marginBottom: spacing.lg, ...cardShadow },
        searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: spacing.md, fontFamily: fonts.mono, fontSize: 14, color: botanical.parchment },
    });
}
