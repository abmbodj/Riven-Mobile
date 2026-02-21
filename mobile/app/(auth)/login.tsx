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
import { Link } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api } from '../../src/lib/api';
import { spacing, radii, fontSize } from '../../src/constants/tokens';

export default function LoginScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Email and password are required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.login(email.trim(), password);

            if (response.require2FA) {
                Alert.alert('2FA Required', '2FA login is not yet supported in the mobile app.');
                return;
            }

            if (response.user && response.token) {
                await setAuth({
                    id: response.user.id,
                    username: response.user.username,
                    email: response.user.email,
                    shareCode: response.user.shareCode || '',
                    avatar: response.user.avatar || null,
                    bio: response.user.bio || '',
                    role: (response.user.role as 'user' | 'admin' | 'owner') || 'user',
                    isAdmin: response.user.isAdmin || false,
                    isOwner: response.user.isOwner || false,
                    streakData: response.user.streakData || {},
                    twoFAEnabled: response.user.twoFAEnabled || false,
                }, response.token);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const styles = makeStyles(colors);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>Riven</Text>
                    <Text style={styles.subtitle}>Welcome back</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                            textContentType="emailAddress"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            textContentType="password"
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.bg} />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </Pressable>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Link href="/(auth)/signup" asChild>
                        <Pressable>
                            <Text style={styles.linkText}>Create account</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        scroll: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing['2xl'],
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing['2xl'],
        },
        logoText: {
            fontSize: fontSize['3xl'],
            fontWeight: '300',
            color: colors.accent,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: spacing.sm,
        },
        subtitle: {
            fontSize: fontSize.lg,
            color: colors.textSecondary,
        },
        form: {
            gap: spacing.md,
        },
        inputGroup: {
            gap: spacing.xs,
        },
        label: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            fontWeight: '500',
            marginLeft: spacing.xs,
        },
        input: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            fontSize: fontSize.md,
            color: colors.text,
        },
        button: {
            backgroundColor: colors.accent,
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            marginTop: spacing.sm,
        },
        buttonPressed: {
            opacity: 0.85,
            transform: [{ scale: 0.98 }],
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            fontSize: fontSize.md,
            fontWeight: '700',
            color: '#1a1a18',
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: spacing.xl,
        },
        footerText: {
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        linkText: {
            fontSize: fontSize.sm,
            color: colors.accent,
            fontWeight: '600',
        },
    });
}
