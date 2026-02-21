import { useCallback, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Shield,
    Trash2,
    Search,
    Users,
    BookOpen,
    Crown,
} from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { api, AdminUser } from '../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../src/constants/tokens';

export default function AdminScreen() {
    const colors = useThemeStore((s) => s.colors);
    const currentUser = useAuthStore((s) => s.user);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: api.getAdminUsers,
    });

    const updateRole = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) =>
            api.updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            Alert.alert('Success', 'Role updated');
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const deleteUser = useMutation({
        mutationFn: (userId: number) => api.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            Alert.alert('Success', 'User deleted');
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const handleRoleChange = (user: AdminUser) => {
        const roles = ['user', 'admin'];
        if (currentUser?.isOwner) roles.push('owner');

        Alert.alert(
            `Change ${user.username}'s Role`,
            `Current: ${user.role}`,
            [
                ...roles.map((role) => ({
                    text: role.charAt(0).toUpperCase() + role.slice(1),
                    onPress: () => updateRole.mutate({ userId: user.id, role }),
                })),
                { text: 'Cancel', style: 'cancel' as const },
            ]
        );
    };

    const handleDelete = (user: AdminUser) => {
        Alert.alert(
            'Delete User',
            `Permanently delete ${user.username}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteUser.mutate(user.id),
                },
            ]
        );
    };

    const filteredUsers = (users || []).filter((u) =>
        search
            ? u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
            : true
    );

    const styles = makeStyles(colors);

    const renderUser = useCallback(({ item }: { item: AdminUser }) => {
        const isSelf = item.id === currentUser?.id;

        return (
            <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{item.username}</Text>
                        {item.role !== 'user' && (
                            <View style={[styles.roleBadge, item.role === 'owner' && styles.ownerBadge]}>
                                <Text style={[styles.roleText, item.role === 'owner' && styles.ownerText]}>
                                    {item.role}
                                </Text>
                            </View>
                        )}
                        {isSelf && <Text style={styles.youText}>(you)</Text>}
                    </View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <BookOpen size={12} color={colors.textSecondary} />
                            <Text style={styles.statText}>{item.deckCount} decks</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statText}>{item.cardCount} cards</Text>
                        </View>
                        {item.twoFAEnabled && (
                            <View style={styles.stat}>
                                <Shield size={12} color="#22c55e" />
                                <Text style={[styles.statText, { color: '#22c55e' }]}>2FA</Text>
                            </View>
                        )}
                    </View>
                </View>
                {!isSelf && (
                    <View style={styles.actions}>
                        <Pressable
                            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                            onPress={() => handleRoleChange(item)}
                        >
                            <Crown size={16} color={colors.accent} />
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.actionBtnDanger, pressed && { opacity: 0.7 }]}
                            onPress={() => handleDelete(item)}
                        >
                            <Trash2 size={16} color="#ef4444" />
                        </Pressable>
                    </View>
                )}
            </View>
        );
    }, [colors, styles, currentUser, updateRole, deleteUser]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Admin Panel</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <Users size={16} color={colors.accent} />
                <Text style={styles.totalUsers}>{users?.length || 0} users</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Search size={18} color={colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    placeholderTextColor={colors.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
            </View>

            {/* User List */}
            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <FlashList
                    data={filteredUsers}
                    renderItem={renderUser}
                    estimatedItemSize={100}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
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
        statsBar: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
        },
        totalUsers: { fontSize: fontSize.sm, color: colors.accent, fontWeight: '600' },
        searchContainer: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            backgroundColor: colors.surface, borderRadius: radii.md,
            marginHorizontal: spacing.md, marginBottom: spacing.md,
            paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
        },
        searchInput: {
            flex: 1, paddingVertical: spacing.sm + 2,
            fontSize: fontSize.md, color: colors.text,
        },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        userCard: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.md,
            backgroundColor: colors.surface, borderRadius: radii.lg,
            padding: spacing.md, borderWidth: 1, borderColor: colors.border,
        },
        userAvatar: {
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center',
        },
        avatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.accent },
        userInfo: { flex: 1, gap: 2 },
        userNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
        userName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
        youText: { fontSize: fontSize.xs, color: colors.textSecondary },
        userEmail: { fontSize: fontSize.xs, color: colors.textSecondary },
        roleBadge: {
            backgroundColor: colors.accent + '20', paddingHorizontal: 6, paddingVertical: 1,
            borderRadius: radii.sm,
        },
        ownerBadge: { backgroundColor: '#f59e0b20' },
        roleText: { fontSize: 10, fontWeight: '600', color: colors.accent },
        ownerText: { color: '#f59e0b' },
        statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
        stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
        statText: { fontSize: 11, color: colors.textSecondary },
        actions: { flexDirection: 'row', gap: spacing.xs },
        actionBtn: {
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: colors.accent + '15', justifyContent: 'center', alignItems: 'center',
        },
        actionBtnDanger: {
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: '#ef444415', justifyContent: 'center', alignItems: 'center',
        },
    });
}
