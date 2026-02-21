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
import GlobalBackground from '../../src/components/GlobalBackground';

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
            <GlobalBackground />
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
        container: { flex: 1, backgroundColor: botanical.ink },
        scroll: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing['3xl'],
            paddingBottom: spacing['3xl'],
        },
        backLink: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.xl,
            opacity: 0.8,
        },
        backText: {
            fontFamily: fonts.mono,
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        title: {
            fontFamily: fonts.displayLight,
            fontSize: fontSize['3xl'],
            color: botanical.parchment,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontFamily: fonts.body,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
            fontWeight: '300',
        },
        errorBox: {
            backgroundColor: '#ef444415',
            borderWidth: 1,
            borderColor: '#ef444430',
            borderRadius: radii.md,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        errorText: {
            fontFamily: fonts.mono,
            fontSize: fontSize.xs,
            color: '#ef4444',
        },
        label: {
            fontFamily: fonts.mono,
            fontSize: fontSize.xs,
            color: colors.accent,
            opacity: 0.8,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: spacing.xs,
            marginTop: spacing.md,
            marginLeft: spacing.xs,
        },
        input: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md + 2,
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: botanical.parchment,
            marginBottom: spacing.md,
        },
        registerButton: {
            backgroundColor: botanical.forest,
            borderRadius: radii.md,
            paddingVertical: spacing.md + 2,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.lg,
            minHeight: 56,
            shadowColor: botanical.forest,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 4,
        },
        registerButtonText: {
            fontFamily: fonts.display,
            fontWeight: '600',
            fontSize: fontSize.sm,
            color: '#ffffff',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
        },
        switchText: {
            fontFamily: fonts.body,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing['2xl'],
            marginBottom: spacing.md,
        },
        loginButton: {
            borderWidth: 1,
            borderColor: colors.accent + '4D', // 30% opacity
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
        },
        loginButtonText: {
            fontFamily: fonts.display,
            fontSize: fontSize.xs,
            color: colors.accent,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
        },
    });
}
