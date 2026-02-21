import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Shield, Bell, Moon, Sun, Trash2, LogOut, ChevronRight, Leaf, Flower } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { api } from '../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical } from '../src/constants/tokens';

export default function SettingsScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Just placeholders for now based on React Native
    const [isLightMode, setIsLightMode] = useState(false);

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    try { await api.logout(); } catch { }
                    await logout();
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All your data including decks, cards, and study history will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    // Add actual delete API call if applicable
                    onPress: async () => {
                        try { await api.logout(); } catch { }
                        await logout();
                    },
                },
            ]
        );
    };

    const styles = makeStyles(colors);

    interface SettingItemProps {
        icon: any;
        title: string;
        description?: string;
        onPress: () => void;
        destructive?: boolean;
        toggle?: boolean;
        toggleValue?: boolean;
    }

    const SettingItem = ({ icon: Icon, title, description, onPress, destructive, toggle, toggleValue }: SettingItemProps) => (
        <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={onPress}
        >
            <View style={[styles.iconWrapper, destructive ? styles.iconWrapperDanger : undefined]}>
                <Icon size={20} color={destructive ? '#ef4444' : botanical.forest} />
            </View>
            <View style={styles.settingTexts}>
                <Text style={[styles.settingTitle, destructive ? styles.settingTitleDanger : undefined]}>
                    {title}
                </Text>
                {description && <Text style={styles.settingDesc}>{description}</Text>}
            </View>
            {toggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onPress}
                    trackColor={{ true: botanical.forest, false: 'transparent' }}
                    thumbColor="#fff"
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
            ) : (
                <ChevronRight size={20} color={destructive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(143, 166, 168, 0.3)'} />
            )}
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
                {/* Organic Header */}
                <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                    <View style={StyleSheet.absoluteFill}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f2026' }]} />
                        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                            <Defs>
                                <RadialGradient id="glow" cx="80%" cy="50%" rx="80%" ry="80%">
                                    <Stop offset="0%" stopColor="rgba(222,185,106,0.15)" />
                                    <Stop offset="100%" stopColor="transparent" />
                                </RadialGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
                        </Svg>
                        {/* Decorative Flower */}
                        <View style={{ position: 'absolute', bottom: -10, right: -10, transform: [{ rotate: '-12deg' }], opacity: 0.05 }}>
                            <Flower size={120} color={botanical.forest} />
                        </View>
                    </View>

                    <View style={styles.headerNav}>
                        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
                            <ArrowLeft size={24} color="#fff" />
                        </Pressable>
                    </View>

                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                <View style={styles.content}>
                    {/* Security Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionHeaderLine} />
                            <Text style={styles.sectionTitle}>SECURITY</Text>
                        </View>
                        <SettingItem
                            icon={Lock}
                            title="Change Password"
                            description="Secure your journal"
                            onPress={() => { }}
                        />
                        <SettingItem
                            icon={Shield}
                            title="Two-Factor Auth"
                            description={user?.twoFAEnabled ? "Enabled" : "Add extra protection"}
                            onPress={() => router.push('/two-factor')}
                        />
                    </View>

                    {/* Preferences Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionHeaderLine} />
                            <Text style={styles.sectionTitle}>PREFERENCES</Text>
                        </View>
                        <SettingItem
                            icon={Bell}
                            title="Notifications"
                            description="Reminders & Updates"
                            toggle
                            toggleValue={false}
                            onPress={() => { }}
                        />
                        <SettingItem
                            icon={isLightMode ? Sun : Moon}
                            title="Light Mode"
                            description={isLightMode ? "Daylight Theme" : "Midnight Theme"}
                            toggle
                            toggleValue={isLightMode}
                            onPress={() => setIsLightMode(!isLightMode)}
                        />
                    </View>

                    {/* Danger Zone Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionHeaderLine, { borderLeftColor: 'rgba(239, 68, 68, 0.3)' }]} />
                            <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>DANGER ZONE</Text>
                        </View>
                        <SettingItem
                            icon={LogOut}
                            title="Sign Out"
                            onPress={handleSignOut}
                            destructive
                        />
                        <SettingItem
                            icon={Trash2}
                            title="Delete Account"
                            description="Permanently remove all data"
                            onPress={handleDeleteAccount}
                            destructive
                        />
                    </View>

                    <View style={styles.footer}>
                        <Leaf size={24} color={botanical.forest} style={{ marginBottom: spacing.xs, opacity: 0.8 }} />
                        <Text style={styles.versionText}>Riven v1.0.0</Text>
                    </View>
                </View>
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
            height: 160, position: 'relative', overflow: 'hidden', paddingHorizontal: spacing.md,
            justifyContent: 'space-between', paddingBottom: spacing.md, marginBottom: spacing.xl
        },
        headerNav: { flexDirection: 'row', alignItems: 'center' },
        backButton: { backgroundColor: 'rgba(0,0,0,0.2)', padding: spacing.sm, borderRadius: radii.full, alignSelf: 'flex-start' },
        headerTitle: { fontFamily: fonts.displayBold, fontSize: fontSize['3xl'], color: 'rgba(255,255,255,0.9)' },

        content: { paddingHorizontal: spacing.lg, gap: spacing.xl },

        // Sections
        section: { flex: 1 },
        sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
        sectionHeaderLine: { width: 2, height: '100%', borderLeftWidth: 2, borderLeftColor: 'rgba(122,158,114,0.3)' },
        sectionTitle: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: botanical.sepia, marginLeft: spacing.xs },

        // Items
        settingItem: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md,
            borderBottomWidth: 1, borderBottomColor: 'rgba(143, 166, 168, 0.1)'
        },
        settingItemPressed: { backgroundColor: 'rgba(122,158,114,0.05)' },
        iconWrapper: {
            width: 36, height: 36, borderRadius: radii.full, backgroundColor: 'rgba(122,158,114,0.1)',
            justifyContent: 'center', alignItems: 'center'
        },
        iconWrapperDanger: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
        settingTexts: { flex: 1, justifyContent: 'center' },
        settingTitle: { fontFamily: fonts.display, fontSize: fontSize.lg, letterSpacing: 0.5, color: colors.text },
        settingTitleDanger: { color: '#ef4444' },
        settingDesc: { fontFamily: fonts.mono, fontSize: 11, color: botanical.sepia, marginTop: 4 },

        // Footer
        footer: { alignItems: 'center', opacity: 0.5, marginTop: spacing.xl },
        versionText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: botanical.sepia }
    });
}
