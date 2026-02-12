import api from '@/services/api';
import { mockReports } from '@/mocks/data';
import type { Report, ReportFilters } from '@/types';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

export const getReports = async (filters?: ReportFilters): Promise<Report[]> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockReports];
                if (filters?.userId) {
                    filtered = filtered.filter(r => r.userId === filters.userId);
                }
                resolve(filtered);
            }, 300);
        });
    }

    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.projectId) params.append('projectId', filters.projectId);

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
};

export const getDailyReport = async (date?: string) => {
    const response = await api.get('/reports/daily', {
        params: { date: date || new Date().toISOString().split('T')[0] },
    });
    return response.data;
};

export const getUserReport = async (userId: string, filters?: ReportFilters) => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userReports = mockReports.filter(r => r.userId === userId);
                resolve(userReports);
            }, 300);
        });
    }

    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/reports/user/${userId}?${params.toString()}`);
    return response.data;
};

export const getProductivityOverview = async () => {
    const response = await api.get('/reports/productivity-overview');
    return response.data;
};

export const getDailySummary = async () => {
    const response = await api.get('/reports/daily-summary');
    return response.data;
};

export const getMyDailySummary = async () => {
    const response = await api.get('/reports/my-daily-summary');
    return response.data;
};
