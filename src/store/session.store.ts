import { create } from 'zustand';
import type { Session } from '@/types';

interface SessionState {
    activeSession: Session | null;
    setActiveSession: (session: Session | null) => void;
    updateSessionTime: (activeTime: number, idleTime: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    activeSession: null,

    setActiveSession: (session) => set({ activeSession: session }),

    updateSessionTime: (activeTime, idleTime) =>
        set((state) =>
            state.activeSession
                ? {
                    activeSession: {
                        ...state.activeSession,
                        activeTime,
                        idleTime,
                    },
                }
                : state
        ),
}));
