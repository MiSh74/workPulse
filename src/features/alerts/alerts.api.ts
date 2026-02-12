import api from '@/services/api';
import { mockAlerts } from '@/mocks/data';
import type { Alert } from '@/types';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

export const getAlerts = async (params?: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
}): Promise<Alert[]> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockAlerts];
                if (params?.type) {
                    filtered = filtered.filter(a => a.type === params.type);
                }
                if (params?.severity) {
                    filtered = filtered.filter(a => a.severity === params.severity);
                }
                if (params?.resolved !== undefined) {
                    filtered = filtered.filter(a => a.resolved === params.resolved);
                }
                if (params?.limit) {
                    filtered = filtered.slice(0, params.limit);
                }
                resolve(filtered);
            }, 300);
        });
    }
    const response = await api.get('/alerts', { params });
    return response.data;
};

export const resolveAlert = async (alertId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const alert = mockAlerts.find(a => a.id === alertId);
                if (alert) {
                    alert.resolved = true;
                    alert.resolvedAt = new Date().toISOString();
                }
                resolve();
            }, 300);
        });
    }
    await api.patch(`/alerts/${alertId}/resolve`);
};

export const resolveAllAlerts = async (): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockAlerts.forEach(alert => {
                    if (!alert.resolved) {
                        alert.resolved = true;
                        alert.resolvedAt = new Date().toISOString();
                    }
                });
                resolve();
            }, 300);
        });
    }
    await api.patch('/alerts/resolve-all');
};

export const getUnresolvedCount = async (): Promise<number> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const count = mockAlerts.filter(a => !a.resolved).length;
                resolve(count);
            }, 300);
        });
    }
    const response = await api.get('/alerts/unresolved/count');
    return response.data.count;
};
