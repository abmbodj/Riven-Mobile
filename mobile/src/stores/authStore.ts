import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
    id: number;
    username: string;
    email: string;
    shareCode: string;
    avatar: string | null;
    bio: string;
    role: 'user' | 'admin' | 'owner';
    isAdmin: boolean;
    isOwner: boolean;
    streakData: Record<string, unknown>;
    twoFAEnabled: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<string | null>;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
}

const TOKEN_KEY = 'riven_auth_token';

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: async (user, token) => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    loadToken: async () => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
            set({ token });
        }
        return token;
    },

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
