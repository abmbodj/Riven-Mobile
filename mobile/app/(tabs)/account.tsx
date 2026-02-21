import {
    View, Text, Pressable, StyleSheet, ScrollView, Alert, ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
    LogOut, ChevronRight, Settings, Users, MessageCircle, Shield, Edit3, Leaf
} from 'lucide-react-native';
import Svg, { Defs, RadialGradient as SVGRadialGradient, Stop, Rect } from 'react-native-svg';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../src/constants/tokens';

export default function AccountScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: friendsData } = useQuery({
        queryKey: ['friends'],
        queryFn: api.getFriends,
    });

    const { data: unreadData } = useQuery({
        queryKey: ['unreadCount'],
        queryFn: api.getUnreadCount,
    });

    const friendsCount = friendsData?.filter(f => f.status === 'accepted').length || 0;
    const unreadCount = unreadData?.count || 0;

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try { await api.logout(); } catch { }
                    await logout();
                },
            },
        ]);
    };

    const styles = makeStyles(colors);

    if (!user) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
                {/* Atmospheric Header */}
                <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                    <View style={StyleSheet.absoluteFill}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f2026' }]} />
                        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                            <Defs>
                                <SVGRadialGradient id="glow" cx="50%" cy="50%" rx="80%" ry="80%">
                                    <Stop offset="0%" stopColor="rgba(122,158,114,0.15)" />
                                    <Stop offset="100%" stopColor="transparent" />
                                </SVGRadialGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
                        </Svg>
                        <ImageBackground
                            source={{ uri: 'https://www.transparenttextures.com/patterns/cubes.png' }}
                            style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
                        />
                        {/* Decorative Leaves */}
                        <View style={{ position: 'absolute', bottom: -30, right: -30, transform: [{ rotate: '12deg' }], opacity: 0.05 }}>
                            <Leaf size={160} color={botanical.forest} />
                        </View>
                        <View style={{ position: 'absolute', top: -10, left: -20, transform: [{ rotate: '-12deg' }], opacity: 0.02 }}>
                            <Leaf size={120} color={botanical.forest} />
                        </View>
                    </View>

                    {/* Avatar Overlap */}
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatar}>
                            {user?.avatar ? (
                                <ImageBackground source={{ uri: user.avatar }} style={styles.avatarImage} imageStyle={{ borderRadius: 48 }} />
                            ) : (
                                <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || '?'}</Text>
                            )}
                        </View>
                        {(user?.isAdmin || user?.isOwner) && (
                            <View style={[styles.shieldBadge, { backgroundColor: user?.isOwner ? '#f59e0b' : '#ef4444' }]}>
                                <Shield size={14} color="#fff" />
                            </View>
                        )}
                    </View>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{user?.username}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    {user?.bio ? <Text style={styles.bio}>"{user.bio}"</Text> : null}
                </View>

                {/* Grid Stats */}
                <View style={styles.statsGrid}>
                    <Pressable style={styles.statCard} onPress={() => router.push('/friends')}>
                        <View style={styles.statIconWrapper}>
                            <Users size={20} color={botanical.forest} />
                        </View>
                        <Text style={styles.statValue}>{friendsCount}</Text>
                        <Text style={styles.statLabel}>FRIENDS</Text>
                    </Pressable>

                    <Pressable style={styles.statCard} onPress={() => router.push('/messages')}>
                        <View style={styles.statIconWrapper}>
                            <MessageCircle size={20} color={botanical.forest} />
                            {unreadCount > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.statValue}>{unreadCount}</Text>
                        <Text style={styles.statLabel}>MESSAGES</Text>
                    </Pressable>
                </View>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    {(user?.isAdmin || user?.isOwner) && (
                        <Pressable style={[styles.menuItem, { borderColor: 'rgba(245, 158, 11, 0.2)' }]} onPress={() => router.push('/admin')}>
                            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Shield size={20} color="#d97706" />
                            </View>
                            <View style={styles.menuTexts}>
                                <Text style={styles.menuTitle}>Admin Panel</Text>
                                <Text style={styles.menuDesc}>Manage users and content</Text>
                            </View>
                            <ChevronRight size={20} color={colors.border} />
                        </Pressable>
                    )}

                    <Pressable style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
                        <View style={styles.menuIconBg}>
                            <Edit3 size={20} color={colors.textSecondary} />
                        </View>
                        <View style={styles.menuTexts}>
                            <Text style={styles.menuTitle}>Edit Profile</Text>
                            <Text style={styles.menuDesc}>Update your avatar and bio</Text>
                        </View>
                        <ChevronRight size={20} color={colors.border} />
                    </Pressable>

                    <Pressable style={styles.menuItem} onPress={() => router.push('/settings')}>
                        <View style={styles.menuIconBg}>
                            <Settings size={20} color={colors.textSecondary} />
                        </View>
                        <View style={styles.menuTexts}>
                            <Text style={styles.menuTitle}>Settings</Text>
                            <Text style={styles.menuDesc}>Security, notifications, and more</Text>
                        </View>
                        <ChevronRight size={20} color={colors.border} />
                    </Pressable>

                    <Pressable style={[styles.menuItem, { borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: spacing.md }]} onPress={handleLogout}>
                        <View style={[styles.menuIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <LogOut size={20} color="#ef4444" />
                        </View>
                        <View style={styles.menuTexts}>
                            <Text style={[styles.menuTitle, { color: '#ef4444' }]}>Sign Out</Text>
                        </View>
                    </Pressable>
                </View>

                <Text style={styles.versionText}>Riven v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        scroll: { paddingBottom: spacing['3xl'] * 2 },
        // Header
        headerContainer: {
            height: 200, position: 'relative', marginBottom: 60,
            borderBottomLeftRadius: 48, borderBottomRightRadius: 48, overflow: 'hidden'
        },
        avatarWrapper: {
            position: 'absolute', bottom: -48, left: '50%', transform: [{ translateX: -48 }], zIndex: 10
        },
        avatar: {
            width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surface,
            borderWidth: 4, borderColor: colors.bg, justifyContent: 'center', alignItems: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10
        },
        avatarText: { fontFamily: fonts.displayBold, fontSize: 36, color: colors.text },
        avatarImage: { width: '100%', height: '100%' },
        shieldBadge: {
            position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14,
            justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.bg, ...cardShadow
        },
        // Info
        userInfo: { alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
        username: { fontFamily: fonts.displayBold, fontSize: fontSize['2xl'], color: colors.text, marginBottom: 2 },
        email: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: botanical.sepia, marginBottom: spacing.sm },
        bio: { fontFamily: fonts.bodyItalic, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },
        // Stats
        statsGrid: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
        statCard: {
            flex: 1, backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg,
            alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...cardShadow
        },
        statIconWrapper: {
            width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(122,158,114,0.1)',
            justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm, position: 'relative'
        },
        unreadBadge: {
            position: 'absolute', top: -2, right: -4, backgroundColor: '#ef4444', borderWidth: 2, borderColor: colors.surface,
            borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center'
        },
        unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
        statValue: { fontFamily: fonts.displayBold, fontSize: fontSize.xl, color: colors.text },
        statLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: botanical.sepia, marginTop: 2 },
        // Menu
        menuContainer: { paddingHorizontal: spacing.lg, gap: spacing.sm },
        menuItem: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md,
            backgroundColor: colors.surface, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, ...cardShadow
        },
        menuIconBg: {
            width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.bg,
            justifyContent: 'center', alignItems: 'center'
        },
        menuTexts: { flex: 1 },
        menuTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
        menuDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: botanical.sepia },
        // Version
        versionText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: botanical.sepia + '80', textAlign: 'center', marginTop: spacing.xl * 1.5 }
    });
}
