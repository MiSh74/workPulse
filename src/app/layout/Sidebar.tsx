import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ProjectOutlined,
    FileTextOutlined,
    UserOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import type { MenuProps } from 'antd';

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const isEmployee = user?.role === 'employee';

    const items: MenuProps['items'] = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/projects',
            icon: <ProjectOutlined />,
            label: 'Projects',
        },
        // Reports - visible to all but Employee sees only personal
        ...(isAdmin || isManager || isEmployee
            ? [
                {
                    key: '/reports',
                    icon: <FileTextOutlined />,
                    label: 'Reports',
                },
            ]
            : []),
        // Users - Admin only
        ...(isAdmin
            ? [
                {
                    key: '/users',
                    icon: <UserOutlined />,
                    label: 'Users',
                },
            ]
            : []),
        // Alerts - visible to Admin, Manager, and Employee
        ...(isAdmin || isManager || isEmployee
            ? [
                {
                    key: '/alerts',
                    icon: <BellOutlined />,
                    label: 'Alerts',
                },
            ]
            : []),
    ];

    return (
        <div>
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                WorkPulse
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={items}
                onClick={({ key }) => navigate(key)}
                style={{ borderRight: 0 }}
            />
        </div>
    );
};
