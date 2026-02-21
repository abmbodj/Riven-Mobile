import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/authStore';
import { useThemeStore } from '../src/stores/themeStore';
import { api } from '../src/lib/api';
import { RIVEN_DARK } from '../src/constants/tokens';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
        },
    },
});

function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, setAuth, setLoading, loadToken } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    // Load token on mount and fetch user
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

    // Route protection
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

    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <AuthGate>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.bg },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                        name="deck/[id]/index"
                        options={{ presentation: 'card' }}
                    />
                    <Stack.Screen
                        name="deck/[id]/study"
                        options={{ presentation: 'fullScreenModal' }}
                    />
                    <Stack.Screen
                        name="deck/[id]/test"
                        options={{ presentation: 'fullScreenModal' }}
                    />
                </Stack>
            </AuthGate>
        </QueryClientProvider>
    );
}
