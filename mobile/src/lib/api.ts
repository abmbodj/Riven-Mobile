import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'riven_auth_token';

// Point to your server — change this for production
const API_BASE = __DEV__
    ? 'https://riven-h7rw.onrender.com/api'  // Use deployed server for now
    : 'https://riven-h7rw.onrender.com/api';

async function getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============ AUTH ============

export interface LoginResponse {
    token: string;
    require2FA: boolean;
    tempToken?: string;
    user?: {
        id: number;
        username: string;
        email: string;
        shareCode: string;
        avatar: string | null;
        bio: string;
        role: string;
        isAdmin: boolean;
        isOwner: boolean;
        streakData: Record<string, unknown>;
        twoFAEnabled: boolean;
    };
}

export interface RegisterResponse {
    token: string;
    user: LoginResponse['user'];
}

export const api = {
    // Auth
    login: (email: string, password: string) =>
        request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (username: string, email: string, password: string) =>
        request<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        }),

    getMe: () => request<LoginResponse['user']>('/auth/me'),

    logout: () =>
        request<{ message: string }>('/auth/logout', { method: 'POST' }),

    updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
        request<LoginResponse['user']>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    changePassword: (currentPassword: string, newPassword: string) =>
        request<{ message: string }>('/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        }),

    // Streak
    getStreak: () => request<Record<string, unknown>>('/auth/streak'),
    saveStreak: (streakData: Record<string, unknown>) =>
        request<{ message: string }>('/auth/streak', {
            method: 'PUT',
            body: JSON.stringify({ streakData }),
        }),

    // ============ DECKS ============

    getDecks: () =>
        request<Deck[]>('/decks'),

    getDeck: (id: number) =>
        request<DeckWithCards>(`/decks/${id}`),

    createDeck: (title: string, description?: string, folder_id?: number | null, tagIds?: number[]) =>
        request<{ id: number; title: string }>('/decks', {
            method: 'POST',
            body: JSON.stringify({ title, description, folder_id, tagIds }),
        }),

    updateDeck: (id: number, data: { title: string; description?: string; folder_id?: number | null; tagIds?: number[] }) =>
        request<{ id: number }>(`/decks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteDeck: (id: number) =>
        request<{ message: string }>(`/decks/${id}`, { method: 'DELETE' }),

    duplicateDeck: (id: number) =>
        request<Deck>(`/decks/${id}/duplicate`, { method: 'POST' }),

    // ============ CARDS ============

    addCard: (deckId: number, front: string, back: string, front_image?: string, back_image?: string) =>
        request<Card>(`/decks/${deckId}/cards`, {
            method: 'POST',
            body: JSON.stringify({ front, back, front_image, back_image }),
        }),

    updateCard: (id: number, front: string, back: string, front_image?: string, back_image?: string) =>
        request<Card>(`/cards/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ front, back, front_image, back_image }),
        }),

    deleteCard: (id: number) =>
        request<{ message: string }>(`/cards/${id}`, { method: 'DELETE' }),

    updateCardProgress: (id: number, data: {
        difficulty?: number;
        times_reviewed?: number;
        times_correct?: number;
        last_reviewed?: string;
        next_review?: string;
    }) =>
        request<Card>(`/cards/${id}/progress`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // ============ FOLDERS ============

    getFolders: () => request<Folder[]>('/folders'),

    createFolder: (name: string, color?: string, icon?: string) =>
        request<Folder>('/folders', {
            method: 'POST',
            body: JSON.stringify({ name, color, icon }),
        }),

    updateFolder: (id: number, data: { name?: string; color?: string; icon?: string }) =>
        request<Folder>(`/folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteFolder: (id: number) =>
        request<{ message: string }>(`/folders/${id}`, { method: 'DELETE' }),

    // ============ TAGS ============

    getTags: () => request<Tag[]>('/tags'),

    createTag: (name: string, color: string) =>
        request<Tag>('/tags', {
            method: 'POST',
            body: JSON.stringify({ name, color }),
        }),

    deleteTag: (id: number) =>
        request<{ message: string }>(`/tags/${id}`, { method: 'DELETE' }),

    // ============ STUDY SESSIONS ============

    saveStudySession: (deckId: number, data: {
        cards_studied: number;
        cards_correct: number;
        duration_seconds: number;
        session_type?: string;
    }) =>
        request<{ id: number }>(`/study-sessions`, {
            method: 'POST',
            body: JSON.stringify({ deck_id: deckId, ...data }),
        }),

    // ============ THEMES ============

    getThemes: () => request<ServerTheme[]>('/themes'),

    setActiveTheme: (id: number) =>
        request<ServerTheme>(`/themes/${id}/activate`, { method: 'PUT' }),

    // ============ SOCIAL ============

    searchUsers: (q: string) => request<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}`),
    getUserProfile: (id: number) => request<UserProfile>(`/users/${id}`),
    getFriends: () => request<Friend[]>('/friends'),
    sendFriendRequest: (userId: number) =>
        request<{ message: string }>('/friends/request', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }),
    acceptFriendRequest: (userId: number) =>
        request<{ message: string }>('/friends/accept', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }),
    removeFriend: (userId: number) =>
        request<{ message: string }>(`/friends/${userId}`, { method: 'DELETE' }),

    // ============ MESSAGES ============

    getConversations: () => request<Conversation[]>('/messages/conversations'),
    getMessages: (userId: number, limit?: number) =>
        request<Message[]>(`/messages/${userId}?limit=${limit || 50}`),
    sendMessage: (receiverId: number, content: string, messageType?: string) =>
        request<Message>('/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId, content, messageType }),
        }),
    getUnreadCount: () => request<{ count: number }>('/messages/unread/count'),
};

