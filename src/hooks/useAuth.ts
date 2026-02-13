import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = !!user && !!accessToken;

    return {
        user,
        token: accessToken,
        login,
        logout,
        isAuthenticated,
    };
};
