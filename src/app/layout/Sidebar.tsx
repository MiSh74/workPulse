import { Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ProjectOutlined,
    FileTextOutlined,
    UserOutlined,
    BellOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import type { MenuProps } from 'antd';

const { Text } = Typography;

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

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
        // Admin: manage all users; Manager/Admin: manage teams
        ...(isAdmin
            ? [{
                key: '/users',
                icon: <UserOutlined />,
                label: 'User Management',
            }]
            : []),
        ...(isAdmin || isManager
            ? [{
                key: '/teams',
                icon: <TeamOutlined />,
                label: 'My Team',
            }]
            : []),
        // Reports — all roles, scoped on backend
        {
            key: '/reports',
            icon: <FileTextOutlined />,
            label: 'Reports',
        },
        // Alerts — Admin and Manager only
        ...(isAdmin || isManager
            ? [{
                key: '/alerts',
                icon: <BellOutlined />,
                label: 'Alerts',
            }]
            : []),
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    borderBottom: '1px solid #f1f5f9',
                }}
            >
                <div style={{
                    width: 32,
                    height: 32,
                    background: '#1677ff',
                    borderRadius: 8,
                    marginRight: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 16
                }}>
                    W
                </div>
                <Text strong style={{ fontSize: 18, color: '#1e293b' }}>
                    WorkPulse
                </Text>
            </div>
            <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={items}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0 }}
                />
            </div>
        </div>
    );
};
