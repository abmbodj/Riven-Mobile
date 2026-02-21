import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, ShieldCheck, ShieldOff, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useThemeStore } from '../src/stores/themeStore';
import { useAuthStore } from '../src/stores/authStore';
import { api } from '../src/lib/api';
import { spacing, radii, fontSize, cardShadow } from '../src/constants/tokens';

export default function TwoFAScreen() {
    const colors = useThemeStore((s) => s.colors);
    const { user, setUser } = useAuthStore();
    const router = useRouter();

    const [step, setStep] = useState<'overview' | 'setup' | 'verify'>('overview');
    const [qrUrl, setQrUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [disableCode, setDisableCode] = useState('');

    const isEnabled = user?.twoFAEnabled || false;

    const handleSetup = async () => {
        setLoading(true);
        try {
            const res = await api.setup2FA();
            setQrUrl(res.qrCodeUrl);
            setSecret(res.secret);
            setStep('setup');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (verifyCode.length !== 6) {
            Alert.alert('Error', 'Enter the 6-digit code from your authenticator app');
            return;
        }
        setLoading(true);
        try {
            await api.verify2FA(verifyCode);
            setUser({ ...user!, twoFAEnabled: true });
            Alert.alert('Success', '2FA is now enabled!');
            setStep('overview');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Invalid code');
        } finally {
            setLoading(false);
            setVerifyCode('');
        }
    };

    const handleDisable = async () => {
        if (disableCode.length !== 6) {
            Alert.alert('Error', 'Enter the 6-digit code to disable 2FA');
            return;
        }
        setLoading(true);
        try {
            await api.disable2FA(disableCode);
            setUser({ ...user!, twoFAEnabled: false });
            Alert.alert('Success', '2FA has been disabled');
            setDisableCode('');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const copySecret = async () => {
        try {
            await Clipboard.setStringAsync(secret);
            Alert.alert('Copied', 'Secret key copied to clipboard');
        } catch {
            Alert.alert('Error', 'Failed to copy');
        }
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => { setStep('overview'); router.back(); }} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>Two-Factor Auth</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {step === 'overview' && (
                    <>
                        <View style={styles.statusCard}>
                            {isEnabled ? (
                                <ShieldCheck size={48} color="#22c55e" />
                            ) : (
                                <ShieldOff size={48} color={colors.textSecondary} />
                            )}
                            <Text style={styles.statusTitle}>
                                {isEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                            </Text>
                            <Text style={styles.statusDesc}>
                                {isEnabled
                                    ? 'Your account is protected with an authenticator app.'
                                    : 'Add an extra layer of security to your account.'}
                            </Text>
                        </View>

                        {!isEnabled ? (
                            <Pressable
                                style={({ pressed }) => [styles.enableBtn, pressed && { opacity: 0.85 }]}
                                onPress={handleSetup}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#1a1a18" />
                                ) : (
                                    <>
                                        <Shield size={18} color="#1a1a18" />
                                        <Text style={styles.enableBtnText}>Enable 2FA</Text>
                                    </>
                                )}
                            </Pressable>
                        ) : (
                            <View style={styles.disableSection}>
                                <Text style={styles.disableLabel}>Enter code to disable 2FA</Text>
                                <TextInput
                                    style={styles.codeInput}
                                    value={disableCode}
                                    onChangeText={setDisableCode}
                                    placeholder="000000"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    textAlign="center"
                                />
                                <Pressable
                                    style={({ pressed }) => [styles.disableBtn, pressed && { opacity: 0.85 }]}
                                    onPress={handleDisable}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#ef4444" />
                                    ) : (
                                        <Text style={styles.disableBtnText}>Disable 2FA</Text>
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </>
                )}

                {step === 'setup' && (
                    <>
                        <View style={styles.setupCard}>
                            <Text style={styles.setupStep}>Step 1</Text>
                            <Text style={styles.setupTitle}>Scan QR Code</Text>
                            <Text style={styles.setupDesc}>
                                Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
                            </Text>
                            {qrUrl ? (
                                <View style={styles.qrContainer}>
                                    <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.setupCard}>
                            <Text style={styles.setupStep}>Or enter manually</Text>
                            <View style={styles.secretRow}>
                                <Text style={styles.secretText} selectable>{secret}</Text>
                                <Pressable onPress={copySecret} hitSlop={8}>
                                    <Copy size={18} color={colors.accent} />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.setupCard}>
                            <Text style={styles.setupStep}>Step 2</Text>
                            <Text style={styles.setupTitle}>Verify Code</Text>
                            <Text style={styles.setupDesc}>Enter the 6-digit code from your authenticator app:</Text>
                            <TextInput
                                style={styles.codeInput}
                                value={verifyCode}
                                onChangeText={setVerifyCode}
                                placeholder="000000"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                            />
                            <Pressable
                                style={({ pressed }) => [styles.verifyBtn, pressed && { opacity: 0.85 }]}
                                onPress={handleVerify}
                                disabled={loading || verifyCode.length !== 6}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#1a1a18" />
                                ) : (
                                    <Text style={styles.verifyBtnText}>Verify & Enable</Text>
                                )}
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>
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
        scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'], gap: spacing.md },
        statusCard: {
            backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl,
            alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: spacing.md, ...cardShadow,
        },
        statusTitle: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text },
        statusDesc: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
        enableBtn: {
            flexDirection: 'row', backgroundColor: colors.accent, borderRadius: radii.md,
            paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        },
        enableBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
        disableSection: { gap: spacing.md },
        disableLabel: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
        disableBtn: {
            backgroundColor: '#ef444415', borderRadius: radii.md, paddingVertical: spacing.md,
            alignItems: 'center', borderWidth: 1, borderColor: '#ef444430',
        },
        disableBtnText: { fontSize: fontSize.md, fontWeight: '600', color: '#ef4444' },
        codeInput: {
            backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.accent,
            borderRadius: radii.md, paddingVertical: spacing.lg,
            fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 8,
        },
        setupCard: {
            backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg,
            borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
        },
        setupStep: {
            fontSize: fontSize.xs, fontWeight: '600', color: colors.accent,
            textTransform: 'uppercase', letterSpacing: 1,
        },
        setupTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
        setupDesc: { fontSize: fontSize.sm, color: colors.textSecondary },
        qrContainer: {
            alignItems: 'center', backgroundColor: '#ffffff', borderRadius: radii.md,
            padding: spacing.md, alignSelf: 'center',
        },
        qrImage: { width: 200, height: 200 },
        secretRow: {
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
            backgroundColor: colors.bg, borderRadius: radii.md, padding: spacing.md,
        },
        secretText: {
            flex: 1, fontSize: fontSize.sm, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        },
        verifyBtn: {
            backgroundColor: colors.accent, borderRadius: radii.md, paddingVertical: spacing.md,
            alignItems: 'center', marginTop: spacing.sm,
        },
        verifyBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#1a1a18' },
    });
}
