import { Row, Col, Card, Typography, Table, Statistic, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
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
import api from '@/services/api';
import type { Session, User, UserComparisonData, ProductivityChartData } from '@/types';

const { Title } = Typography;

export const AdminDashboard = () => {
    // Fetch all active sessions
    const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
        queryKey: ['sessions', 'active'],
        queryFn: async () => {
            const response = await api.get('/sessions?status=active');
            return response.data;
        },
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    // Fetch all users
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        },
    });

    // Fetch productivity data
    const { data: productivityData = [], isLoading: productivityLoading } = useQuery<UserComparisonData[]>({
        queryKey: ['productivity', 'overview'],
        queryFn: async () => {
            const response = await api.get('/reports/productivity-overview');
            return response.data;
        },
    });

    // Fetch daily summary
    const { data: dailyData = [], isLoading: dailyLoading } = useQuery<ProductivityChartData[]>({
        queryKey: ['reports', 'daily'],
        queryFn: async () => {
            const response = await api.get('/reports/daily-summary');
            return response.data;
        },
    });

    // Calculate org metrics
    const totalActiveTime = productivityData.reduce((sum, u) => sum + u.activeTime, 0);
    const totalIdleTime = productivityData.reduce((sum, u) => sum + u.idleTime, 0);
    const avgProductivity =
        productivityData.length > 0
            ? productivityData.reduce((sum, u) => sum + u.productivity, 0) / productivityData.length
            : 0;

    const handleExportSessions = () => {
        const exportData = activeSessions.map((s) => ({
            User: s.userName,
            Project: s.projectName,
            'Start Time': formatDateTime(s.startTime),
            'Active Time': formatDuration(s.activeTime),
            'Idle Time': formatDuration(s.idleTime),
            Status: s.status,
        }));
        exportToCSV(exportData, 'active-sessions');
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Project',
            dataIndex: 'projectName',
            key: 'projectName',
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (time: string) => formatDateTime(time),
        },
        {
            title: 'Active Time',
            dataIndex: 'activeTime',
            key: 'activeTime',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: Session, b: Session) => a.activeTime - b.activeTime,
        },
        {
            title: 'Idle Time',
            dataIndex: 'idleTime',
            key: 'idleTime',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: Session, b: Session) => a.idleTime - b.idleTime,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'idle' | 'stopped') => <StatusBadge status={status} />,
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Idle', value: 'idle' },
                { text: 'Stopped', value: 'stopped' },
            ],
            onFilter: (value: unknown, record: Session) => record.status === value,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Admin Dashboard
                </Title>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <RealtimeCounter />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Active Sessions" value={activeSessions.length} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Users" value={users.length} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Avg Productivity"
                            value={avgProductivity.toFixed(1)}
                            suffix="%"
                            valueStyle={{ color: avgProductivity >= 70 ? '#52c41a' : '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={8}>
                    <OnlineUsersPanel maxDisplay={8} />
                </Col>
                <Col xs={24} lg={16}>
                    <AlertsPanel maxDisplay={6} />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Organization Active vs Idle Time">
                        {productivityLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <ProductivityBarChart data={productivityData} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Daily Productivity Trend">
                        {dailyLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <ProductivityLineChart data={dailyData} />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Time Distribution">
                        <ProductivityPieChart activeTime={totalActiveTime} idleTime={totalIdleTime} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="User Performance Comparison">
                        {productivityLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <Table
                                dataSource={productivityData}
                                rowKey="userName"
                                pagination={{ pageSize: 5 }}
                                size="small"
                                columns={[
                                    { title: 'User', dataIndex: 'userName', key: 'userName' },
                                    {
                                        title: 'Productivity',
                                        dataIndex: 'productivity',
                                        key: 'productivity',
                                        render: (v: number) => `${v.toFixed(1)}%`,
                                        sorter: (a, b) => a.productivity - b.productivity,
                                    },
                                    {
                                        title: 'Active Time',
                                        dataIndex: 'activeTime',
                                        key: 'activeTime',
                                        render: (v: number) => formatDuration(v),
                                    },
                                ]}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            <Card
                title="Active Sessions"
                style={{ marginTop: 24 }}
                extra={
                    <Button icon={<DownloadOutlined />} onClick={handleExportSessions} disabled={activeSessions.length === 0}>
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
                />
            </Card>
        </div>
    );
};
