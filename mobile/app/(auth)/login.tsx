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
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical } from '../../src/constants/tokens';
import GlobalBackground from '../../src/components/GlobalBackground';

export default function LoginScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('All fields are required');
            return;
        }
        setLoading(true);
        try {
            const res = await api.login(email.trim(), password);
            if (res.require2FA) {
                setError('2FA is required — mobile 2FA coming soon');
                return;
            }
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
            setError(err.message || 'Login failed');
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

                    {/* Back Link */}
                    <Pressable style={styles.backLink} onPress={() => { }}>
                        <ArrowLeft size={14} color={colors.accent} />
                        <Text style={styles.backText}>RETURN TO ARCHIVE</Text>
                    </Pressable>

                    {/* Title */}
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>Enter your credentials to access the journal.</Text>

                    {/* Error */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Email */}
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="researcher@institute.edu"
                        placeholderTextColor={colors.textSecondary + '60'}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                    />

                    {/* Password */}
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textSecondary + '60'}
                            secureTextEntry={!showPassword}
                            textContentType="password"
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                            hitSlop={8}
                        >
                            {showPassword ? (
                                <EyeOff size={18} color={colors.textSecondary} />
                            ) : (
                                <Eye size={18} color={colors.textSecondary} />
                            )}
                        </Pressable>
                    </View>

                    {/* Login Button */}
                    <Pressable
                        style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={botanical.ink} />
                        ) : (
                            <Text style={styles.loginButtonText}>LOGIN</Text>
                        )}
                    </Pressable>

                    {/* Signup Link */}
                    <Text style={styles.switchText}>No profile recorded?</Text>
                    <Pressable
                        style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.9 }]}
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
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
        passwordRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        eyeButton: {
            position: 'absolute',
            right: spacing.md,
            top: spacing.md + 2,
        },
        loginButton: {
            backgroundColor: colors.accent,
            borderRadius: radii.md,
            paddingVertical: spacing.md + 2,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.md,
            minHeight: 56,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 4,
        },
        loginButtonText: {
            fontFamily: fonts.display,
            fontWeight: '600',
            fontSize: fontSize.sm,
            color: botanical.ink,
            letterSpacing: 2,
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
        createButton: {
            borderWidth: 1,
            borderColor: colors.accent + '4D', // 30% opacity
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
        },
        createButtonText: {
            fontFamily: fonts.display,
            fontSize: fontSize.xs,
            color: colors.accent,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
        },
    });
}
