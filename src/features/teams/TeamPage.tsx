import { Card, Table, Tag, Typography, Space, Avatar, Button, Drawer } from 'antd';
import { UserOutlined, TeamOutlined, HistoryOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getUsers } from '@/features/users/users.api';
import { getSessionHistory } from '@/features/sessions/sessions.api';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime, formatDuration } from '@/utils/format';
import type { User, WorkSession } from '@/types';

const { Title, Text } = Typography;

export const TeamPage = () => {
    const currentUser = useAuthStore((state) => state.user);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { data: teamMembers = [], isLoading } = useQuery<User[]>({
        queryKey: ['team', currentUser?.id],
        queryFn: () => getUsers(currentUser?.role === 'manager' ? { manager_id: currentUser.id } : undefined),
        enabled: !!currentUser,
    });

    const { data: sessionHistory = [], isLoading: isLoadingHistory } = useQuery<WorkSession[]>({
        queryKey: ['sessions', 'history', selectedUser?.id],
        queryFn: () => getSessionHistory({ user_id: selectedUser?.id }),
        enabled: !!selectedUser,
    });

    const handleViewLogs = (user: User) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    const columns = [
        {
            title: 'Member',
            key: 'member',
            render: (record: User) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <Text strong style={{ display: 'block' }}>{`${record.first_name} ${record.last_name}`}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Employee ID',
            dataIndex: 'employee_id',
            key: 'employee_id',
            render: (id?: string) => id ? <Tag color="blue">{id}</Tag> : '-',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const colors: Record<string, string> = {
                    admin: 'red',
                    manager: 'blue',
                    employee: 'green',
                };
                return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'paused' | 'idle' | 'stopped') => (
                <StatusBadge status={status} />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: User) => (
                <Button
                    type="link"
                    icon={<HistoryOutlined />}
                    onClick={() => handleViewLogs(record)}
                >
                    View Logs
                </Button>
            ),
        }
    ];

    const historyColumns = [
        {
            title: 'Project',
            dataIndex: 'projectName',
            key: 'projectName',
        },
        {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (time: string) => formatDateTime(time),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (record: WorkSession) => formatDuration(record.total_active_seconds || 0),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'paused' | 'stopped') => (
                <StatusBadge status={status} />
            ),
        }
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <TeamOutlined style={{ fontSize: 24, color: '#4f46e5' }} />
                <Title level={2} style={{ margin: 0 }}>
                    My Team
                </Title>
            </div>

            <Card
                title={`${teamMembers.length} Team Members`}
                extra={<Text type="secondary">Direct Reports</Text>}
            >
                <Table
                    columns={columns}
                    dataSource={teamMembers}
                    loading={isLoading}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            <Drawer
                title={`Session Logs: ${selectedUser?.first_name} ${selectedUser?.last_name}`}
                placement="right"
                width={640}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
            >
                <Table
                    columns={historyColumns}
                    dataSource={sessionHistory}
                    loading={isLoadingHistory}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Drawer>
        </Space>
    );
};
