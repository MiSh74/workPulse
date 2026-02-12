import { create } from 'zustand';
import type { OnlineUser } from '@/types';

interface PresenceState {
    onlineUserCount: number;
    onlineUsers: OnlineUser[];
    setOnlineUserCount: (count: number) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;
    setOnlineUsers: (users: OnlineUser[]) => void;
    updateUserStatus: (userId: string, status: 'active' | 'idle' | 'offline') => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
    onlineUserCount: 0,
    onlineUsers: [],

    setOnlineUserCount: (count) => set({ onlineUserCount: count }),

    addOnlineUser: (user) =>
        set((state) => {
            const exists = state.onlineUsers.find((u) => u.id === user.id);
            if (exists) {
                // Update existing user
                return {
                    onlineUsers: state.onlineUsers.map((u) => (u.id === user.id ? user : u)),
                };
            }
            // Add new user
            return {
                onlineUsers: [...state.onlineUsers, user],
                onlineUserCount: state.onlineUserCount + 1,
            };
        }),

    removeOnlineUser: (userId) =>
        set((state) => ({
            onlineUsers: state.onlineUsers.filter((u) => u.id !== userId),
            onlineUserCount: Math.max(0, state.onlineUserCount - 1),
        })),

    setOnlineUsers: (users) =>
        set({ onlineUsers: users, onlineUserCount: users.length }),

    updateUserStatus: (userId, status) =>
        set((state) => ({
            onlineUsers: state.onlineUsers.map((u) =>
                u.id === userId ? { ...u, status, lastSeen: new Date().toISOString() } : u
            ),
        })),
}));
