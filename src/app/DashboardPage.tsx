import { useAuthStore } from '@/store/auth.store';
import { AdminDashboard } from '@/features/dashboard/AdminDashboard';
import { ManagerDashboard } from '@/features/dashboard/ManagerDashboard';
import { EmployeeDashboard } from '@/features/dashboard/EmployeeDashboard';

export const DashboardPage = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) return null;

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'manager':
            return <ManagerDashboard />;
        case 'employee':
            return <EmployeeDashboard />;
        default:
            return <EmployeeDashboard />;
    }
};
