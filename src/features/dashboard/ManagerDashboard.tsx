import { Row, Col, Card, Typography, Table, Statistic } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { OnlineUsersPanel } from '@/components/OnlineUsersPanel';
import { AlertsPanel } from '@/components/AlertsPanel';
import { ProductivityBarChart } from '@/components/charts/ProductivityBarChart';
import { ProductivityLineChart } from '@/components/charts/ProductivityLineChart';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { formatDateTime, formatDuration } from '@/utils/format';
import api from '@/services/api';
import type { Session, UserComparisonData, ProductivityChartData } from '@/types';

const { Title } = Typography;

export const ManagerDashboard = () => {
    // Fetch team active sessions
    const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
        queryKey: ['sessions', 'team', 'active'],
        queryFn: async () => {
            const response = await api.get('/sessions/team?status=active');
            return response.data;
        },
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    // Fetch team productivity data
    const { data: productivityData = [], isLoading: productivityLoading } = useQuery<UserComparisonData[]>({
        queryKey: ['productivity', 'team'],
        queryFn: async () => {
            const response = await api.get('/reports/team/productivity-overview');
            return response.data;
        },
    });

    // Fetch team daily trends
    const { data: dailyData = [], isLoading: dailyLoading } = useQuery<ProductivityChartData[]>({
        queryKey: ['reports', 'team', 'daily'],
        queryFn: async () => {
            const response = await api.get('/reports/team/daily-summary');
            return response.data;
        },
    });

    // Calculate team metrics
    const totalTeamMembers = productivityData.length;
    const activeSessionsCount = activeSessions.length;
    const avgProductivity =
        productivityData.length > 0
            ? productivityData.reduce((sum, u) => sum + u.productivity, 0) / productivityData.length
            : 0;

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
        },
        {
            title: 'Idle Time',
            dataIndex: 'idleTime',
            key: 'idleTime',
            render: (seconds: number) => formatDuration(seconds),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'paused' | 'idle' | 'stopped') => <StatusBadge status={status} />,
        },
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                Team Dashboard
            </Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic title="Team Members" value={totalTeamMembers} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic title="Active Sessions" value={activeSessionsCount} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
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
                    <OnlineUsersPanel filterByRole="manager" maxDisplay={6} />
                </Col>
                <Col xs={24} lg={16}>
                    <AlertsPanel maxDisplay={5} />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Team Active vs Idle Time">
                        {productivityLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <ProductivityBarChart data={productivityData} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Team Productivity Trend">
                        {dailyLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <ProductivityLineChart data={dailyData} />
                        )}
                    </Card>
                </Col>
            </Row>

            <Card title="Team Active Sessions" style={{ marginTop: 24 }}>
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
