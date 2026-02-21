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
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BookOpen } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api } from '../../src/lib/api';
import { spacing, radii, fontSize } from '../../src/constants/tokens';

export default function CreateScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const createDeck = useMutation({
        mutationFn: () => api.createDeck(title.trim(), description.trim()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            setTitle('');
            setDescription('');
            router.push(`/deck/${data.id}`);
        },
        onError: (err: Error) => {
            Alert.alert('Error', err.message || 'Failed to create deck');
        },
    });

    const handleCreate = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Deck title is required');
            return;
        }
        createDeck.mutate();
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <BookOpen size={32} color={colors.accent} />
                        <Text style={styles.title}>Create New Deck</Text>
                        <Text style={styles.subtitle}>Start building your flashcard collection</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Deck Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Biology Chapter 5"
                                placeholderTextColor={colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                                autoCapitalize="sentences"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description (optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                placeholder="What's this deck about?"
                                placeholderTextColor={colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                pressed && styles.buttonPressed,
                                createDeck.isPending && styles.buttonDisabled,
                            ]}
                            onPress={handleCreate}
                            disabled={createDeck.isPending}
                        >
                            {createDeck.isPending ? (
                                <ActivityIndicator color={colors.bg} />
                            ) : (
                                <>
                                    <Plus size={20} color="#1a1a18" />
                                    <Text style={styles.buttonText}>Create Deck</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.xl,
            gap: spacing.sm,
        },
        title: {
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            color: colors.text,
        },
        subtitle: {
            fontSize: fontSize.md,
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
        textarea: {
            minHeight: 80,
            paddingTop: spacing.md,
        },
        button: {
            flexDirection: 'row',
            backgroundColor: colors.accent,
            borderRadius: radii.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            marginTop: spacing.md,
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
    });
}
