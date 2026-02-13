import { Layout, Dropdown, Avatar, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { websocketService } from '@/services/websocket';
import { ChangePasswordModal } from '@/features/auth/ChangePasswordModal';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

export const HeaderBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);

    const handleLogout = () => {
        websocketService.disconnect();
        logout();
        navigate('/login');
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: 'Change Password',
            onClick: () => setIsChangePasswordVisible(true),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => handleLogout(),
        },
    ];

    return (
        <>
            <Header
                style={{
                    background: '#fff',
                    padding: '0 32px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    height: 64,
                    position: 'sticky',
                    top: 0,
                    zIndex: 99,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                }}
            >
                <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 8,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Avatar
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: '#1677ff',
                                marginRight: 12,
                                boxShadow: '0 2px 4px rgba(22, 119, 255, 0.2)'
                            }}
                            size="default"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            <Text strong style={{ fontSize: 13, lineHeight: 1.4, color: '#1e293b' }}>
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 11,
                                    lineHeight: 1,
                                    textTransform: 'capitalize',
                                    color: '#64748b'
                                }}
                            >
                                {user?.role}
                            </Text>
                        </div>
                    </div>
                </Dropdown>
            </Header>
            <ChangePasswordModal
                open={isChangePasswordVisible}
                onCancel={() => setIsChangePasswordVisible(false)}
            />
        </>
    );
};
