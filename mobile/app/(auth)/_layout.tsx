import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';

export default function AuthLayout() {
    const colors = useThemeStore((s) => s.colors);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}
