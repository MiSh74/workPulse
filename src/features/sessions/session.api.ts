import api from '@/services/api';
import type { Session, StartSessionRequest, ActivityUpdate } from '@/types';

/**
 * Start a new session
 */
export const startSession = async (data: StartSessionRequest): Promise<Session> => {
    const response = await api.post<Session>('/sessions/start', data);
    return response.data;
};

/**
 * Stop current session
 */
export const stopSession = async (sessionId: string): Promise<Session> => {
    const response = await api.post<Session>(`/sessions/${sessionId}/stop`);
    return response.data;
};

/**
 * Get active session
 */
export const getActiveSession = async (): Promise<Session | null> => {
    const response = await api.get<Session | null>('/sessions/active');
    return response.data;
};

/**
 * Send activity update
 */
export const sendActivity = async (sessionId: string, data: ActivityUpdate): Promise<void> => {
    await api.post(`/sessions/${sessionId}/activity`, data);
};
