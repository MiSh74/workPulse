import api from '@/services/api';
import type { DailySummary } from '@/types';

/**
 * Get daily summaries
 */
export const getDailyReport = async (date?: string): Promise<DailySummary> => {
    const response = await api.get<DailySummary>('/reports/daily', { params: { date } });
    return response.data;
};

/**
 * Organization-wide analytics (Admin only)
 */
export const getOrganizationAnalytics = async () => {
    const response = await api.get('/reports/organization/analytics');
    return response.data;
};

/**
 * Team analytics (Manager only)
 */
export const getTeamAnalytics = async () => {
    const response = await api.get('/reports/team/analytics');
    return response.data;
};

/**
 * Get general reports with filters
 */
export const getReports = async (filters: any): Promise<any[]> => {
    const response = await api.get('/reports', { params: filters });
    return response.data;
};

