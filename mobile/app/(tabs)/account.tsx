import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User,
    LogOut,
    ChevronRight,
    Settings,
    Palette,
    Users,
    MessageSquare,
    Shield,
    Sprout,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../../src/constants/tokens';

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
                    try {
                        await api.logout();
                    } catch {
                        // ignore
                    }
                    await logout();
                },
            },
        ]);
    };

    const styles = makeStyles(colors);

    const menuItems = [
        { icon: Palette, label: 'Themes', onPress: () => router.push('/themes') },
        { icon: Sprout, label: 'Garden', onPress: () => router.push('/garden') },
        { icon: Users, label: 'Friends', onPress: () => router.push('/friends') },
        { icon: MessageSquare, label: 'Messages', onPress: () => router.push('/messages') },
        { icon: Settings, label: 'Settings', onPress: () => router.push('/settings') },
        ...(user?.isAdmin ? [{ icon: Shield, label: 'Admin Panel', onPress: () => { } }] : []),
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
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
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Text>
                        </View>
                    )}
                    {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
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
                                pressed && styles.menuItemPressed,
                            ]}
                            onPress={item.onPress}
                        >
                            <item.icon size={20} color={colors.accent} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <ChevronRight size={18} color={colors.textSecondary} />
                        </Pressable>
                    ))}
                </View>

                {/* Logout */}
                <Pressable
                    style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
                    onPress={handleLogout}
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        scroll: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
            gap: spacing.lg,
        },
        profileCard: {
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            padding: spacing.lg,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            ...cardShadow,
        },
        avatar: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.accent + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
            borderWidth: 2,
            borderColor: colors.accent,
        },
        avatarText: {
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.accent,
        },
        username: {
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.text,
        },
        email: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: spacing.xs,
        },
        roleBadge: {
            backgroundColor: colors.accent + '20',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.full,
            marginTop: spacing.sm,
        },
        roleBadgeText: {
            fontSize: fontSize.xs,
            fontWeight: '600',
            color: colors.accent,
        },
        bio: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.md,
        },
        menu: {
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            gap: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        menuItemFirst: {
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
        },
        menuItemLast: {
            borderBottomWidth: 0,
            borderBottomLeftRadius: radii.lg,
            borderBottomRightRadius: radii.lg,
        },
        menuItemPressed: {
            backgroundColor: colors.border + '40',
        },
        menuLabel: {
            flex: 1,
            fontSize: fontSize.md,
            color: colors.text,
            fontWeight: '500',
        },
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: '#ef444430',
        },
        logoutButtonPressed: {
            backgroundColor: '#ef444410',
        },
        logoutText: {
            fontSize: fontSize.md,
            fontWeight: '600',
            color: '#ef4444',
        },
    });
}
