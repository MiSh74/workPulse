import api from '@/services/api';
import { mockActiveSessions, mockDailySummary, mockSessionHistory } from '@/mocks/data';
import type { Session, StartSessionRequest } from '@/types';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

export const getActiveSessions = async (): Promise<Session[]> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockActiveSessions), 300);
        });
    }
    const response = await api.get('/sessions/active');
    return response.data;
};

export const getMyActiveSession = async (): Promise<Session | null> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Return first session for employee user (id: '3')
                const session = mockActiveSessions.find(s => s.userId === '3') || null;
                resolve(session);
            }, 300);
        });
    }
    const response = await api.get('/sessions/my-active');
    return response.data;
};

export const startSession = async (data: StartSessionRequest): Promise<Session> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newSession: Session = {
                    id: Date.now().toString(),
                    userId: '3',
                    userName: 'Employee User',
                    projectId: data.projectId,
                    projectName: 'Mock Project',
                    startTime: new Date().toISOString(),
                    activeTime: 0,
                    idleTime: 0,
                    status: 'active',
                };
                mockActiveSessions.push(newSession);
                resolve(newSession);
            }, 300);
        });
    }
    const response = await api.post('/sessions/start', data);
    return response.data;
};

export const stopSession = async (sessionId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = mockActiveSessions.findIndex(s => s.id === sessionId);
                if (index !== -1) {
                    mockActiveSessions.splice(index, 1);
                }
                resolve();
            }, 300);
        });
    }
    await api.post(`/sessions/${sessionId}/stop`);
};

export const getSessionHistory = async (): Promise<Session[]> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockSessionHistory), 300);
        });
    }
    const response = await api.get('/sessions/history');
    return response.data;
};

export const getDailySummary = async () => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockDailySummary), 300);
        });
    }
    const response = await api.get('/sessions/daily-summary');
    return response.data;
};
