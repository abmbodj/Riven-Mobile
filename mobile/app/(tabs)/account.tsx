import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Alert,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    LogOut,
    ChevronRight,
    Settings,
    Palette,
    Users,
    MessageSquare,
    Shield,
    Sprout,
    Pencil,
    User,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../src/constants/tokens';

export default function AccountScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { user, logout } = useAuthStore();
    const router = useRouter();

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

    const menuItems = [
        { icon: Pencil, label: 'Edit Profile', onPress: () => router.push('/edit-profile') },
        { icon: Palette, label: 'Themes', onPress: () => router.push('/themes') },
        { icon: Sprout, label: 'Garden', onPress: () => router.push('/garden') },
        { icon: Users, label: 'Friends', onPress: () => router.push('/friends') },
        { icon: MessageSquare, label: 'Messages', onPress: () => router.push('/messages') },
        { icon: Shield, label: 'Two-Factor Auth', onPress: () => router.push('/two-factor') },
        { icon: Settings, label: 'Settings', onPress: () => router.push('/settings') },
        ...(user?.isAdmin || user?.isOwner ? [{ icon: Shield, label: 'Admin Panel', onPress: () => router.push('/admin') }] : []),
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>PROFILE</Text>
                    </View>
                    <Text style={styles.pageTitle}>Account</Text>
                </View>

                {/* Profile Card — Herbarium Style */}
                <View style={styles.profileCard}>
                    {/* Paper overlay */}
                    <ImageBackground
                        source={{ uri: 'https://www.transparenttextures.com/patterns/natural-paper.png' }}
                        style={StyleSheet.absoluteFill}
                        imageStyle={{ opacity: 0.5 }}
                    />
                    {/* Tape accent */}
                    <View style={styles.tapeAccent} />

                    <View style={styles.profileContent}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.username?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                        <Text style={styles.username}>{user?.username}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                        {user?.role && user.role !== 'user' && (
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>
                                    {user.role.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menu}>
                    {menuItems.map((item, index) => (
                        <Pressable
                            key={item.label}
                            style={({ pressed }) => [
                                styles.menuItem,
                                index === 0 && styles.menuItemFirst,
                                index === menuItems.length - 1 && styles.menuItemLast,
                                pressed && { backgroundColor: colors.border + '30' },
                            ]}
                            onPress={item.onPress}
                        >
                            <item.icon size={20} color={colors.accent} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <ChevronRight size={16} color={colors.textSecondary} />
                        </Pressable>
                    ))}
                </View>

                {/* Logout */}
                <Pressable
                    style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.85 }]}
                    onPress={handleLogout}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text style={styles.logoutText}>LOG OUT</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        scroll: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.lg },
        header: { paddingHorizontal: spacing.xs },
        tagBadge: {
            backgroundColor: colors.accent, paddingHorizontal: spacing.sm + 2, paddingVertical: 2,
            borderRadius: radii.sm, alignSelf: 'flex-start', marginBottom: spacing.xs,
        },
        tagBadgeText: { fontFamily: fonts.monoBold, fontSize: 9, color: botanical.ink, letterSpacing: 1.5 },
        pageTitle: { fontFamily: fonts.displayBold, fontSize: fontSize['4xl'], color: colors.text, letterSpacing: -1 },
        // Herbarium Profile Card
        profileCard: {
            backgroundColor: botanical.paper,
            borderRadius: radii.xl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: botanical.tapePin + '60',
            position: 'relative',
            ...cardShadow,
        },
        paperOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255,255,255,0.15)',
        },
        tapeAccent: {
            position: 'absolute', top: -1, left: '30%',
            width: 40, height: 12, backgroundColor: botanical.tape,
            transform: [{ rotate: '-2deg' }], borderRadius: 2, zIndex: 10, opacity: 0.7,
        },
        profileContent: {
            alignItems: 'center', padding: spacing.xl, paddingTop: spacing.xl + 8, zIndex: 5,
        },
        avatar: {
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: botanical.forest + '20', justifyContent: 'center', alignItems: 'center',
            marginBottom: spacing.md, borderWidth: 2, borderColor: botanical.forest,
        },
        avatarText: { fontFamily: fonts.displayBold, fontSize: fontSize['2xl'], color: botanical.forest },
        username: { fontFamily: fonts.displayBoldItalic, fontSize: fontSize['2xl'], color: botanical.ink },
        email: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: botanical.ink + '60', marginTop: spacing.xs },
        roleBadge: {
            backgroundColor: colors.accent + '20', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
            borderRadius: radii.full, marginTop: spacing.sm,
        },
        roleBadgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.accent, letterSpacing: 1 },
        bio: { fontFamily: fonts.bodyItalic, fontSize: fontSize.sm, color: botanical.ink + '80', textAlign: 'center', marginTop: spacing.md },
        // Menu
        menu: {
            backgroundColor: colors.surface, borderRadius: radii.lg,
            borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
        },
        menuItem: {
            flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md,
            gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        menuItemFirst: { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg },
        menuItemLast: { borderBottomWidth: 0, borderBottomLeftRadius: radii.lg, borderBottomRightRadius: radii.lg },
        menuLabel: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text },
        // Logout
        logoutButton: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
            paddingVertical: spacing.md, backgroundColor: colors.surface,
            borderRadius: radii.lg, borderWidth: 1, borderColor: '#ef444430',
        },
        logoutText: { fontFamily: fonts.monoBold, fontSize: fontSize.sm, color: '#ef4444', letterSpacing: 1.5 },
    });
}