// ============ TYPES ============

export interface Deck {
    id: number;
    user_id: number;
    title: string;
    description: string;
    folder_id: number | null;
    last_studied: string | null;
    created_at: string;
    cardCount: number;
    tags: Tag[];
}

export interface DeckWithCards extends Deck {
    cards: Card[];
}

export interface Card {
    id: number;
    deck_id: number;
    front: string;
    back: string;
    front_image: string | null;
    back_image: string | null;
    position: number;
    difficulty: number;
    times_reviewed: number;
    times_correct: number;
    last_reviewed: string | null;
    next_review: string | null;
    created_at: string;
}

export interface Folder {
    id: number;
    user_id: number;
    name: string;
    color: string;
    icon: string;
    deckCount: number;
    created_at: string;
}

export interface Tag {
    id: number;
    name: string;
    color: string;
    is_preset: number;
    user_id: number;
}

export interface ServerTheme {
    id: number;
    name: string;
    bg_color: string;
    surface_color: string;
    text_color: string;
    secondary_text_color: string;
    border_color: string;
    accent_color: string;
    font_family_display: string;
    font_family_body: string;
    is_active: number;
    is_default: number;
}

export interface UserSearchResult {
    id: number;
    username: string;
    avatar: string | null;
    bio: string;
    shareCode: string;
    role: string;
    isAdmin: boolean;
    isOwner: boolean;
}

export interface UserProfile extends UserSearchResult {
    createdAt: string;
    deckCount: number;
    friendshipStatus: string | null;
    friendshipDirection: string | null;
}

export interface Friend {
    id: number;
    username: string;
    avatar: string | null;
    bio: string;
    status: string;
    role: string;
    isAdmin: boolean;
    isOwner: boolean;
    isOutgoing: boolean;
}

export interface Conversation {
    userId: number;
    username: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageType: string;
    lastMessageAt: string;
    isOwnMessage: boolean;
    unreadCount: number;
}

export interface Message {
    id: number;
    senderId: number;
    senderUsername: string;
    senderAvatar: string | null;
    content: string;
    messageType: string;
    deckData: Record<string, unknown> | null;
    imageUrl: string | null;
    isEdited: boolean;
    isRead: boolean;
    createdAt: string;
    isMine: boolean;
}
