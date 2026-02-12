import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService } from '@/services/websocket';
import { usePresenceStore } from '@/store/presence.store';
import { useSessionStore } from '@/store/session.store';
import type {
    UserOnlinePayload,
    UserOfflinePayload,
    SessionUpdatePayload,
    AlertPayload,
    OnlineUser,
} from '@/types';

/**
 * Custom hook to manage WebSocket event subscriptions
 * Integrates with React Query, Zustand stores, and UI notifications
 */
export const useWebSocketEvents = () => {
    const queryClient = useQueryClient();
    const { addOnlineUser, removeOnlineUser } = usePresenceStore();
    const { setActiveSession } = useSessionStore();

    useEffect(() => {
        const handlers = {
            onUserOnline: (data: UserOnlinePayload) => {
                console.log('User online:', data);
                const onlineUser: OnlineUser = {
                    id: data.userId,
                    name: data.userName,
                    email: '', // Not provided in event
                    role: data.userRole,
                    status: 'active',
                    lastSeen: new Date().toISOString(),
                };
                addOnlineUser(onlineUser);

                // Refetch online users and sessions
                queryClient.invalidateQueries({ queryKey: ['users', 'online'] });
            },

            onUserOffline: (data: UserOfflinePayload) => {
                console.log('User offline:', data);
                removeOnlineUser(data.userId);

                // Refetch online users
                queryClient.invalidateQueries({ queryKey: ['users', 'online'] });
            },

            onSessionUpdate: (data: SessionUpdatePayload) => {
                console.log('Session update:', data);

                // Update session in store if it's the active session
                setActiveSession(data.session);

                // Refetch sessions and related data
                queryClient.invalidateQueries({ queryKey: ['sessions'] });
                queryClient.invalidateQueries({ queryKey: ['activeSession'] });
                queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
            },

            onInactiveAlert: (data: AlertPayload) => {
                console.log('Inactive alert:', data);

                // Refetch alerts
                queryClient.invalidateQueries({ queryKey: ['alerts'] });
            },

            onOvertimeAlert: (data: AlertPayload) => {
                console.log('Overtime alert:', data);

                // Refetch alerts
                queryClient.invalidateQueries({ queryKey: ['alerts'] });
            },

            onReconnect: () => {
                console.log('Reconnected - refetching all data');

                // Refetch all critical data after reconnection
                queryClient.invalidateQueries({ queryKey: ['activeSession'] });
                queryClient.invalidateQueries({ queryKey: ['sessions'] });
                queryClient.invalidateQueries({ queryKey: ['users'] });
                queryClient.invalidateQueries({ queryKey: ['alerts'] });
                queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
            },
        };

        // Setup event handlers
        websocketService.setupEventHandlers(handlers);

        // Cleanup on unmount
        return () => {
            websocketService.off('USER_ONLINE');
            websocketService.off('USER_OFFLINE');
            websocketService.off('SESSION_UPDATE');
            websocketService.off('INACTIVE_ALERT');
            websocketService.off('OVERTIME_ALERT');
            websocketService.off('RECONNECT');
        };
    }, [queryClient, addOnlineUser, removeOnlineUser, setActiveSession]);
};
