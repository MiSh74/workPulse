import { Card, Table, Button, Tag, message, Typography, Modal, Form, Input, Select, Space, Tooltip, Row, Col } from 'antd';
import { DeleteOutlined, UserAddOutlined, CopyOutlined, ReloadOutlined, KeyOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate } from '@/utils/format';
import { getUsers, deleteUser, createUser, resetUserPassword } from './users.api';
import { useAuthStore } from '@/store/auth.store';
import type { User, CreateUserRequest, ResetPasswordRequest } from '@/types';

const { Option } = Select;

export const UsersPage = () => {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [form] = Form.useForm();
    const [resetForm] = Form.useForm();

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['users', currentUser?.id, currentUser?.role],
        queryFn: () => getUsers(currentUser?.role === 'manager' ? { manager_id: currentUser.id } : undefined),
    });

    const generateRandomPassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0, n = charset.length; i < 12; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setGeneratedPassword(retVal);
        form.setFieldsValue({ password: retVal });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Password copied to clipboard');
    };

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            message.success('User created successfully');
            setIsModalVisible(false);
            form.resetFields();
            setGeneratedPassword('');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to create user');
        },
    });

    const resetMutation = useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: ResetPasswordRequest }) => resetUserPassword(userId, data),
        onSuccess: () => {
            message.success('Password reset successfully');
            setIsResetModalVisible(false);
            resetForm.resetFields();
            setSelectedUser(null);
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to reset password');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            message.success('User deleted successfully');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to delete user');
        },
    });

    const canManageUser = (targetRole: User['role']) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') {
            return targetRole === 'manager' || targetRole === 'employee';
        }
        return false;
    };

    const columns = [
        {
            title: 'Employee ID',
            dataIndex: 'employee_id',
            key: 'employee_id',
            render: (id?: string) => id ? <Tag color="processing" style={{ borderRadius: 4 }}>{id}</Tag> : <Typography.Text type="secondary">-</Typography.Text>,
        },
        {
            title: 'Name',
            key: 'name',
            render: (record: User) => <Typography.Text strong>{`${record.first_name} ${record.last_name}`}</Typography.Text>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => <Typography.Text type="secondary">{text}</Typography.Text>
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
                return <Tag color={colors[role]} style={{ borderRadius: 4 }}>{role.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={status === 'active' ? 'success' : 'default'} style={{ borderRadius: 4 }}>{status.toUpperCase()}</Tag>,
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => <Typography.Text type="secondary" style={{ fontSize: 13 }}>{formatDate(date)}</Typography.Text>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: User) => (
                <Space size="middle">
                    {canManageUser(record.role) && (
                        <>
                            <Tooltip title="Reset Password">
                                <Button
                                    type="text"
                                    icon={<KeyOutlined />}
                                    style={{ color: '#64748b' }}
                                    onClick={() => {
                                        setSelectedUser(record);
                                        setIsResetModalVisible(true);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="Delete User">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteMutation.mutate(record.id)}
                                    loading={deleteMutation.isPending}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const showModal = () => {
        setIsModalVisible(true);
        generateRandomPassword();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setGeneratedPassword('');
    };

    const onFinish = (values: any) => {
        const payload: CreateUserRequest = {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            role: values.role,
            employee_id: values.employee_id,
        };
        createMutation.mutate(payload);
    };

    const onResetFinish = (values: any) => {
        if (selectedUser) {
            resetMutation.mutate({
                userId: selectedUser.id,
                data: {
                    new_password: values.new_password,
                    confirm_password: values.confirm_password
                },
            });
        }
    };

    const getAvailableRoles = () => {
        if (currentUser?.role === 'admin') {
            return [
                { value: 'manager', label: 'Manager' },
                { value: 'employee', label: 'Employee' },
            ];
        }
        return [];
    };

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Typography.Title level={4} style={{ marginBottom: 4, fontWeight: 700 }}>
                        User Management
                    </Typography.Title>
                    <Typography.Text type="secondary">Manage your organization's members and their access roles.</Typography.Text>
                </div>
                {currentUser?.role === 'admin' && (
                    <Button type="primary" icon={<UserAddOutlined />} onClick={showModal} size="large">
                        Add New User
                    </Button>
                )}
            </div>

            <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{ pageSize: 12 }}
                    size="middle"
                />
            </Card>

            <Modal
                title="Add New User"
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                width={550}
                centered
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="first_name"
                                label="First Name"
                                rules={[{ required: true, message: 'First name is required' }]}
                            >
                                <Input placeholder="e.g. John" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="last_name"
                                label="Last Name"
                                rules={[{ required: true, message: 'Last name is required' }]}
                            >
                                <Input placeholder="e.g. Doe" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input placeholder="john.doe@example.com" />
                    </Form.Item>
                    <Form.Item
                        name="employee_id"
                        label="Employee ID"
                        rules={[{ required: true, message: 'Employee ID is required' }]}
                    >
                        <Input placeholder="e.g. EMP001" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Application Role"
                        rules={[{ required: true, message: 'Please select a role!' }]}
                    >
                        <Select placeholder="Select a role">
                            {getAvailableRoles().map((role) => (
                                <Option key={role.value} value={role.value}>
                                    {role.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Access Password"
                        rules={[{ required: true, message: 'Password is required' }]}
                    >
                        <Input.Group compact>
                            <Input
                                style={{ width: 'calc(100% - 92px)' }}
                                value={generatedPassword}
                                onChange={(e) => setGeneratedPassword(e.target.value)}
                            />
                            <Tooltip title="Regenerate">
                                <Button icon={<ReloadOutlined />} onClick={generateRandomPassword} />
                            </Tooltip>
                            <Tooltip title="Copy">
                                <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(generatedPassword)} />
                            </Tooltip>
                        </Input.Group>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`Reset Password for ${selectedUser?.first_name} ${selectedUser?.last_name}`}
                open={isResetModalVisible}
                onCancel={() => {
                    setIsResetModalVisible(false);
                    resetForm.resetFields();
                    setSelectedUser(null);
                }}
                onOk={() => resetForm.submit()}
                confirmLoading={resetMutation.isPending}
                destroyOnClose
                centered
            >
                <Form form={resetForm} layout="vertical" onFinish={onResetFinish} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="new_password"
                        label="New Password"
                        rules={[
                            { required: true, message: 'Please input the new password!' },
                            { min: 8, message: 'Password must be at least 8 characters!' },
                        ]}
                    >
                        <Input.Password placeholder="Enter new password" />
                    </Form.Item>
                    <Form.Item
                        name="confirm_password"
                        label="Confirm New Password"
                        dependencies={['new_password']}
                        rules={[
                            { required: true, message: 'Please confirm the new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm new password" />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};
