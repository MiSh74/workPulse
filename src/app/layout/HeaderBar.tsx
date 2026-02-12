import { Layout, Dropdown, Avatar, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { websocketService } from '@/services/websocket';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

export const HeaderBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        websocketService.disconnect();
        logout();
        navigate('/login');
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    return (
        <Header
            style={{
                background: '#fff',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
            }}
        >
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: 8,
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Avatar
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: '#1890ff',
                            marginRight: 12
                        }}
                        size="large"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Text strong style={{ fontSize: 14, lineHeight: 1.2 }}>
                            {user?.name}
                        </Text>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 12,
                                lineHeight: 1.2,
                                textTransform: 'capitalize'
                            }}
                        >
                            {user?.role}
                        </Text>
                    </div>
                </div>
            </Dropdown>
        </Header>
    );
};
