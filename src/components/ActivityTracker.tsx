import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import type { WorkSession } from '@/types';

export const ActivityTracker = () => {
    const { activeSession, setActiveSession, updateSessionTime } = useSessionStore();
    const { accessToken } = useAuthStore();
    const workerRef = useRef<SharedWorker | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        // SharedWorker setup — create once per page lifecycle
        if (!workerRef.current) {
            try {
                workerRef.current = new SharedWorker(
                    new URL('../services/activity.worker.ts', import.meta.url),
                    { type: 'module' }
                );
                workerRef.current.port.start();

                // Handle messages FROM the worker
                workerRef.current.port.onmessage = (msg) => {
                    const { type, payload } = msg.data;
                    if (type === 'LOG_SUCCESS' && payload?.session) {
                        const s = payload.session as WorkSession;
                        // Immediately update the session store with fresh totals
                        updateSessionTime(s.total_active_seconds, s.total_idle_seconds);
                        setActiveSession(s);
                        // Also invalidate React Query so polls also see latest data
                        queryClient.invalidateQueries({ queryKey: ['activeSession'] });
                        queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
                    }
                };

                console.log('✅ Activity SharedWorker initialized');
            } catch (err) {
                console.error('Failed to initialize SharedWorker:', err);
                return;
            }
        }

        if (!activeSession || activeSession.status !== 'active' || !accessToken) {
            if (workerRef.current) {
                workerRef.current.port.postMessage({ type: 'STOP' });
            }
            return;
        }

        // Initialize worker with current session info
        workerRef.current.port.postMessage({
            type: 'INIT',
            payload: {
                sessionId: activeSession.id,
                token: accessToken,
                apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000'
            }
        });

        const handleActivity = () => {
            workerRef.current?.port.postMessage({ type: 'ACTIVITY' });
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, [activeSession, accessToken, queryClient, updateSessionTime, setActiveSession]);

    return null;
};
