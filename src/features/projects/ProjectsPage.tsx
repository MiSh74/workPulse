import { Card, Table, Button, Form, Input, Modal, message, Typography, Select, Tag, Space } from 'antd';
import { PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/utils/format';
import { getProjects, createProject, deleteProject, assignManagerToProject, assignTeamMembersToProject } from './projects.api';
import { mockUsers } from '@/mocks/data';
import { useAuth } from '@/hooks/useAuth';
import type { Project } from '@/types';

const { Title } = Typography;

export const ProjectsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [form] = Form.useForm();
    const [managerForm] = Form.useForm();
    const [teamForm] = Form.useForm();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ['projects', user?.id, user?.role],
        queryFn: () => getProjects(user?.id, user?.role),
    });

    const createMutation = useMutation({
        mutationFn: (values: { name: string; description: string; managerId?: string }) => {
            if (!user) throw new Error('User not authenticated');
            return createProject(
                {
                    name: values.name,
                    description: values.description,
                    createdBy: user.id,
                    createdByName: user.name,
                    managerId: values.managerId,
                    managerName: values.managerId ? mockUsers.find(u => u.id === values.managerId)?.name : undefined,
                },
                user.id,
                user.name,
                user.role as 'admin' | 'manager'
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            message.success('Project created successfully');
            setIsCreateModalOpen(false);
            form.resetFields();
        },
        onError: () => {
            message.error('Failed to create project');
        },
    });

    const assignManagerMutation = useMutation({
        mutationFn: ({ projectId, managerId }: { projectId: string; managerId: string }) =>
            assignManagerToProject(projectId, managerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            message.success('Manager assigned successfully');
            setIsManagerModalOpen(false);
            managerForm.resetFields();
        },
        onError: () => {
            message.error('Failed to assign manager');
        },
    });

    const assignTeamMutation = useMutation({
        mutationFn: ({ projectId, memberIds }: { projectId: string; memberIds: string[] }) =>
            assignTeamMembersToProject(projectId, memberIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            message.success('Team members assigned successfully');
            setIsTeamModalOpen(false);
            teamForm.resetFields();
        },
        onError: () => {
            message.error('Failed to assign team members');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            message.success('Project deleted successfully');
        },
        onError: () => {
            message.error('Failed to delete project');
        },
    });

    // Get managers for dropdown (only for admin)
    const managers = mockUsers.filter(u => u.role === 'manager');

    // Get employees for team assignment (filter by manager if user is manager)
    const employees = user?.role === 'manager'
        ? mockUsers.filter(u => u.role === 'employee' && u.managerId === user.id)
        : mockUsers.filter(u => u.role === 'employee');

    const baseColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
    ];

    const adminColumns = [
        ...baseColumns,
        {
            title: 'Type',
            key: 'type',
            render: (record: Project) => (
                record.isSystemProject ? (
                    <Tag color="purple">System</Tag>
                ) : (
                    <Tag color="green">{record.projectType || 'Regular'}</Tag>
                )
            ),
        },
        {
            title: 'Created By',
            dataIndex: 'createdByName',
            key: 'createdByName',
        },
        {
            title: 'Manager',
            key: 'manager',
            render: (record: Project) => (
                record.isSystemProject ? (
                    <span style={{ color: '#999' }}>N/A</span>
                ) : (
                    <Space>
                        {record.managerName || 'Not assigned'}
                        <Button
                            size="small"
                            icon={<UserOutlined />}
                            onClick={() => {
                                setSelectedProject(record);
                                managerForm.setFieldsValue({ managerId: record.managerId });
                                setIsManagerModalOpen(true);
                            }}
                        >
                            Assign
                        </Button>
                    </Space>
                )
            ),
        },
        {
            title: 'Team Members',
            key: 'team',
            render: (record: Project) => (
                record.isSystemProject ? (
                    <Tag color="blue">All Employees</Tag>
                ) : (
                    <Space direction="vertical" size="small">
                        <div>
                            {record.teamMemberNames?.length ? (
                                record.teamMemberNames.map((name, idx) => (
                                    <Tag key={idx} color="blue">{name}</Tag>
                                ))
                            ) : (
                                <span style={{ color: '#999' }}>No members</span>
                            )}
                        </div>
                    </Space>
                )
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date),
        },
    ];

    const managerColumns = [
        ...baseColumns,
        {
            title: 'Type',
            key: 'type',
            render: (record: Project) => (
                record.isSystemProject ? (
                    <Tag color="purple">System</Tag>
                ) : (
                    <Tag color="green">{record.projectType || 'Regular'}</Tag>
                )
            ),
        },
        {
            title: 'Team Members',
            key: 'team',
            render: (record: Project) => (
                record.isSystemProject ? (
                    <Tag color="blue">All Employees</Tag>
                ) : (
                    <Space>
                        <div>
                            {record.teamMemberNames?.length ? (
                                record.teamMemberNames.map((name, idx) => (
                                    <Tag key={idx} color="blue">{name}</Tag>
                                ))
                            ) : (
                                <span style={{ color: '#999' }}>No members</span>
                            )}
                        </div>
                        <Button
                            size="small"
                            icon={<TeamOutlined />}
                            onClick={() => {
                                setSelectedProject(record);
                                teamForm.setFieldsValue({ memberIds: record.teamMembers || [] });
                                setIsTeamModalOpen(true);
                            }}
                        >
                            Manage
                        </Button>
                    </Space>
                )
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date),
        },
    ];

    const employeeColumns = [
        ...baseColumns,
        {
            title: 'Manager',
            dataIndex: 'managerName',
            key: 'managerName',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date),
        },
    ];

    const columns = user?.role === 'admin'
        ? adminColumns
        : user?.role === 'manager'
            ? managerColumns
            : employeeColumns;

    const canCreateProject = user?.role === 'admin' || user?.role === 'manager';

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>Projects</Title>
                    {canCreateProject && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Project
                        </Button>
                    )}
                </div>

                <Table
                    columns={columns}
                    dataSource={projects}
                    rowKey="id"
                    loading={isLoading}
                />
            </Card>

            {/* Create Project Modal */}
            <Modal
                title="Create New Project"
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => createMutation.mutate(values)}
                >
                    <Form.Item
                        name="name"
                        label="Project Name"
                        rules={[{ required: true, message: 'Please enter project name' }]}
                    >
                        <Input placeholder="Enter project name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea placeholder="Enter project description" rows={3} />
                    </Form.Item>

                    {user?.role === 'admin' && (
                        <Form.Item
                            name="managerId"
                            label="Assign Manager"
                        >
                            <Select placeholder="Select a manager" allowClear>
                                {managers.map(manager => (
                                    <Select.Option key={manager.id} value={manager.id}>
                                        {manager.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {/* Assign Manager Modal (Admin only) */}
            <Modal
                title="Assign Manager"
                open={isManagerModalOpen}
                onCancel={() => {
                    setIsManagerModalOpen(false);
                    managerForm.resetFields();
                }}
                onOk={() => managerForm.submit()}
            >
                <Form
                    form={managerForm}
                    layout="vertical"
                    onFinish={(values) => {
                        if (selectedProject) {
                            assignManagerMutation.mutate({
                                projectId: selectedProject.id,
                                managerId: values.managerId,
                            });
                        }
                    }}
                >
                    <Form.Item
                        name="managerId"
                        label="Manager"
                        rules={[{ required: true, message: 'Please select a manager' }]}
                    >
                        <Select placeholder="Select a manager">
                            {managers.map(manager => (
                                <Select.Option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Assign Team Members Modal (Manager) */}
            <Modal
                title="Manage Team Members"
                open={isTeamModalOpen}
                onCancel={() => {
                    setIsTeamModalOpen(false);
                    teamForm.resetFields();
                }}
                onOk={() => teamForm.submit()}
            >
                <Form
                    form={teamForm}
                    layout="vertical"
                    onFinish={(values) => {
                        if (selectedProject) {
                            assignTeamMutation.mutate({
                                projectId: selectedProject.id,
                                memberIds: values.memberIds || [],
                            });
                        }
                    }}
                >
                    <Form.Item
                        name="memberIds"
                        label="Team Members"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select team members"
                            allowClear
                        >
                            {employees.map(employee => (
                                <Select.Option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
