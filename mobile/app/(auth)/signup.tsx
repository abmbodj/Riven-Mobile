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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical } from '../../src/constants/tokens';

export default function SignupScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        setError('');
        if (!username.trim() || !email.trim() || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await api.register(username.trim(), email.trim(), password);
            if (res.token && res.user) {
                await setAuth({
                    id: res.user.id,
                    username: res.user.username,
                    email: res.user.email,
                    shareCode: res.user.shareCode || '',
                    avatar: res.user.avatar || null,
                    bio: res.user.bio || '',
                    role: (res.user.role as 'user' | 'admin' | 'owner') || 'user',
                    isAdmin: res.user.isAdmin || false,
                    isOwner: res.user.isOwner || false,
                    streakData: res.user.streakData || {},
                    twoFAEnabled: res.user.twoFAEnabled || false,
                }, res.token);
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    <Pressable style={styles.backLink} onPress={() => router.push('/(auth)/login')}>
                        <ArrowLeft size={14} color={colors.accent} />
                        <Text style={styles.backText}>RETURN TO LOGIN</Text>
                    </Pressable>

                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Register a new research profile.</Text>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>USERNAME</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Dr. Botanist"
                        placeholderTextColor={colors.textSecondary + '60'}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="researcher@institute.edu"
                        placeholderTextColor={colors.textSecondary + '60'}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textSecondary + '60'}
                        secureTextEntry
                    />

                    <Text style={styles.label}>CONFIRM PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textSecondary + '60'}
                        secureTextEntry
                    />

                    <Pressable
                        style={({ pressed }) => [styles.registerButton, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={botanical.ink} />
                        ) : (
                            <Text style={styles.registerButtonText}>REGISTER</Text>
                        )}
                    </Pressable>

                    <Text style={styles.switchText}>Already have a profile?</Text>
                    <Pressable
                        style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.9 }]}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.loginButtonText}>LOGIN</Text>
                    </Pressable>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: spacing['2xl'] },
        backLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
        backText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.accent, letterSpacing: 1 },
        title: { fontFamily: fonts.displayBoldItalic, fontSize: fontSize['4xl'], color: colors.text, marginBottom: spacing.sm },
        subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl },
        errorBox: {
            backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444430',
            borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md,
        },
        errorText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: '#ef4444' },
        label: {
            fontFamily: fonts.monoBold, fontSize: fontSize.xs, color: colors.text,
            letterSpacing: 1.5, marginBottom: spacing.sm, marginTop: spacing.md,
        },
        input: {
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md + 2,
            fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md,
        },
        registerButton: {
            backgroundColor: colors.accent, borderRadius: radii.xl, paddingVertical: spacing.md + 4,
            alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 52,
            shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
        },
        registerButtonText: { fontFamily: fonts.monoBold, fontSize: fontSize.md, color: botanical.ink, letterSpacing: 2 },
        switchText: {
            fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary,
            textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.md,
        },
        loginButton: {
            borderWidth: 1, borderColor: colors.border, borderRadius: radii.xl,
            paddingVertical: spacing.md + 4, alignItems: 'center', justifyContent: 'center', minHeight: 52,
        },
        loginButtonText: { fontFamily: fonts.monoBold, fontSize: fontSize.sm, color: colors.accent, letterSpacing: 2 },
    });
}
