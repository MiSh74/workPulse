import { Card, Table, Button, Tag, message, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/utils/format';
import { getUsers, deleteUser } from './users.api';
import type { User } from '@/types';

const { Title } = Typography;

export const UsersPage = () => {
    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: getUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            message.success('User deleted successfully');
        },
        onError: () => {
            message.error('Failed to delete user');
        },
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: User) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteMutation.mutate(record.id)}
                    loading={deleteMutation.isPending}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                Users
            </Title>

            <Card>
                <Table columns={columns} dataSource={users} loading={isLoading} rowKey="id" />
            </Card>
        </div>
    );
};
