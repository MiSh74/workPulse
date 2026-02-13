import api from '@/services/api';
import type { LoginRequest, AuthResponse, RegisterRequest, ChangePasswordRequest } from '@/types';

/**
 * Login user
 */
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
    // const response = await api.post<AuthResponse>('/auth/login', credentials);
    // return response.data;

    // TEMPORARY: Since we don't have a real backend, we'll return a hardcoded response for verify
    // But as per instruction, we removed the mock data file logic.
    // If the user wants "production run", they likely have a backend or expect 404s/errors if not running.
    // However, looking at the code, it seems I should uncomment the real API call.

    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

/**
 * Register user (Admin)
 */
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
    // Note: swagger doesn't list /auth/logout, but typically good practice. 
    // We'll keep it as a no-op for now or remove if strictly following swagger.
    // await api.post('/auth/logout');
};

/**
 * Get current user
 * Note: Swagger doesn't explicitly list /auth/me, but lists /users/{id}
 */
export const getCurrentUser = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};
/**
 * Change password for current user
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/auth/password', data);
};

