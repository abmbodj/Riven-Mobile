import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, Sprout, Palette, User } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { botanical, fonts, spacing, fontSize } from '../../src/constants/tokens';

export default function TabLayout() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarBackground: () => (
                    <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
                ),
                tabBarLabelStyle: {
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: -2,
                },
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'rgba(22, 42, 49, 0.92)',
                    borderTopColor: colors.border + '99',
                    borderTopWidth: 1,
                    height: 80,
                    paddingBottom: 24,
                    paddingTop: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ color, size }) => <Home size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="garden"
                options={{
                    title: 'Garden',
                    tabBarIcon: ({ color, size }) => <Sprout size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: '',
                    tabBarIcon: () => (
                        <View style={styles.fabContainer}>
                            <View style={styles.fab}>
                                <Sprout size={24} color="#ffffff" />
                            </View>
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="themes"
                options={{
                    title: 'Themes',
                    tabBarIcon: ({ color, size }) => <Palette size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, size }) => <User size={20} color={color} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'relative',
        top: -16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: botanical.forest,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#162a31',
        shadowColor: botanical.forest,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
});
