import { useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import GlobalBackground from '../src/components/GlobalBackground';
import {
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { useAuthStore } from '../src/stores/authStore';
import { useThemeStore } from '../src/stores/themeStore';
import { api } from '../src/lib/api';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
        },
    },
});

function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, setAuth, setLoading, loadToken } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const token = await loadToken();
                if (token) {
                    const userData = await api.getMe();
                    if (userData) {
                        await setAuth({
                            id: userData.id,
                            username: userData.username,
                            email: userData.email,
                            shareCode: userData.shareCode || '',
                            avatar: userData.avatar || null,
                            bio: userData.bio || '',
                            role: (userData.role as 'user' | 'admin' | 'owner') || 'user',
                            isAdmin: userData.isAdmin || false,
                            isOwner: userData.isOwner || false,
                            streakData: userData.streakData || {},
                            twoFAEnabled: userData.twoFAEnabled || false,
                            petCustomization: userData.petCustomization,
                        }, token);
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } catch {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (isLoading) return;
        const inAuthGroup = segments[0] === '(auth)';
        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments, isLoading]);

    return <>{children}</>;
}

export default function RootLayout() {
    const colors = useThemeStore((s) => s.colors);

    const [fontsLoaded, fontError] = useFonts({
        CormorantGaramond_300Light,
        CormorantGaramond_400Regular,
        CormorantGaramond_400Regular_Italic,
        CormorantGaramond_600SemiBold,
        CormorantGaramond_700Bold,
        CormorantGaramond_700Bold_Italic,
        Lora_400Regular,
        Lora_400Regular_Italic,
        Lora_500Medium,
        Lora_600SemiBold,
        Lora_700Bold,
        JetBrainsMono_400Regular,
        JetBrainsMono_500Medium,
        JetBrainsMono_700Bold,
    });

    const onLayoutReady = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    useEffect(() => {
        onLayoutReady();
    }, [onLayoutReady]);

    if (!fontsLoaded && !fontError) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <AuthGate>
                <GlobalBackground />
                <GlobalBackground />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: 'transparent' },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="deck/[id]/index" options={{ presentation: 'card' }} />
                    <Stack.Screen name="deck/[id]/study" options={{ presentation: 'fullScreenModal' }} />
                    <Stack.Screen name="deck/[id]/test" options={{ presentation: 'fullScreenModal' }} />
                </Stack>
            </AuthGate>
        </QueryClientProvider>
    );
}
