import { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api, Message } from '../../src/lib/api';
import { spacing, radii, fontSize } from '../../src/constants/tokens';

export default function ChatScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const colors = useThemeStore((s) => s.colors);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const queryClient = useQueryClient();
    const otherUserId = parseInt(userId);

    const [message, setMessage] = useState('');

    const { data: messages, isLoading } = useQuery({
        queryKey: ['messages', otherUserId],
        queryFn: () => api.getMessages(otherUserId),
        refetchInterval: 5000, // Poll every 5 seconds
    });

    const sendMessage = useMutation({
        mutationFn: () => api.sendMessage(otherUserId, message.trim()),
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['messages', otherUserId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const handleSend = () => {
        if (!message.trim()) return;
        sendMessage.mutate();
    };

    const styles = makeStyles(colors);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const otherUsername = messages?.[0]?.isMine
        ? messages?.find((m) => !m.isMine)?.senderUsername
        : messages?.[0]?.senderUsername;

    const renderMessage = useCallback(({ item }: { item: Message }) => (
        <View style={[styles.messageBubble, item.isMine ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.messageText, item.isMine && styles.myMessageText]}>
                {item.content}
            </Text>
            <Text style={[styles.messageTime, item.isMine && styles.myMessageTime]}>
                {formatTime(item.createdAt)}
            </Text>
        </View>
    ), [colors, styles]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.headerName}>{otherUsername || 'Chat'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Messages */}
                {isLoading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                ) : (
                    <FlashList
                        data={[...(messages || [])].reverse()}
                        renderItem={renderMessage}
                        estimatedItemSize={60}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
                        inverted
                        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
                    />
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textSecondary}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={1000}
                    />
                    <Pressable
                        style={({ pressed }) => [
                            styles.sendButton,
                            !message.trim() && { opacity: 0.4 },
                            pressed && { opacity: 0.85 },
                        ]}
                        onPress={handleSend}
                        disabled={!message.trim() || sendMessage.isPending}
                    >
                        <Send size={20} color="#1a1a18" />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: spacing.md, paddingVertical: spacing.md,
            borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        headerName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        messageBubble: {
            maxWidth: '78%',
            borderRadius: radii.lg,
            padding: spacing.sm + 2,
            paddingHorizontal: spacing.md,
        },
        myMessage: {
            alignSelf: 'flex-end',
            backgroundColor: colors.accent,
            borderBottomRightRadius: 4,
        },
        theirMessage: {
            alignSelf: 'flex-start',
            backgroundColor: colors.surface,
            borderBottomLeftRadius: 4,
            borderWidth: 1,
            borderColor: colors.border,
        },
        messageText: { fontSize: fontSize.md, color: colors.text },
        myMessageText: { color: '#1a1a18' },
        messageTime: { fontSize: 10, color: colors.textSecondary, marginTop: 2, alignSelf: 'flex-end' },
        myMessageTime: { color: '#1a1a1880' },
        inputContainer: {
            flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
            paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
            borderTopWidth: 1, borderTopColor: colors.border,
            backgroundColor: colors.surface,
        },
        input: {
            flex: 1, backgroundColor: colors.bg,
            borderRadius: radii.md, paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2, fontSize: fontSize.md,
            color: colors.text, maxHeight: 100,
            borderWidth: 1, borderColor: colors.border,
        },
        sendButton: {
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: colors.accent,
            justifyContent: 'center', alignItems: 'center',
        },
    });
}
