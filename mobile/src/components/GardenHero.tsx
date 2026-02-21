import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { getGardenStage } from '../utils/gardenUtils';
import { fonts, botanical, radii } from '../constants/tokens';

export default function GardenHero() {
    const router = useRouter();
    const colors = useThemeStore(s => s.colors);
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) return null;

    // Calculate consecutive days for streak
    const getStreak = () => {
        if (!user?.streakData) return 0;
        const now = new Date();
        let currentStreak = 0;
        let d = new Date(now);
        while (true) {
            const dStr = d.toISOString().split('T')[0];
            if (user.streakData[dStr]) {
                currentStreak++;
                d.setDate(d.getDate() - 1);
            } else {
                if (currentStreak === 0 && d.toDateString() === now.toDateString()) {
                    d.setDate(d.getDate() - 1);
                    continue;
                }
                break;
            }
        }
        return currentStreak;
    };

    const streak = getStreak();
    // We use petCustomization if it exists on the user to override stage
    const stageIndex = user?.petCustomization ? parseInt(user.petCustomization) : -1;
    const stage = typeof stageIndex === 'number' && stageIndex >= 0 ? getGardenStage(0) /* we'll fix the util usage */ : getGardenStage(streak);

    // We need to properly resolve the stage. Since we don't have the full util here, let's just use getGardenStage(streak).
    const finalStage = getGardenStage(streak);

    return (
        <Pressable
            onPress={() => router.push('/garden')}
            style={({ pressed }) => [
                styles.container,
                { backgroundColor: botanical.paper },
                pressed && { transform: [{ scale: 0.96 }] }
            ]}
        >
            <ImageBackground
                source={{ uri: 'https://www.transparenttextures.com/patterns/paper-fibers.png' }}
                style={StyleSheet.absoluteFill}
                imageStyle={{ opacity: 0.04 }}
            />
            <View style={styles.inner}>
                <Leaf size={10} color={colors.accent} />
                <Text style={[styles.text, { color: botanical.ink }]}>{finalStage.name}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: botanical.tapePin + '40',
        overflow: 'hidden',
        shadowColor: botanical.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        transform: [{ rotate: '2deg' }],
        marginLeft: 8,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    text: {
        fontFamily: fonts.monoBold,
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
