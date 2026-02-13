import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthRoute =
                window.location.pathname.includes('/login') ||
                window.location.pathname.includes('/register');

            // Only clear and redirect if not already on an auth page
            // and the request was NOT a login/register attempt itself
            const requestUrl = error.config?.url || '';
            const isAuthRequest =
                requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

            if (!isAuthRoute && !isAuthRequest) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
