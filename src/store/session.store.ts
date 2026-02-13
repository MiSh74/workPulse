import { create } from 'zustand';
import type { Session } from '@/types';

interface SessionState {
    activeSession: Session | null;
    setActiveSession: (session: Session | null) => void;
    updateSessionTime: (activeTime: number, idleTime: number) => void;
    setPaused: (isPaused: boolean) => void;
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
                        total_active_seconds: activeTime,
                        total_idle_seconds: idleTime,
                    },
                }
                : state
        ),

    setPaused: (isPaused) =>
        set((state) => (
            state.activeSession
                ? {
                    activeSession: {
                        ...state.activeSession,
                        status: isPaused ? 'paused' : 'active'
                    }
                }
                : state
        )),
}));
