import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

// Protected route wrapper
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};
