import { Card, Table, Button, Form, Input, Modal, message, Typography, Select, Tag, Space } from 'antd';
import { PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/utils/format';
import { getProjects, createProject, deleteProject, assignManagerToProject, assignTeamMembersToProject } from './projects.api';
import { mockUsers } from '@/mocks/data';
import { useAuthStore } from '@/store/auth.store';
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
    const user = useAuthStore((state) => state.user);

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ['projects', user?.id, user?.role],
        queryFn: getProjects,
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: (values: { name: string; description: string; manager_id?: string }) => {
            if (!user) throw new Error('User not authenticated');
            return createProject({
                name: values.name,
                description: values.description,
                // created_by and other fields handled by API/Mock
            });
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
        mutationFn: ({ project_id, manager_id }: { project_id: string; manager_id: string }) =>
            assignManagerToProject(project_id, manager_id),
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
        mutationFn: ({ project_id, member_ids }: { project_id: string; member_ids: string[] }) =>
            assignTeamMembersToProject(project_id, member_ids),
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
        ? mockUsers.filter(u => u.role === 'employee' && u.manager_id === user.id)
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
                <Tag color={record.project_type === 'system' ? 'purple' : 'green'}>
                    {record.project_type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Project) => (
                <Space>
                    {record.project_type !== 'system' && (
                        <Button
                            size="small"
                            icon={<UserOutlined />}
                            onClick={() => {
                                setSelectedProject(record);
                                managerForm.setFieldsValue({ manager_id: (record as any).manager_id });
                                setIsManagerModalOpen(true);
                            }}
                        >
                            Assign Manager
                        </Button>
                    )}
                    <Button
                        size="small"
                        danger
                        onClick={() => deleteMutation.mutate(record.id)}
                        loading={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDateTime(date),
        },
    ];

    const managerColumns = [
        ...baseColumns,
        {
            title: 'Type',
            key: 'type',
            render: (record: Project) => (
                <Tag color={record.project_type === 'system' ? 'purple' : 'green'}>
                    {record.project_type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Team',
            key: 'team',
            render: (record: Project) => (
                record.project_type === 'system' ? (
                    <Tag color="blue">All Employees</Tag>
                ) : (
                    <Button
                        size="small"
                        icon={<TeamOutlined />}
                        onClick={() => {
                            setSelectedProject(record);
                            // We don't have team_members array in Project interface yet, mocking for now
                            setIsTeamModalOpen(true);
                        }}
                    >
                        Manage Team
                    </Button>
                )
            ),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDateTime(date),
        },
    ];

    const employeeColumns = [
        ...baseColumns,
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDateTime(date),
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
                                project_id: selectedProject.id,
                                manager_id: values.manager_id,
                            });
                        }
                    }}
                >
                    <Form.Item
                        name="manager_id"
                        label="Manager"
                        rules={[{ required: true, message: 'Please select a manager' }]}
                    >
                        <Select placeholder="Select a manager">
                            {managers.map(manager => (
                                <Select.Option key={manager.id} value={manager.id}>
                                    {manager.first_name} {manager.last_name}
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
                                project_id: selectedProject.id,
                                member_ids: values.member_ids || [],
                            });
                        }
                    }}
                >
                    <Form.Item
                        name="member_ids"
                        label="Team Members"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select team members"
                            allowClear
                        >
                            {employees.map(employee => (
                                <Select.Option key={employee.id} value={employee.id}>
                                    {employee.first_name} {employee.last_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
