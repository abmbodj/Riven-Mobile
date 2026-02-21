import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useThemeStore } from '../src/stores/themeStore';
import { fonts, fontSize, spacing, botanical } from '../src/constants/tokens';

export default function NotFoundScreen() {
    const colors = useThemeStore((s) => s.colors);
    const styles = makeStyles(colors);

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text style={styles.title}>404</Text>
                <Text style={styles.subtitle}>This path leads nowhere.</Text>
                <Link href="/(tabs)" asChild>
                    <Pressable style={({ pressed }) => [styles.botanicalButton, pressed && { opacity: 0.8 }]}>
                        <Text style={styles.buttonText}>RETURN TO GARDEN</Text>
                    </Pressable>
                </Link>
            </View>
        </>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
        title: { fontFamily: fonts.displayBoldItalic, fontSize: fontSize['4xl'], color: colors.text, marginBottom: spacing.md },
        subtitle: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing['2xl'] },
        botanicalButton: {
            backgroundColor: colors.surface, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
            borderRadius: 12, borderWidth: 1, borderColor: colors.border,
        },
        buttonText: { fontFamily: fonts.monoBold, fontSize: fontSize.sm, color: colors.accent, letterSpacing: 1.5 },
    });
}
