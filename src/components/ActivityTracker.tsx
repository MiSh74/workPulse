import { useEffect, useRef } from 'react';
import { logActivity } from '@/features/sessions/sessions.api';
import { useSessionStore } from '@/store/session.store';

const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const LOG_INTERVAL = 60 * 1000; // 1 minute

export const ActivityTracker = () => {
    const { activeSession } = useSessionStore();
    const lastActivityRef = useRef<number>(Date.now());
    const isIdleRef = useRef<boolean>(false);

    useEffect(() => {
        if (!activeSession || activeSession.status !== 'active') return;

        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            if (isIdleRef.current) {
                isIdleRef.current = false;
                // Optional: Resume notification or immediate log
            }
        };

        // Browser events for activity detection
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('scroll', handleActivity);

        const checkIdle = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            if (timeSinceLastActivity >= IDLE_THRESHOLD && !isIdleRef.current) {
                isIdleRef.current = true;
            }

            // Periodic logging
            logActivity(activeSession.id, {
                type: isIdleRef.current ? 'idle' : 'active',
                appName: 'WorkPulse Web',
                windowTitle: document.title,
            }).catch(() => { });
        }, LOG_INTERVAL);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            clearInterval(checkIdle);
        };
    }, [activeSession]);

    return null; // Side-effect only component
};
