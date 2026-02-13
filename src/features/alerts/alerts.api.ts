import api from '@/services/api';
import type { Alert } from '@/types';

/**
 * List alerts (role-scoped)
 */
export const getAlerts = async (params?: {
    type?: 'idle' | 'overtime';
    resolved?: boolean;
}): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alerts', { params });
    return response.data;
};

/**
 * Resolve alert
 */
export const resolveAlert = async (alertId: string): Promise<void> => {
    await api.patch(`/alerts/${alertId}/resolve`);
};

/**
 * Resolve all alerts
 */
export const resolveAllAlerts = async (): Promise<void> => {
    // Note: Swagger doesn't have resolve-all. 
    // We could loop resolveAlert or keep this if backend extends it.
};

export const getUnresolvedCount = async (): Promise<number> => {
    const response = await api.get<Alert[]>('/alerts');
    return response.data.filter(a => !a.resolved_at).length;
};

