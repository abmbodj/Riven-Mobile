import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Bell,
    Moon,
    Shield,
    Trash2,
    Info,
    ChevronRight,
    ExternalLink,
} from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { api } from '../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../src/constants/tokens';

export default function SettingsScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All your data including decks, cards, and study history will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.logout();
                            await logout();
                        } catch {
                            // ignore
                        }
                    },
                },
            ]
        );
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Account Section */}
                <Text style={styles.sectionLabel}>Account</Text>
                <View style={styles.section}>
                    <View style={styles.menuItem}>
                        <Shield size={20} color={colors.accent} />
                        <Text style={styles.menuLabel}>Two-Factor Auth</Text>
                        <Text style={styles.menuValue}>
                            {user?.twoFAEnabled ? 'Enabled' : 'Disabled'}
                        </Text>
                    </View>
                </View>

                {/* App Section */}
                <Text style={styles.sectionLabel}>App</Text>
                <View style={styles.section}>
                    <View style={styles.menuItem}>
                        <Moon size={20} color={colors.accent} />
                        <Text style={styles.menuLabel}>Dark Mode</Text>
                        <Switch value={true} disabled trackColor={{ true: colors.accent }} />
                    </View>
                    <View style={styles.menuItemBorder} />
                    <View style={styles.menuItem}>
                        <Bell size={20} color={colors.accent} />
                        <Text style={styles.menuLabel}>Notifications</Text>
                        <Text style={styles.menuValue}>Coming soon</Text>
                    </View>
                </View>

                {/* About Section */}
                <Text style={styles.sectionLabel}>About</Text>
                <View style={styles.section}>
                    <View style={styles.menuItem}>
                        <Info size={20} color={colors.accent} />
                        <Text style={styles.menuLabel}>Version</Text>
                        <Text style={styles.menuValue}>1.0.0</Text>
                    </View>
                </View>

                {/* Danger Zone */}
                <Text style={[styles.sectionLabel, { color: '#ef4444' }]}>Danger Zone</Text>
                <Pressable
                    style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.85 }]}
                    onPress={handleDeleteAccount}
                >
                    <Trash2 size={20} color="#ef4444" />
                    <Text style={styles.dangerText}>Delete Account</Text>
                </Pressable>
            </ScrollView>
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
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'], gap: spacing.sm },
        sectionLabel: {
            fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary,
            textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.lg, marginLeft: spacing.xs,
        },
        section: {
            backgroundColor: colors.surface, borderRadius: radii.lg,
            borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
        },
        menuItem: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            paddingVertical: spacing.md, paddingHorizontal: spacing.md,
        },
        menuItemBorder: { height: 1, backgroundColor: colors.border, marginLeft: spacing['2xl'] + spacing.md },
        menuLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
        menuValue: { fontSize: fontSize.sm, color: colors.textSecondary },
        dangerButton: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
            paddingVertical: spacing.md, backgroundColor: '#ef444410',
            borderRadius: radii.lg, borderWidth: 1, borderColor: '#ef444430',
        },
        dangerText: { fontSize: fontSize.md, fontWeight: '600', color: '#ef4444' },
    });
}
