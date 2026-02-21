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

export default function SignupScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { setAuth } = useAuthStore();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!username.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (username.length < 2 || username.length > 30) {
            Alert.alert('Error', 'Username must be 2-30 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await api.register(username.trim(), email.trim(), password);

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
            const message = err instanceof Error ? err.message : 'Registration failed';
            Alert.alert('Signup Failed', message);
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
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Choose a username"
                            placeholderTextColor={colors.textSecondary}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="username"
                            textContentType="username"
                        />
                    </View>

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
                            placeholder="Create a password"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="new-password"
                            textContentType="newPassword"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor={colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            textContentType="newPassword"
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.bg} />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </Pressable>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <Pressable>
                            <Text style={styles.linkText}>Sign in</Text>
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
