import {
    Card, Table, Tag, Typography, Space, Avatar, Button, Modal, Form, Input,
    Select, Tabs, Badge, Spin, Empty, Row, Col, Statistic, message, Tooltip
} from 'antd';
import {
    UserOutlined, TeamOutlined, PlusOutlined, DeleteOutlined,
    ProjectOutlined, ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getUsers } from '@/features/users/users.api';
import {
    getTeams, createTeam, getTeamMembers, addTeamMembers, removeTeamMember,
    getTeamProjects, createTeamProject, assignProjectToEmployee, getTeamLiveStatus,
    type Team, type TeamMemberStatus
} from './teams.api';
import { formatDuration } from '@/utils/format';
import type { User } from '@/types';

const { Title, Text } = Typography;

export const TeamPage = () => {
    const qc = useQueryClient();
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [addProjectOpen, setAddProjectOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState<{ projectId: string; projectName: string } | null>(null);
    const [memberForm] = Form.useForm();
    const [projectForm] = Form.useForm();
    const [assignForm] = Form.useForm();

    // --- Data Queries ---
    const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: getTeams,
    });

    // Auto-select first team when teams load
    useEffect(() => {
        if (!selectedTeam && teams.length > 0) setSelectedTeam(teams[0].id);
    }, [teams, selectedTeam]);

    const activeTeam = teams.find((t: Team) => t.id === selectedTeam) ?? teams[0] ?? null;

    const { data: members = [], isLoading: membersLoading } = useQuery<User[]>({
        queryKey: ['team-members', activeTeam?.id],
        queryFn: () => getTeamMembers(activeTeam!.id) as Promise<User[]>,
        enabled: !!activeTeam,
    });

    const { data: projects = [], isLoading: projectsLoading } = useQuery<any[]>({
        queryKey: ['team-projects', activeTeam?.id],
        queryFn: () => getTeamProjects(activeTeam!.id) as Promise<any[]>,
        enabled: !!activeTeam,
    });

    const { data: liveStatus = [], isLoading: liveLoading } = useQuery<TeamMemberStatus[]>({
        queryKey: ['team-live', activeTeam?.id],
        queryFn: () => getTeamLiveStatus(activeTeam!.id),
        enabled: !!activeTeam,
        refetchInterval: 15000, // Refresh every 15s
    });

    // All employees not yet on the team
    const { data: allEmployees = [] } = useQuery<User[]>({
        queryKey: ['users', 'all'],
        queryFn: () => getUsers() as Promise<User[]>,
        select: (data: User[]) => data.filter((u: User) => u.role === 'employee' && !members.find((m: User) => m.id === u.id)),
        enabled: addMemberOpen,
    });

    // --- Mutations ---
    const createTeamMut = useMutation({
        mutationFn: createTeam,
        onSuccess: (team) => { qc.invalidateQueries({ queryKey: ['teams'] }); setSelectedTeam(team.id); },
    });

    const addMembersMut = useMutation({
        mutationFn: ({ teamId, ids }: { teamId: string; ids: string[] }) => addTeamMembers(teamId, ids),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['team-members'] });
            setAddMemberOpen(false); memberForm.resetFields();
            message.success('Members added successfully');
        },
        onError: (e: any) => message.error(e?.response?.data?.message || 'Failed to add members'),
    });

    const removeMemberMut = useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => removeTeamMember(teamId, userId),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }); message.success('Member removed'); },
        onError: (e: any) => message.error(e?.response?.data?.message || 'Failed to remove member'),
    });

    const createProjectMut = useMutation({
        mutationFn: ({ teamId, data }: { teamId: string; data: any }) => createTeamProject(teamId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['team-projects'] });
            setAddProjectOpen(false); projectForm.resetFields();
            message.success('Project created');
        },
        onError: (e: any) => message.error(e?.response?.data?.message || 'Failed to create project'),
    });

    const assignProjectMut = useMutation({
        mutationFn: ({ teamId, projectId, userId }: any) => assignProjectToEmployee(teamId, projectId, userId),
        onSuccess: () => {
            setAssignOpen(null); assignForm.resetFields();
            message.success('Project assigned to employee');
        },
        onError: (e: any) => message.error(e?.response?.data?.message || 'Failed to assign'),
    });

    const onlineCount = liveStatus.filter(s => s.is_online).length;
    const workingCount = liveStatus.filter(s => s.active_session).length;

    // --- Members Tab ---
    const memberColumns = [
        {
            title: 'Member', key: 'member', render: (r: User) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ background: '#4f46e5' }} />
                    <div>
                        <Text strong>{r.first_name} {r.last_name}</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.email}</Text>
                    </div>
                </Space>
            )
        },
        { title: 'ID', dataIndex: 'employee_id', render: (id: string) => <Tag color="processing">{id}</Tag> },
        {
            title: 'Status', dataIndex: 'status', render: (s: string) =>
                <Tag color={s === 'active' ? 'success' : 'default'}>{s?.toUpperCase()}</Tag>
        },
        {
            title: 'Action', key: 'action', render: (r: User) => (
                <Tooltip title="Remove from team">
                    <Button
                        type="text" danger icon={<DeleteOutlined />} size="small"
                        onClick={() => Modal.confirm({
                            title: `Remove ${r.first_name} from team?`,
                            content: 'This will also remove their manager assignment.',
                            okType: 'danger',
                            onOk: () => removeMemberMut.mutate({ teamId: activeTeam!.id, userId: r.id }),
                        })}
                    />
                </Tooltip>
            )
        },
    ];

    // --- Projects Tab ---
    const projectColumns = [
        { title: 'Project Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
        { title: 'Description', dataIndex: 'description', key: 'desc', render: (d: string) => <Text type="secondary">{d || '—'}</Text> },
        {
            title: 'Actions', key: 'actions', render: (r: any) => (
                <Button
                    size="small" type="primary" ghost
                    onClick={() => setAssignOpen({ projectId: r.id, projectName: r.name })}
                >
                    Assign to Employee
                </Button>
            )
        },
    ];

    if (teamsLoading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 120 }} />;

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Team Management</Title>
                    <Text type="secondary">Manage your team, projects, and employee assignments.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => Modal.confirm({
                        title: 'Create New Team',
                        content: <Input id="new-team-name" placeholder="Team name" />,
                        onOk: () => {
                            const name = (document.getElementById('new-team-name') as HTMLInputElement)?.value;
                            if (name) createTeamMut.mutate({ name });
                        },
                    })}
                >
                    New Team
                </Button>
            </div>

            {teams.length === 0 ? (
                <Card>
                    <Empty description="No teams yet. Create your first team to get started." />
                </Card>
            ) : (
                <>
                    {/* Team Selector */}
                    {teams.length > 1 && (
                        <Select
                            value={selectedTeam}
                            onChange={setSelectedTeam}
                            style={{ width: 280 }}
                            size="large"
                            options={teams.map((t: Team) => ({ label: t.name, value: t.id }))}
                        />
                    )}

                    {/* Stats Row */}
                    <Row gutter={16}>
                        {[
                            { title: 'Team Members', value: members.length, icon: <TeamOutlined />, color: '#4f46e5' },
                            { title: 'Online Now', value: onlineCount, icon: <CheckCircleOutlined />, color: '#22c55e' },
                            { title: 'Working Now', value: workingCount, icon: <ThunderboltOutlined />, color: '#f59e0b' },
                            { title: 'Projects', value: projects.length, icon: <ProjectOutlined />, color: '#06b6d4' },
                        ].map(stat => (
                            <Col span={6} key={stat.title}>
                                <Card bordered={false} style={{ textAlign: 'center', borderRadius: 12 }}>
                                    <Statistic
                                        title={stat.title}
                                        value={stat.value}
                                        prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                                        valueStyle={{ color: stat.color }}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Main Tabs */}
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Tabs defaultActiveKey="members" items={[
                            {
                                key: 'members', label: <span><UserOutlined /> Members ({members.length})</span>,
                                children: (
                                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddMemberOpen(true)}>
                                                Add Members
                                            </Button>
                                        </div>
                                        <Table
                                            columns={memberColumns} dataSource={members}
                                            loading={membersLoading} rowKey="id" pagination={false}
                                        />
                                    </Space>
                                )
                            },
                            {
                                key: 'projects', label: <span><ProjectOutlined /> Projects ({projects.length})</span>,
                                children: (
                                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddProjectOpen(true)}>
                                                Create Project
                                            </Button>
                                        </div>
                                        <Table
                                            columns={projectColumns} dataSource={projects}
                                            loading={projectsLoading} rowKey="id" pagination={false}
                                        />
                                    </Space>
                                )
                            },
                            {
                                key: 'live', label: <span><ThunderboltOutlined /> Live Status</span>,
                                children: liveLoading ? <Spin /> : (
                                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                        {liveStatus.length === 0
                                            ? <Empty description="No members to monitor" />
                                            : liveStatus.map(s => (
                                                <Card key={s.user.id} size="small" style={{ borderRadius: 8, background: s.is_online ? '#f0fdf4' : '#fafafa' }}>
                                                    <Row align="middle" gutter={16}>
                                                        <Col>
                                                            <Badge status={s.is_online ? 'success' : 'default'} dot>
                                                                <Avatar icon={<UserOutlined />} style={{ background: s.is_online ? '#22c55e' : '#9ca3af' }} />
                                                            </Badge>
                                                        </Col>
                                                        <Col flex="1">
                                                            <Text strong>{s.user.first_name} {s.user.last_name}</Text>
                                                            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{s.user.email}</Text>
                                                        </Col>
                                                        <Col>
                                                            {s.active_session ? (
                                                                <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                                                                    <Tag color="green" icon={<ClockCircleOutlined />}>{s.active_session.project_name}</Tag>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                                        Active: {formatDuration(s.active_session.total_active_seconds)} | Idle: {formatDuration(s.active_session.total_idle_seconds)}
                                                                    </Text>
                                                                </Space>
                                                            ) : (
                                                                <Tag>{s.is_online ? 'Online / No Session' : 'Offline'}</Tag>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ))
                                        }
                                    </Space>
                                )
                            }
                        ]} />
                    </Card>
                </>
            )}

            {/* Add Members Modal */}
            <Modal title="Add Team Members" open={addMemberOpen} onCancel={() => setAddMemberOpen(false)}
                onOk={() => memberForm.submit()} confirmLoading={addMembersMut.isPending} destroyOnClose>
                <Form form={memberForm} layout="vertical" style={{ marginTop: 16 }}
                    onFinish={v => addMembersMut.mutate({ teamId: activeTeam!.id, ids: v.user_ids })}>
                    <Form.Item name="user_ids" label="Select Employees" rules={[{ required: true }]}>
                        <Select mode="multiple" placeholder="Search employees..." optionFilterProp="label"
                            options={allEmployees.map(e => ({
                                label: `${e.first_name} ${e.last_name} (${e.employee_id})`, value: e.id
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Project Modal */}
            <Modal title="Create Team Project" open={addProjectOpen} onCancel={() => setAddProjectOpen(false)}
                onOk={() => projectForm.submit()} confirmLoading={createProjectMut.isPending} destroyOnClose>
                <Form form={projectForm} layout="vertical" style={{ marginTop: 16 }}
                    onFinish={v => createProjectMut.mutate({ teamId: activeTeam!.id, data: v })}>
                    <Form.Item name="name" label="Project Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Website Redesign" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Project description..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Assign Project Modal */}
            <Modal title={`Assign: ${assignOpen?.projectName}`} open={!!assignOpen}
                onCancel={() => { setAssignOpen(null); assignForm.resetFields(); }}
                onOk={() => assignForm.submit()} confirmLoading={assignProjectMut.isPending} destroyOnClose>
                <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}
                    onFinish={v => assignProjectMut.mutate({ teamId: activeTeam!.id, projectId: assignOpen!.projectId, userId: v.user_id })}>
                    <Form.Item name="user_id" label="Assign to Employee" rules={[{ required: true }]}>
                        <Select placeholder="Select team member..."
                            options={members.map(m => ({
                                label: `${m.first_name} ${m.last_name} (${m.employee_id})`, value: m.id
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};
