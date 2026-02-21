import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Check, Image as ImageIcon, Layers, X, Leaf } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useAuthStore } from '../../src/stores/authStore';
import { api, Message } from '../../src/lib/api';
import { fonts, spacing, radii, fontSize, botanical, cardShadow } from '../../src/constants/tokens';

export default function ChatScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const colors = useThemeStore((s) => s.colors);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const queryClient = useQueryClient();
    const parameters = useLocalSearchParams()
    const otherUserId = parseInt(userId);
    const insets = useSafeAreaInsets();

    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [acceptingDeck, setAcceptingDeck] = useState<number | null>(null);

    const { data: messages, isLoading } = useQuery({
        queryKey: ['messages', otherUserId],
        queryFn: () => api.getMessages(otherUserId),
        refetchInterval: 5000,
    });

    // Also get the user's profile info to show in header
    const { data: chatUser } = useQuery({
        queryKey: ['user', otherUserId],
        queryFn: () => api.getUserProfile(otherUserId),
    });

    const sendMessage = useMutation({
        mutationFn: () => api.sendMessage(otherUserId, message.trim()),
        onMutate: () => setSending(true),
        onSettled: () => setSending(false),
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['messages', otherUserId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const handleSend = () => {
        if (!message.trim() || sending) return;
        sendMessage.mutate();
    };

    const handleAcceptDeck = async (msgId: number) => {
        setAcceptingDeck(msgId);
        try {
            await api.acceptSharedDeck(msgId);
            queryClient.invalidateQueries({ queryKey: ['messages', otherUserId] });
        } catch {
            // failed to accept
        } finally {
            setAcceptingDeck(null);
        }
    };

    const styles = makeStyles(colors);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = useCallback(({ item, index }: { item: Message, index: number }) => {
        const nextMessage = messages?.[index - 1]; // because list is inverted, index-1 is historically 'next'
        const showAvatar = !item.isMine && (!nextMessage || nextMessage.isMine);

        const deckData = item.deckData as Record<string, any>;
        if (item.messageType === 'deck' && deckData) {
            return (
                <View style={[styles.messageWrapper, item.isMine ? styles.myWrapper : styles.theirWrapper]}>
                    <View style={[styles.deckBubble, item.isMine ? styles.myDeckBubble : styles.theirDeckBubble]}>
                        <View style={styles.deckBubbleHeader}>
                            <View style={styles.deckIconWrap}>
                                <Layers size={16} color={botanical.forest} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.deckSharedText}>
                                    {item.isMine ? 'YOU SHARED A DECK' : `${(chatUser?.username || 'Friend').toUpperCase()} SHARED A DECK`}
                                </Text>
                                <Text style={styles.deckTitle} numberOfLines={1}>{deckData.title}</Text>
                            </View>
                        </View>
                        <Text style={styles.deckSub}>{deckData.cardCount} cards</Text>

                        {item.isMine ? (
                            <Pressable style={styles.deckBtnSecondary} onPress={() => router.push(`/deck/${deckData.id}`)}>
                                <Text style={styles.deckBtnTextSecondary}>View Deck</Text>
                            </Pressable>
                        ) : deckData.acceptedDeckId ? (
                            <Pressable style={styles.deckBtnSecondary} onPress={() => router.push(`/deck/${deckData.acceptedDeckId}`)}>
                                <Text style={styles.deckBtnTextSecondary}>✓ View in Collection</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                style={[styles.deckBtnPrimary, acceptingDeck === item.id && { opacity: 0.5 }]}
                                onPress={() => handleAcceptDeck(item.id)}
                            >
                                <Text style={styles.deckBtnTextPrimary}>
                                    {acceptingDeck === item.id ? 'Adding...' : 'Add to Collection'}
                                </Text>
                            </Pressable>
                        )}
                        <Text style={[styles.messageTime, { alignSelf: item.isMine ? 'flex-end' : 'flex-start', marginTop: 4 }]}>{formatTime(item.createdAt)}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageWrapper, item.isMine ? styles.myWrapper : styles.theirWrapper]}>
                {!item.isMine && (
                    <View style={{ width: 28, height: 28, marginRight: spacing.sm, justifyContent: 'flex-end' }}>
                        {showAvatar && (
                            <View style={styles.tinyAvatar}>
                                <Text style={styles.tinyAvatarText}>{(item.senderUsername || chatUser?.username || '?').charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={[styles.messageBubble, item.isMine ? styles.myMessage : styles.theirMessage, item.isMine && { backgroundColor: botanical.forest }]}>
                    {!item.isMine && (
                        <View style={styles.theirBubbleDot} />
                    )}
                    <Text style={[styles.messageText, item.isMine ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content}
                    </Text>
                    {item.isEdited && <Text style={styles.editedText}>(edited)</Text>}
                    <Text style={[styles.messageTime, item.isMine && styles.myMessageTime]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    }, [colors, styles, router, chatUser, messages, acceptingDeck]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.decorLeft} />
                <View style={styles.decorRight} />

                <Pressable onPress={() => router.back()} hitSlop={12} style={{ padding: spacing.xs, marginRight: spacing.sm }}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>

                <Pressable style={styles.headerUserArea} onPress={() => router.push(`/user/${otherUserId}`)}>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerAvatarText}>{chatUser?.username?.charAt(0).toUpperCase() || '?'}</Text>
                        <View style={styles.onlineDot} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerName}>{chatUser?.username || 'Chat'}</Text>
                        <Text style={styles.headerSub}>Tap to view profile</Text>
                    </View>
                </Pressable>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.bgPatternArea}>
                    {/* Messages */}
                    {isLoading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={botanical.forest} />
                            <Leaf size={16} color={botanical.forest} style={{ position: 'absolute', opacity: 0.6 }} />
                        </View>
                    ) : !messages || messages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrap}>
                                <Send size={28} color={botanical.sepia} />
                            </View>
                            <Text style={styles.emptyTitle}>No messages yet</Text>
                            <Text style={styles.emptySub}>Say hi to {chatUser?.username}! 👋</Text>
                        </View>
                    ) : (
                        <>
                            {/* @ts-ignore */}
                            <FlashList
                                data={[...messages].reverse()}
                                renderItem={renderMessage}
                                estimatedItemSize={70}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
                                inverted
                                ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
                            />
                        </>
                    )}
                </View>

                {/* Input */}
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.md }]}>
                    <Pressable style={styles.attachBtn}>
                        <ImageIcon size={24} color={botanical.sepia} />
                    </Pressable>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message..."
                            placeholderTextColor="rgba(143,166,168,0.5)"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            maxLength={1000}
                        />
                        <Pressable
                            style={({ pressed }) => [
                                styles.sendButton,
                                (!message.trim() || sending) && { opacity: 0.5 },
                                pressed && { transform: [{ scale: 0.95 }] },
                            ]}
                            onPress={handleSend}
                            disabled={!message.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Send size={14} color="#fff" style={{ marginLeft: 2 }} />
                            )}
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function makeStyles(colors: ReturnType<typeof useThemeStore.getState>['colors']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        header: {
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
            borderBottomWidth: 1, borderBottomColor: 'rgba(143,166,168,0.1)',
            backgroundColor: 'rgba(22,42,49,0.9)', zIndex: 10, position: 'relative'
        },
        decorLeft: { position: 'absolute', top: 8, left: 8, width: 12, height: 12, borderTopWidth: 1, borderLeftWidth: 1, borderColor: 'rgba(122,158,114,0.2)', borderTopLeftRadius: 4 },
        decorRight: { position: 'absolute', bottom: 8, right: 8, width: 12, height: 12, borderBottomWidth: 1, borderRightWidth: 1, borderColor: 'rgba(122,158,114,0.2)', borderBottomRightRadius: 4 },

        headerUserArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.xs },
        headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
        headerAvatarText: { fontFamily: fonts.displayBold, fontSize: 18, color: botanical.forest },
        onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: botanical.forest, borderWidth: 2, borderColor: colors.bg },
        headerName: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.text, marginTop: -2 },
        headerSub: { fontFamily: fonts.mono, fontSize: 10, color: botanical.sepia },

        center: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
        bgPatternArea: { flex: 1 },

        emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
        emptyIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
        emptyTitle: { fontFamily: fonts.mono, fontSize: 14, color: botanical.sepia, marginBottom: spacing.xs },
        emptySub: { fontFamily: fonts.mono, fontSize: 12, color: 'rgba(143,166,168,0.7)' },

        messageWrapper: { flexDirection: 'row', width: '100%', marginBottom: spacing.xs },
        myWrapper: { justifyContent: 'flex-end' },
        theirWrapper: { justifyContent: 'flex-start' },

        tinyAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center' },
        tinyAvatarText: { fontFamily: fonts.displayBold, fontSize: 14, color: botanical.forest },

        messageBubble: {
            maxWidth: '78%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, position: 'relative',
        },
        myMessage: {
            borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderBottomLeftRadius: radii.xl, borderBottomRightRadius: 2,
            ...cardShadow, shadowColor: botanical.forest
        },
        theirMessage: {
            backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderBottomRightRadius: radii.xl, borderBottomLeftRadius: 2,
        },
        theirBubbleDot: { position: 'absolute', top: 6, right: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(122,158,114,0.1)' },

        messageText: { fontSize: 15 },
        myMessageText: { fontFamily: fonts.bodyBold, color: '#fff' },
        theirMessageText: { fontFamily: fonts.mono, color: botanical.parchment },
        editedText: { fontFamily: fonts.mono, fontSize: 10, opacity: 0.7, color: botanical.sepia, fontStyle: 'italic', marginLeft: spacing.xs },
        messageTime: { fontFamily: fonts.mono, fontSize: 9, color: botanical.sepia, marginTop: 4, opacity: 0.8 },
        myMessageTime: { color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end' },

        deckBubble: { maxWidth: '85%', overflow: 'hidden', backgroundColor: colors.surface },
        myDeckBubble: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderBottomLeftRadius: radii.xl, borderBottomRightRadius: 2 },
        theirDeckBubble: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderBottomRightRadius: radii.xl, borderBottomLeftRadius: 2 },
        deckBubbleHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, paddingBottom: spacing.xs },
        deckIconWrap: { width: 32, height: 32, borderRadius: radii.md, backgroundColor: 'rgba(122,158,114,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
        deckSharedText: { fontFamily: fonts.monoBold, fontSize: 9, color: botanical.sepia, letterSpacing: 0.5, marginBottom: 2 },
        deckTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: botanical.parchment },
        deckSub: { fontFamily: fonts.mono, fontSize: 11, color: botanical.sepia, textAlign: 'center', marginBottom: spacing.md },
        deckBtnPrimary: { backgroundColor: botanical.forest, paddingVertical: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.md, alignItems: 'center' },
        deckBtnTextPrimary: { fontFamily: fonts.monoBold, fontSize: 12, color: '#fff' },
        deckBtnSecondary: { backgroundColor: 'rgba(122,158,114,0.1)', paddingVertical: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.md, alignItems: 'center' },
        deckBtnTextSecondary: { fontFamily: fonts.monoBold, fontSize: 12, color: botanical.forest },

        inputContainer: {
            flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs,
            paddingHorizontal: spacing.md, paddingTop: spacing.sm,
            backgroundColor: 'rgba(22,42,49,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(143,166,168,0.2)',
        },
        attachBtn: { padding: spacing.sm, marginBottom: 2 },
        inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24, paddingLeft: spacing.md, paddingRight: 4, minHeight: 44, marginBottom: spacing.xs },
        input: {
            flex: 1, fontFamily: fonts.body, fontSize: 15, color: botanical.parchment,
            maxHeight: 100, paddingVertical: 12, paddingTop: 12
        },
        sendButton: {
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: botanical.forest, ...cardShadow,
            justifyContent: 'center', alignItems: 'center', marginBottom: 5, marginLeft: spacing.xs
        },
    });
}
