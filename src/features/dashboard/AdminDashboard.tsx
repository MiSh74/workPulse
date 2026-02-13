import { Row, Col, Card, Typography, Table, Statistic, Button, Space } from 'antd';
import { DownloadOutlined, ArrowUpOutlined, TeamOutlined, DesktopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { OnlineUsersPanel } from '@/components/OnlineUsersPanel';
import { AlertsPanel } from '@/components/AlertsPanel';
import { ProductivityBarChart } from '@/components/charts/ProductivityBarChart';
import { ProductivityLineChart } from '@/components/charts/ProductivityLineChart';
import { ProductivityPieChart } from '@/components/charts/ProductivityPieChart';
import { RealtimeCounter } from '@/components/RealtimeCounter';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { formatDateTime, formatDuration, exportToCSV } from '@/utils/format';
import { getActiveSessions } from '@/features/sessions/sessions.api';
import { getUsers } from '@/features/users/users.api';
import api from '@/services/api';
import type { WorkSession, User, UserComparisonData, ProductivityChartData } from '@/types';

const { Title, Text } = Typography;

export const AdminDashboard = () => {
    // Fetch all active sessions
    const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery<WorkSession[]>({
        queryKey: ['sessions', 'active'],
        queryFn: getActiveSessions,
        refetchInterval: 10000,
    });

    // Fetch all users
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => getUsers(),
    });

    // Fetch productivity data
    const { data: productivityData = [], isLoading: productivityLoading } = useQuery<UserComparisonData[]>({
        queryKey: ['productivity', 'overview'],
        queryFn: async () => {
            const response = await api.get('/reports/organization/analytics');
            return response.data.users || [];
        },
    });

    // Fetch daily summary
    const { data: dailyData = [], isLoading: dailyLoading } = useQuery<ProductivityChartData[]>({
        queryKey: ['reports', 'daily'],
        queryFn: async () => {
            const response = await api.get('/reports/daily');
            return response.data.history || [];
        },
    });

    const avgProductivity =
        productivityData.length > 0
            ? productivityData.reduce((sum, u) => sum + u.productivity, 0) / productivityData.length
            : 0;

    const totalActiveTime = productivityData.reduce((sum, u) => sum + u.total_active_seconds, 0);
    const totalIdleTime = productivityData.reduce((sum, u) => sum + u.total_idle_seconds, 0);

    const handleExportSessions = () => {
        const exportData = activeSessions.map((s) => ({
            User: s.userName,
            Project: s.projectName,
            'Start Time': formatDateTime(s.start_time),
            'Active Time': formatDuration(s.total_active_seconds),
            'Idle Time': formatDuration(s.total_idle_seconds),
            Status: s.status,
        }));
        exportToCSV(exportData, 'active-sessions');
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Project',
            dataIndex: 'projectName',
            key: 'projectName',
        },
        {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (time: string) => <Text type="secondary">{formatDateTime(time)}</Text>,
        },
        {
            title: 'Active Time',
            dataIndex: 'total_active_seconds',
            key: 'total_active_seconds',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: WorkSession, b: WorkSession) => a.total_active_seconds - b.total_active_seconds,
        },
        {
            title: 'Idle Time',
            dataIndex: 'total_idle_seconds',
            key: 'total_idle_seconds',
            render: (seconds: number) => <Text type="secondary">{formatDuration(seconds)}</Text>,
            sorter: (a: WorkSession, b: WorkSession) => a.total_idle_seconds - b.total_idle_seconds,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'paused' | 'stopped') => <StatusBadge status={status} />,
        },
    ];

    return (
        <Space direction="vertical" size={32} style={{ display: 'flex' }}>
            <div>
                <Title level={4} style={{ marginBottom: 4, fontWeight: 700 }}>
                    Overview
                </Title>
                <Text type="secondary">Monitor real-time productivity and workforce metrics.</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <RealtimeCounter />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <Statistic
                            title={<Space><DesktopOutlined /> <Text type="secondary">Active Sessions</Text></Space>}
                            value={activeSessions.length}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <Statistic
                            title={<Space><TeamOutlined /> <Text type="secondary">Total Users</Text></Space>}
                            value={users.length}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <Statistic
                            title={<Space><ArrowUpOutlined style={{ color: '#52c41a' }} /> <Text type="secondary">Productivity</Text></Space>}
                            value={avgProductivity.toFixed(1)}
                            suffix="%"
                            valueStyle={{ color: avgProductivity >= 70 ? '#52c41a' : '#faad14', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <OnlineUsersPanel maxDisplay={8} />
                </Col>
                <Col xs={24} lg={16}>
                    <AlertsPanel maxDisplay={6} />
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Active vs Idle Time"
                        bordered={false}
                        style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    >
                        {productivityLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <ProductivityBarChart data={productivityData} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="Daily Productivity Trend"
                        bordered={false}
                        style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    >
                        {dailyLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <ProductivityLineChart data={dailyData} />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={10}>
                    <Card
                        title="Time Distribution"
                        bordered={false}
                        style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    >
                        <ProductivityPieChart active_seconds={totalActiveTime} idle_seconds={totalIdleTime} />
                    </Card>
                </Col>
                <Col xs={24} lg={14}>
                    <Card
                        title="Top Performers"
                        bordered={false}
                        style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    >
                        {productivityLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <Table
                                dataSource={productivityData}
                                rowKey="userName"
                                pagination={{ pageSize: 5 }}
                                size="middle"
                                columns={[
                                    {
                                        title: 'User',
                                        dataIndex: 'userName',
                                        key: 'userName',
                                        render: (text: string) => <Text strong>{text}</Text>
                                    },
                                    {
                                        title: 'Productivity',
                                        dataIndex: 'productivity',
                                        key: 'productivity',
                                        render: (v: number) => (
                                            <Text style={{ color: v >= 70 ? '#52c41a' : '#faad14', fontWeight: 600 }}>
                                                {v.toFixed(1)}%
                                            </Text>
                                        ),
                                        sorter: (a, b) => a.productivity - b.productivity,
                                    },
                                    {
                                        title: 'Active Time',
                                        dataIndex: 'total_active_seconds',
                                        key: 'total_active_seconds',
                                        render: (v: number) => formatDuration(v),
                                    },
                                ]}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            <Card
                title="Active Tracker Sessions"
                bordered={false}
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                extra={
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportSessions}
                        disabled={activeSessions.length === 0}
                        type="default"
                    >
                        Export CSV
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={activeSessions}
                    loading={sessionsLoading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </Card>
        </Space>
    );
};
