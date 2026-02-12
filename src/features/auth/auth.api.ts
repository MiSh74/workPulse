import api from '@/services/api';
import type { LoginRequest, AuthResponse } from '@/types';

/**
 * Login user
 */
// export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
//     const response = await api.post<AuthResponse>('/auth/login', credentials);
//     return response.data;
// };

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                credentials.email === 'admin@example.com' && credentials.password === 'password'
                    ? {
                        user: {
                            id: '1',
                            email: credentials.email,
                            name: 'Admin User',
                            role: 'admin',
                            createdAt: new Date().toISOString(),
                        },
                        token: 'mock-token',
                    } :
                    credentials.email === 'manager@example.com' && credentials.password === 'password'
                        ? {
                            user: {
                                id: '2',
                                email: credentials.email,
                                name: 'Manager User',
                                role: 'manager',
                                createdAt: new Date().toISOString(),
                            },
                            token: 'mock-token',
                        } :
                        credentials.email === 'employee@example.com' && credentials.password === 'password'
                            ? {
                                user: {
                                    id: '3',
                                    email: credentials.email,
                                    name: 'Employee User',
                                    role: 'employee',
                                    createdAt: new Date().toISOString(),
                                },
                                token: 'mock-token',
                            } :
                            {
                                user: {
                                    id: '4',
                                    email: credentials.email,
                                    name: 'User',
                                    role: 'employee',
                                    createdAt: new Date().toISOString(),
                                },
                                token: 'mock-token',
                            }
            );
        }, 1000);
    });
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
    await api.post('/auth/logout');
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
