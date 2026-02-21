import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User as UserIcon } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../src/constants/tokens';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();

    const { data: userProfile, isLoading, isError } = useQuery({
        queryKey: ['user', id],
        queryFn: () => api.getUserProfile(parseInt(id)),
    });

    const styles = makeStyles(colors);

    // Re-use logic for garden stage based on profile's petCustomization or streak
    const getDisplayStage = () => {
        if (!userProfile) return null;
        return userProfile.petCustomization ? 'Overridden Stage' : `${userProfile.streak || 0} Days`;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing['3xl'] }} />
            </SafeAreaView>
        );
    }

    if (isError || !userProfile) {
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Researcher Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.profileCard}>
                    <ImageBackground
                        source={{ uri: 'https://www.transparenttextures.com/patterns/natural-paper.png' }}
                        style={StyleSheet.absoluteFill}
                        imageStyle={{ opacity: 0.5 }}
                    />
                    <View style={styles.tapeAccent} />

                    <View style={styles.profileContent}>
                        <View style={styles.avatar}>
                            {userProfile.avatar ? (
                                <UserIcon size={32} color={botanical.forest} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {userProfile.username?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.username}>{userProfile.username}</Text>

                        {userProfile.role && userProfile.role !== 'user' && (
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>
                                    {userProfile.role.toUpperCase()}
                                </Text>
                            </View>
                        )}

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{userProfile.stats?.decksCreated || 0}</Text>
                                <Text style={styles.statLabel}>DECKS</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{getDisplayStage()}</Text>
                                <Text style={styles.statLabel}>GARDEN</Text>
                            </View>
                        </View>

                        {userProfile.bio ? <Text style={styles.bio}>{userProfile.bio}</Text> : null}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        scroll: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.lg },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        },
        headerTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.lg, color: colors.text },
        empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
        emptyTitle: { fontFamily: fonts.monoBold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md, letterSpacing: 2 },
        emptyDesc: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
        backBtn: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
        backBtnText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.text },
        profileCard: {
            backgroundColor: botanical.paper,
            borderRadius: radii.xl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: botanical.tapePin + '60',
            position: 'relative',
            ...cardShadow,
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
        username: { fontFamily: fonts.displayBoldItalic, fontSize: fontSize['3xl'], color: botanical.ink, marginBottom: spacing.md },
        roleBadge: {
            backgroundColor: colors.accent + '20', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
            borderRadius: radii.full, marginBottom: spacing.lg,
        },
        roleBadgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.accent, letterSpacing: 1 },
        statsRow: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: radii.lg, padding: spacing.md,
            width: '100%', marginBottom: spacing.lg,
        },
        statBox: { flex: 1, alignItems: 'center' },
        statValue: { fontFamily: 'Lora_700Bold', fontSize: fontSize.lg, color: botanical.ink },
        statLabel: { fontFamily: fonts.mono, fontSize: 9, color: botanical.ink + '80', letterSpacing: 1, marginTop: 4 },
        statDivider: { width: 1, height: 24, backgroundColor: botanical.tapePin + '40' },
        bio: { fontFamily: fonts.bodyItalic, fontSize: fontSize.md, color: botanical.ink + '90', textAlign: 'center', lineHeight: 22 },
    });
}
