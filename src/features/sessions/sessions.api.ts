import api from '@/services/api';
import type { WorkSession, StartSessionRequest, ActivityLogRequest, DailySummary } from '@/types';

export const getActiveSessions = async (): Promise<WorkSession[]> => {
    const response = await api.get<WorkSession[]>('/sessions/active');
    return response.data;
};

export const getMyActiveSession = async (): Promise<WorkSession | null> => {
    const response = await api.get<WorkSession | null>('/sessions/active/mine');
    return response.data;
};

export const startSession = async (data: StartSessionRequest): Promise<WorkSession> => {
    const response = await api.post<WorkSession>('/sessions/start', data);
    return response.data;
};

export const stopSession = async (sessionId: string): Promise<void> => {
    await api.post(`/sessions/${sessionId}/stop`);
};

export const pauseSession = async (sessionId: string): Promise<void> => {
    await api.post(`/sessions/${sessionId}/pause`);
};

export const resumeSession = async (sessionId: string): Promise<void> => {
    await api.post(`/sessions/${sessionId}/resume`);
};

export const logActivity = async (sessionId: string, data: ActivityLogRequest): Promise<void> => {
    await api.post(`/sessions/${sessionId}/activity`, data);
};

export const getSessionHistory = async (filters?: { user_id?: string }): Promise<WorkSession[]> => {
    const response = await api.get<WorkSession[]>('/reports/daily', { params: filters });
    return response.data;
};

export const getDailySummary = async (date?: string): Promise<DailySummary> => {
    const response = await api.get<DailySummary>('/reports/daily', { params: { date } });
    return response.data;
};

export const getWeeklyAttendance = async (): Promise<any> => {
    const response = await api.get('/reports/weekly-attendance');
    return response.data;
};

