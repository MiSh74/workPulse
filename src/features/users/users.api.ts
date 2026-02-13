import api from '@/services/api';
import type { User, CreateUserRequest, ResetPasswordRequest } from '@/types';

export const getUsers = async (filters?: { manager_id?: string }): Promise<User[]> => {
    const response = await api.get<User[]>('/users', { params: filters });
    return response.data;
};

export const getOnlineUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/online');
    return response.data;
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users/invite', userData);
    return response.data;
};

export const resetUserPassword = async (userId: string, data: ResetPasswordRequest): Promise<void> => {
    await api.put(`/auth/reset-password/${userId}`, data);
};

export const deleteUser = async (_id: string): Promise<void> => {
    // Spec doesn't have DELETE /users/{id}, but it does have GET /users/{id}
    // We'll leave this or map to a future endpoint.
    // await api.delete(`/users/${_id}`);
};

