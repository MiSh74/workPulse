import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
    // Initialize from localStorage
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;

    return {
        user: initialUser,
        accessToken: storedToken,
        isAuthenticated: !!storedToken,

        login: (user, accessToken) => {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, accessToken, isAuthenticated: true });
        },

        logout: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            set({ user: null, accessToken: null, isAuthenticated: false });
        },

        setUser: (user) => {
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
        },
    };
});
