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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { api } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical } from '../../src/constants/tokens';

export default function CreateDeckScreen() {
    const colors = useThemeStore((s) => s.colors);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const createDeck = useMutation({
        mutationFn: () => api.createDeck(title.trim(), description.trim()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            router.replace(`/deck/${data.id}`);
        },
        onError: (err: Error) => setError(err.message),
    });

    const handleCreate = () => {
        setError('');
        if (!title.trim()) {
            setError('Deck title is required');
            return;
        }
        createDeck.mutate();
    };

    const styles = makeStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <Pressable style={styles.backLink} onPress={() => router.back()}>
                        <ArrowLeft size={14} color={colors.accent} />
                        <Text style={styles.backText}>BACK TO LIBRARY</Text>
                    </Pressable>

                    <Text style={styles.title}>New Deck</Text>
                    <Text style={styles.subtitle}>Create a new collection of specimens.</Text>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>TITLE</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Organic Chemistry"
                        placeholderTextColor={colors.textSecondary + '60'}
                    />

                    <Text style={styles.label}>DESCRIPTION</Text>
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Optional notes about this deck..."
                        placeholderTextColor={colors.textSecondary + '60'}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <Pressable
                        style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
                        onPress={handleCreate}
                        disabled={createDeck.isPending}
                    >
                        {createDeck.isPending ? (
                            <ActivityIndicator color={botanical.ink} />
                        ) : (
                            <Text style={styles.createButtonText}>CREATE DECK</Text>
                        )}
                    </Pressable>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: 'transparent' },
        scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: spacing['2xl'] },
        backLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
        backText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.accent, letterSpacing: 1 },
        title: { fontFamily: fonts.displayBoldItalic, fontSize: fontSize['4xl'], color: colors.text, marginBottom: spacing.sm },
        subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl },
        errorBox: {
            backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444430',
            borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md,
        },
        errorText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: '#ef4444' },
        label: {
            fontFamily: fonts.monoBold, fontSize: fontSize.xs, color: colors.text,
            letterSpacing: 1.5, marginBottom: spacing.sm, marginTop: spacing.md,
        },
        input: {
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md + 2,
            fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md,
        },
        textarea: { minHeight: 100, paddingTop: spacing.md },
        createButton: {
            backgroundColor: colors.accent, borderRadius: radii.xl, paddingVertical: spacing.md + 4,
            alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 52,
            shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
        },
        createButtonText: { fontFamily: fonts.monoBold, fontSize: fontSize.md, color: botanical.ink, letterSpacing: 2 },
    });
}
