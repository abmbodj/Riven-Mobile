import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Lock } from 'lucide-react-native';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { api } from '../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../src/constants/tokens';

export default function EditProfileScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { user, setUser } = useAuthStore();
    const router = useRouter();

    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const updateProfile = useMutation({
        mutationFn: () => api.updateProfile({ username: username.trim(), bio: bio.trim() }),
        onSuccess: (data) => {
            if (data) setUser(data as any);
            Alert.alert('Success', 'Profile updated');
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const changePassword = useMutation({
        mutationFn: () => api.changePassword(currentPassword, newPassword),
        onSuccess: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            Alert.alert('Success', 'Password changed successfully');
        },
        onError: (err: Error) => Alert.alert('Error', err.message),
    });

    const handleSaveProfile = () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username is required');
            return;
        }
        updateProfile.mutate();
    };

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Error', 'All password fields are required');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        changePassword.mutate();
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Profile Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Profile</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Username"
                                    placeholderTextColor={colors.textSecondary}
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.textarea]}
                                    value={bio}
                                    onChangeText={setBio}
                                    placeholder="Tell us about yourself..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>
                            <Pressable
                                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
                                onPress={handleSaveProfile}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <ActivityIndicator color="#1a1a18" size="small" />
                                ) : (
                                    <>
                                        <Save size={18} color="#1a1a18" />
                                        <Text style={styles.saveBtnText}>Save Profile</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </View>

                    {/* Password Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Change Password</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Current Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                />
                            </View>
                            <Pressable
                                style={({ pressed }) => [styles.passwordBtn, pressed && { opacity: 0.85 }]}
                                onPress={handleChangePassword}
                                disabled={changePassword.isPending}
                            >
                                {changePassword.isPending ? (
                                    <ActivityIndicator color={colors.accent} size="small" />
                                ) : (
                                    <>
                                        <Lock size={18} color={colors.accent} />
                                        <Text style={styles.passwordBtnText}>Change Password</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'], gap: spacing.lg },
        section: { gap: spacing.sm },
        sectionLabel: {
            fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary,
            textTransform: 'uppercase', letterSpacing: 1, marginLeft: spacing.xs,
        },
        card: {
            backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md,
            borderWidth: 1, borderColor: colors.border, gap: spacing.md,
        },
        inputGroup: { gap: spacing.xs },
        label: {
            fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginLeft: spacing.xs,
        },
        input: {
            backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
            fontSize: fontSize.md, color: colors.text,
        },
        textarea: { minHeight: 80, paddingTop: spacing.md },
        saveBtn: {
            flexDirection: 'row', backgroundColor: colors.accent, borderRadius: radii.md,
            paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        },
        saveBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
        passwordBtn: {
            flexDirection: 'row', backgroundColor: 'transparent', borderRadius: radii.md,
            paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center',
            gap: spacing.sm, borderWidth: 1, borderColor: colors.accent,
        },
        passwordBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.accent },
    });
}
