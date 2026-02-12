import { Card, List, Badge, Avatar, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { usePresenceStore } from '@/store/presence.store';
import { useAuthStore } from '@/store/auth.store';
import { formatLastSeen } from '@/utils/format';
import type { OnlineUser } from '@/types';

const { Text, Title } = Typography;

interface OnlineUsersPanelProps {
    maxDisplay?: number;
    filterByRole?: 'admin' | 'manager' | 'employee';
}

export const OnlineUsersPanel = ({ maxDisplay = 10, filterByRole }: OnlineUsersPanelProps) => {
    const { onlineUsers, onlineUserCount } = usePresenceStore();
    const user = useAuthStore((state) => state.user);

    // Filter users based on role if needed
    let displayUsers = onlineUsers;
    if (filterByRole === 'manager') {
        // TODO: In real app, filter by team membership
        // For now, show all except admins
        displayUsers = onlineUsers.filter((u) => u.role !== 'admin');
    }

    // Limit displayed users
    const limitedUsers = displayUsers.slice(0, maxDisplay);

    const getStatusColor = (status: 'active' | 'idle' | 'offline') => {
        switch (status) {
            case 'active':
                return '#52c41a'; // green
            case 'idle':
                return '#faad14'; // yellow
            case 'offline':
                return '#d9d9d9'; // gray
        }
    };

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5} style={{ margin: 0 }}>
                        Online Users
                    </Title>
                    <Badge count={onlineUserCount} style={{ backgroundColor: '#52c41a' }} />
                </div>

                <List
                    dataSource={limitedUsers}
                    locale={{ emptyText: 'No users online' }}
                    renderItem={(onlineUser: OnlineUser) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Badge dot color={getStatusColor(onlineUser.status)} offset={[-5, 35]}>
                                        <Avatar icon={<UserOutlined />} />
                                    </Badge>
                                }
                                title={
                                    <Space>
                                        <Text strong>{onlineUser.name}</Text>
                                        {onlineUser.id === user?.id && (
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                (You)
                                            </Text>
                                        )}
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {onlineUser.role.charAt(0).toUpperCase() + onlineUser.role.slice(1)}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {formatLastSeen(onlineUser.lastSeen)}
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />

                {displayUsers.length > maxDisplay && (
                    <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                        +{displayUsers.length - maxDisplay} more
                    </Text>
                )}
            </Space>
        </Card>
    );
};
