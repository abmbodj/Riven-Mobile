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
        container: { flex: 1, backgroundColor: 'transparent' },
        scroll: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing['2xl'],
            paddingBottom: spacing['2xl'],
        },
        backLink: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            marginBottom: spacing.xl,
        },
        backText: {
            fontFamily: fonts.mono,
            fontSize: fontSize.xs,
            color: colors.accent,
            letterSpacing: 1,
        },
        title: {
            fontFamily: fonts.displayBoldItalic,
            fontSize: fontSize['4xl'],
            color: colors.text,
            marginBottom: spacing.sm,
        },
        subtitle: {
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: colors.textSecondary,
            marginBottom: spacing.xl,
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
            fontFamily: fonts.monoBold,
            fontSize: fontSize.xs,
            color: colors.text,
            letterSpacing: 1.5,
            marginBottom: spacing.sm,
            marginTop: spacing.md,
        },
        input: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md + 2,
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: colors.text,
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
            borderRadius: radii.xl,
            paddingVertical: spacing.md + 4,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.lg,
            minHeight: 52,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 4,
        },
        loginButtonText: {
            fontFamily: fonts.monoBold,
            fontSize: fontSize.md,
            color: botanical.ink,
            letterSpacing: 2,
        },
        switchText: {
            fontFamily: fonts.body,
            fontSize: fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.xl,
            marginBottom: spacing.md,
        },
        createButton: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.xl,
            paddingVertical: spacing.md + 4,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 52,
        },
        createButtonText: {
            fontFamily: fonts.monoBold,
            fontSize: fontSize.sm,
            color: botanical.forest,
            letterSpacing: 2,
        },
    });
}
