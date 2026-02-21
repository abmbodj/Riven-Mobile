import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft, Users, Layers as LayersIcon, CreditCard, Zap, Activity, TrendingUp, UserCircle,
    Crown, Trash2, Search, Plus, X, Send, MessageSquare, Database, BarChart3, Megaphone
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { api, AdminUser, AdminStats, AdminMessage } from '../src/lib/api';
import { fonts, spacing, radii, fontSize, cardShadow, botanical } from '../src/constants/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Admin-specific colors (Supabase style)
const ADMIN_COLORS = {
    primary: '#3ECF8E',
    bg: '#121212',
    surface: '#232323',
    border: 'rgba(255,255,255,0.1)',
    text: '#EDEDED',
    textMuted: 'rgba(255,255,255,0.4)',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    success: '#3ECF8E',
};

type TabType = 'overview' | 'users' | 'broadcasts';

export default function AdminScreen() {
    const defaultColors = useThemeStore((s) => s.colors);
    const currentUser = useAuthStore((s) => s.user);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Data queries
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: api.getAdminStats,
        enabled: activeTab === 'overview',
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: api.getAdminUsers,
        enabled: activeTab === 'users',
    });

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['admin-messages'],
        queryFn: api.getAdminMessages,
        enabled: activeTab === 'broadcasts',
    });

    const isLoading = (activeTab === 'overview' && statsLoading) ||
        (activeTab === 'users' && usersLoading) ||
        (activeTab === 'broadcasts' && messagesLoading);

    const styles = makeStyles(ADMIN_COLORS);

    // If not admin, shouldn't be here
    if (!currentUser?.isAdmin) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: ADMIN_COLORS.danger, fontFamily: fonts.displayBold }}>Unauthorized</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                    <Text style={{ color: 'white' }}>Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                        <ArrowLeft size={24} color={ADMIN_COLORS.text} />
                    </Pressable>
                    <View style={styles.titleRow}>
                        <View style={styles.titleIconWrap}>
                            <Database size={20} color={ADMIN_COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.title}>Admin Panel</Text>
                            <Text style={styles.subtitle}>DASHBOARD</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                        <TabButton id="overview" label="Overview" icon={BarChart3} active={activeTab === 'overview'} setTab={setActiveTab} />
                        <TabButton id="users" label="Users" icon={Users} active={activeTab === 'users'} setTab={setActiveTab} />
                        <TabButton id="broadcasts" label="Broadcasts" icon={Megaphone} active={activeTab === 'broadcasts'} setTab={setActiveTab} />
                    </ScrollView>
                </View>
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
                        <Text style={styles.loadingText}>SYNCING DATA...</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === 'overview' && stats && <OverviewTab stats={stats} />}
                        {activeTab === 'users' && users && <UsersTab users={users} isOwner={!!currentUser?.isOwner} />}
                        {activeTab === 'broadcasts' && messages && <BroadcastsTab messages={messages} />}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({ stats }: { stats: AdminStats }) {
    const styles = makeStyles(ADMIN_COLORS);

    return (
        <ScrollView style={styles.tabContainer} contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>
            {/* Stat Cards */}
            <View style={styles.statsGrid}>
                <StatCard title="Total Users" value={stats.users} icon={Users} color={ADMIN_COLORS.primary} trend={stats.recentSignups} />
                <StatCard title="Total Decks" value={stats.decks} icon={LayersIcon} color={ADMIN_COLORS.warning} />
                <StatCard title="Total Cards" value={stats.cards} icon={CreditCard} color={ADMIN_COLORS.info} />
                <StatCard title="Study Sessions" value={stats.recentSessions} icon={Zap} color="#EC4899" trend={Math.floor(stats.recentSessions * 0.1)} />
            </View>

            {/* Chart Area */}
            <View style={styles.chartArea}>
                <View style={styles.chartHeader}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Activity size={18} color={ADMIN_COLORS.primary} />
                            <Text style={styles.chartTitle}>30-Day Activity</Text>
                        </View>
                        <Text style={styles.chartSub}>Study sessions completed over time</Text>
                    </View>
                    <View style={styles.chartBadge}>
                        <Text style={styles.chartBadgeText}>{stats.recentSessions} TOTAL</Text>
                    </View>
                </View>
                <ActivityChart data={stats.dailyActivity || []} />
            </View>

            {/* Trending Decks */}
            <View style={styles.trendingArea}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm, paddingHorizontal: spacing.sm }}>
                    <TrendingUp size={16} color={ADMIN_COLORS.textMuted} />
                    <Text style={styles.trendingTitle}>TRENDING DECKS (30 DAYS)</Text>
                </View>

                {(!stats.topDecks || stats.topDecks.length === 0) ? (
                    <Text style={styles.emptyText}>No deck activity in the last 30 days.</Text>
                ) : (
                    <View style={{ gap: spacing.sm }}>
                        {stats.topDecks.map((deck, i) => (
                            <View key={i} style={styles.deckCard}>
                                <View style={styles.deckRank}>
                                    <Text style={styles.deckRankText}>#{i + 1}</Text>
                                </View>
                                <View style={styles.deckInfo}>
                                    <Text style={styles.deckName} numberOfLines={1}>{deck.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        <UserCircle size={12} color={ADMIN_COLORS.textMuted} />
                                        <Text style={styles.deckCreator} numberOfLines={1}>{deck.creator}</Text>
                                    </View>
                                </View>
                                <View style={styles.deckStats}>
                                    <Text style={styles.deckPlays}>{deck.sessions}</Text>
                                    <Text style={styles.deckPlaysLabel}>PLAYS</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }: { title: string; value: number; icon: any; color: string; trend?: number }) {
    return (
        <View style={[makeStyles(ADMIN_COLORS).statCard, { width: (SCREEN_WIDTH - spacing.md * 2 - spacing.md) / 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <View style={[makeStyles(ADMIN_COLORS).statIconWrap, { backgroundColor: color + '15', borderColor: color + '30' }]}>
                    <Icon size={20} color={color} />
                </View>
                {(trend !== undefined && trend > 0) && (
                    <View style={[makeStyles(ADMIN_COLORS).trendBadge, { backgroundColor: color + '20' }]}>
                        <ArrowLeft size={10} color={color} style={{ transform: [{ rotate: '90deg' }] }} />
                        <Text style={[makeStyles(ADMIN_COLORS).trendText, { color }]}>{trend} NEW</Text>
                    </View>
                )}
            </View>
            <Text style={makeStyles(ADMIN_COLORS).statValue}>{value?.toLocaleString() || 0}</Text>
            <Text style={makeStyles(ADMIN_COLORS).statLabel}>{title}</Text>
        </View>
    );
}

function ActivityChart({ data }: { data: { date: string, count: number }[] }) {
    if (!data || data.length === 0) return <View style={{ height: 150 }} />;

    const width = SCREEN_WIDTH - spacing.md * 2 - 32; // padding of container
    const height = 120;
    const max = Math.max(...data.map(d => d.count), 1) * 1.1;
    const gap = width / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
        const x = i * gap;
        const y = height - (d.count / max) * height;
        return { x, y };
    });

    let pathD = `M 0,${points[0] ? points[0].y : height}`;
    for (let i = 0; i < points.length - 1; i++) {
        const cx = points[i].x + (points[i + 1].x - points[i].x) / 2;
        pathD += ` C ${cx},${points[i].y} ${cx},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }

    const filledPath = `${pathD} L ${width},${height} L 0,${height} Z`;

    return (
        <View style={{ width: '100%', height: height + 20, marginTop: spacing.md }}>
            <Svg width={width} height={height} style={{ overflow: 'visible' }}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={ADMIN_COLORS.primary} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={ADMIN_COLORS.primary} stopOpacity="0" />
                    </LinearGradient>
                </Defs>
                <Path d={filledPath} fill="url(#grad)" />
                <Path d={pathD} fill="none" stroke={ADMIN_COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => {
                    // Only draw dots for some points to prevent crowding
                    if (data.length > 10 && i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
                    return (
                        <Circle key={i} cx={p.x} cy={p.y} r="3" fill="#121212" stroke={ADMIN_COLORS.primary} strokeWidth="2" />
                    );
                })}
            </Svg>
        </View>
    );
}

// ============================================================================
// Users Tab
// ============================================================================

function UsersTab({ users, isOwner }: { users: AdminUser[], isOwner: boolean }) {
    const styles = makeStyles(ADMIN_COLORS);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const updateRole = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) => api.updateUserRole(userId, role),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const deleteUser = useMutation({
        mutationFn: (userId: number) => api.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const low = search.toLowerCase();
        return users.filter(u => u.username.toLowerCase().includes(low) || u.email.toLowerCase().includes(low));
    }, [users, search]);

    const handleRoleUpdate = (user: AdminUser) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        Alert.alert('Confirm Role Change', `Change ${user.username} to ${newRole.toUpperCase()}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => updateRole.mutate({ userId: user.id, role: newRole }) }
        ]);
    };

    const handleDelete = (user: AdminUser) => {
        Alert.alert('Delete User', `Permanently delete ${user.username}? This cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteUser.mutate(user.id) }
        ]);
    };

    const renderUser = useCallback(({ item }: { item: AdminUser }) => {
        const role = item.role || (item.isAdmin ? 'admin' : 'user');
        const badgeColor = role === 'owner' ? ADMIN_COLORS.warning : role === 'admin' ? ADMIN_COLORS.primary : '#6B7280';

        return (
            <View style={styles.userRow}>
                <View style={styles.userRowContent}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Text style={styles.userName} numberOfLines={1}>{item.username}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: badgeColor + '20' }]}>
                                <Text style={[styles.roleBadgeText, { color: badgeColor }]}>{role.toUpperCase()}</Text>
                            </View>
                        </View>
                        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                    </View>
                </View>
                <View style={styles.userActions}>
                    {isOwner && role !== 'owner' && (
                        <Pressable
                            style={[styles.smallBtn, { backgroundColor: role === 'admin' ? ADMIN_COLORS.warning + '15' : ADMIN_COLORS.primary + '15' }]}
                            onPress={() => handleRoleUpdate(item)}
                        >
                            <Text style={[styles.smallBtnText, { color: role === 'admin' ? ADMIN_COLORS.warning : ADMIN_COLORS.primary }]}>
                                {role === 'admin' ? 'Demote' : 'Promote'}
                            </Text>
                        </Pressable>
                    )}
                    {role !== 'owner' && (
                        <Pressable style={styles.iconBtnDanger} onPress={() => handleDelete(item)}>
                            <Trash2 size={14} color={ADMIN_COLORS.danger} />
                        </Pressable>
                    )}
                </View>
            </View>
        );
    }, [isOwner, styles]);

    return (
        <View style={styles.tabContainer}>
            <View style={styles.searchBarWrap}>
                <View style={styles.searchInputWrap}>
                    <Search size={16} color={ADMIN_COLORS.textMuted} style={{ marginLeft: spacing.md }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        placeholderTextColor={ADMIN_COLORS.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                    />
                </View>
                <Text style={styles.searchCount}>{filteredUsers.length} users</Text>
            </View>

            <FlashList
                data={filteredUsers}
                renderItem={renderUser}
                estimatedItemSize={70}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
            />
        </View>
    );
}

// ============================================================================
// Broadcasts Tab
// ============================================================================

function BroadcastsTab({ messages }: { messages: AdminMessage[] }) {
    const styles = makeStyles(ADMIN_COLORS);
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('info');

    const createMessage = useMutation({
        mutationFn: () => api.createAdminMessage(title, content, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
            setShowForm(false);
            setTitle('');
            setContent('');
            setType('info');
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const updateMessage = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => api.updateAdminMessage(id, { isActive }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const deleteMessage = useMutation({
        mutationFn: (id: number) => api.deleteAdminMessage(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const renderMessage = useCallback(({ item }: { item: AdminMessage }) => {
        const typeColor = ADMIN_COLORS[item.type as keyof typeof ADMIN_COLORS] || ADMIN_COLORS.info;

        return (
            <View style={[styles.msgCard, !item.isActive && styles.msgCardInactive]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.msgDot, { backgroundColor: typeColor as string }]} />
                        <Text style={styles.msgTitle} numberOfLines={1}>{item.title}</Text>
                    </View>
                    <Text style={styles.msgDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.msgContent} numberOfLines={2}>{item.content}</Text>
                <View style={styles.msgActions}>
                    <Pressable
                        style={styles.msgSmallBtn}
                        onPress={() => updateMessage.mutate({ id: item.id, isActive: !item.isActive })}
                    >
                        <Text style={styles.msgSmallBtnText}>{item.isActive ? 'Deactivate' : 'Activate'}</Text>
                    </Pressable>
                    <Pressable
                        style={styles.msgDangerBtn}
                        onPress={() => deleteMessage.mutate(item.id)}
                    >
                        <Text style={styles.msgDangerBtnText}>Delete</Text>
                    </Pressable>
                </View>
            </View>
        );
    }, [styles]);

    return (
        <KeyboardAvoidingView style={styles.tabContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {showForm ? (
                <View style={styles.formCard}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>Compose Message</Text>
                        <Pressable onPress={() => setShowForm(false)} hitSlop={10}>
                            <X size={18} color={ADMIN_COLORS.textMuted} />
                        </Pressable>
                    </View>
                    <View style={styles.formBody}>
                        <Text style={styles.formLabel}>TYPE</Text>
                        <View style={styles.typeRow}>
                            {['info', 'success', 'warning', 'danger'].map(t => {
                                const c = ADMIN_COLORS[t as keyof typeof ADMIN_COLORS] as string;
                                const active = type === t;
                                return (
                                    <Pressable
                                        key={t}
                                        onPress={() => setType(t)}
                                        style={[styles.typeBtn, active && { backgroundColor: c + '15', borderColor: c }]}
                                    >
                                        <Text style={[styles.typeBtnText, active && { color: c }]}>{t}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        <TextInput
                            style={styles.formInput}
                            placeholder="Message Title"
                            placeholderTextColor={ADMIN_COLORS.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Message Content..."
                            placeholderTextColor={ADMIN_COLORS.textMuted}
                            value={content}
                            onChangeText={setContent}
                            multiline
                        />
                        <Pressable
                            style={[styles.formSubmit, (!title.trim() || !content.trim() || createMessage.isPending) && { opacity: 0.5 }]}
                            onPress={() => createMessage.mutate()}
                            disabled={!title.trim() || !content.trim() || createMessage.isPending}
                        >
                            {createMessage.isPending ? <ActivityIndicator size="small" color="#000" /> : <Send size={16} color="#000" />}
                            <Text style={styles.formSubmitText}>Send Broadcast</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <Pressable style={styles.createBtn} onPress={() => setShowForm(true)}>
                    <Plus size={20} color={ADMIN_COLORS.textMuted} />
                    <Text style={styles.createBtnText}>Create New Broadcast</Text>
                </Pressable>
            )}

            <FlashList
                data={messages}
                renderItem={renderMessage}
                estimatedItemSize={120}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing['2xl'] }}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <MessageSquare size={48} color={ADMIN_COLORS.border} />
                        <Text style={styles.emptyText}>No active broadcasts</Text>
                    </View>
                }
            />
        </KeyboardAvoidingView>
    );
}

// ============================================================================
// Helpers
// ============================================================================

function TabButton({ id, label, icon: Icon, active, setTab }: { id: TabType, label: string, icon: any, active: boolean, setTab: (t: TabType) => void }) {
    const styles = makeStyles(ADMIN_COLORS);
    return (
        <Pressable onPress={() => setTab(id)} style={[styles.tabBtn, active && styles.tabBtnActive]}>
            <Icon size={14} color={active ? '#000' : ADMIN_COLORS.textMuted} />
            <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
        </Pressable>
    );
}

function makeStyles(colors: typeof ADMIN_COLORS) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            backgroundColor: 'rgba(18,18,18,0.8)',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            zIndex: 10,
        },
        headerTop: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
        backBtn: { marginRight: spacing.md },
        titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        titleIconWrap: { width: 40, height: 40, borderRadius: radii.xl, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30', justifyContent: 'center', alignItems: 'center' },
        title: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.text, marginBottom: -2 },
        subtitle: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.textMuted, letterSpacing: 1 },

        tabsWrapper: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
        tabsScroll: { gap: spacing.xs },
        tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radii.md },
        tabBtnActive: { backgroundColor: colors.primary, ...cardShadow, shadowColor: colors.primary },
        tabBtnText: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.textMuted },
        tabBtnTextActive: { color: '#000' },

        content: { flex: 1 },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        loadingText: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.textMuted, marginTop: spacing.md, letterSpacing: 2 },
        tabContainer: { flex: 1 },

        // Overview
        statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
        statCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
        statIconWrap: { width: 40, height: 40, borderRadius: radii.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
        trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 4, borderRadius: radii.sm },
        trendText: { fontFamily: fonts.monoBold, fontSize: 10 },
        statValue: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.text, marginBottom: 2 },
        statLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },

        chartArea: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
        chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        chartTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.text },
        chartSub: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, marginTop: 2 },
        chartBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' },
        chartBadgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.primary },

        trendingArea: { marginTop: spacing.xs },
        trendingTitle: { fontFamily: fonts.monoBold, fontSize: 12, color: colors.textMuted, letterSpacing: 1 },
        emptyText: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: spacing.lg },
        deckCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
        deckRank: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
        deckRankText: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.textMuted },
        deckInfo: { flex: 1 },
        deckName: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.text },
        deckCreator: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
        deckStats: { paddingLeft: spacing.md, borderLeftWidth: 1, borderLeftColor: colors.border, alignItems: 'center' },
        deckPlays: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.primary, marginBottom: -2 },
        deckPlaysLabel: { fontFamily: fonts.monoBold, fontSize: 9, color: colors.textMuted, letterSpacing: 1 },

        // Users
        searchBarWrap: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
        searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
        searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: spacing.sm, fontFamily: fonts.mono, fontSize: 13, color: colors.text },
        searchCount: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.textMuted },
        userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
        userRowContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
        userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
        userAvatarText: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.text },
        userName: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.text },
        roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        roleBadgeText: { fontFamily: fonts.monoBold, fontSize: 9, letterSpacing: 0.5 },
        userEmail: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, marginTop: 2 },
        userActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        smallBtn: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.sm },
        smallBtnText: { fontFamily: fonts.monoBold, fontSize: 11 },
        iconBtnDanger: { width: 32, height: 32, borderRadius: radii.md, backgroundColor: colors.danger + '15', justifyContent: 'center', alignItems: 'center' },

        // Broadcasts
        createBtn: { margin: spacing.md, paddingVertical: spacing.md, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
        createBtnText: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.textMuted },
        formCard: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
        formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.02)', borderBottomWidth: 1, borderBottomColor: colors.border },
        formTitle: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.text },
        formBody: { padding: spacing.md, gap: spacing.md },
        formLabel: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: -8 },
        typeRow: { flexDirection: 'row', gap: spacing.xs },
        typeBtn: { flex: 1, paddingVertical: 8, borderRadius: radii.sm, borderWidth: 1, borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
        typeBtnText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.textMuted, textTransform: 'capitalize' },
        formInput: { padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, fontFamily: fonts.body, fontSize: 14, color: colors.text },
        formSubmit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: radii.md, marginTop: spacing.xs },
        formSubmitText: { fontFamily: fonts.displayBold, fontSize: 15, color: '#000' },

        msgCard: { backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
        msgCardInactive: { opacity: 0.5, backgroundColor: 'transparent' },
        msgDot: { width: 8, height: 8, borderRadius: 4 },
        msgTitle: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.text, flex: 1 },
        msgDate: { fontFamily: fonts.mono, fontSize: 10, color: colors.textMuted },
        msgContent: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md, lineHeight: 18 },
        msgActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
        msgSmallBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.sm },
        msgSmallBtnText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.textMuted },
        msgDangerBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.danger + '15', borderRadius: radii.sm },
        msgDangerBtnText: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.danger },
    });
}
