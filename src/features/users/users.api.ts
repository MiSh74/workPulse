import api from '@/services/api';
import { mockUsers } from '@/mocks/data';
import type { User } from '@/types';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

export const getUsers = async (): Promise<User[]> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockUsers), 300);
        });
    }
    const response = await api.get('/users');
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = mockUsers.findIndex(u => u.id === id);
                if (index !== -1) {
                    mockUsers.splice(index, 1);
                }
                resolve();
            }, 300);
        });
    }
    await api.delete(`/users/${id}`);
};
