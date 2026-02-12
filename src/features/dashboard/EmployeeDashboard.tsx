import { Row, Col, Card, Typography, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { SessionControl } from '@/features/sessions/SessionControl';
import { ProductivityScore } from '@/components/ProductivityScore';
import { ProductivityPieChart } from '@/components/charts/ProductivityPieChart';
import { ProductivityLineChart } from '@/components/charts/ProductivityLineChart';
import { AlertsPanel } from '@/components/AlertsPanel';
import { useAuthStore } from '@/store/auth.store';
import { formatDuration, formatDateTime } from '@/utils/format';
import api from '@/services/api';
import type { DailySummary, Session, ProductivityChartData } from '@/types';

const { Title } = Typography;

export const EmployeeDashboard = () => {
    const user = useAuthStore((state) => state.user);

    // Fetch today's summary
    const { data: dailySummary } = useQuery<DailySummary>({
        queryKey: ['dailySummary', user?.id],
        queryFn: async () => {
            const response = await api.get('/reports/my-daily-summary');
            return response.data;
        },
        enabled: !!user,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Fetch weekly productivity trend
    const { data: weeklyData = [] } = useQuery<ProductivityChartData[]>({
        queryKey: ['productivity', 'weekly', user?.id],
        queryFn: async () => {
            const response = await api.get('/reports/my-weekly-trend');
            return response.data;
        },
        enabled: !!user,
    });

    // Fetch session history
    const { data: sessionHistory = [], isLoading: historyLoading } = useQuery<Session[]>({
        queryKey: ['sessions', 'history', user?.id],
        queryFn: async () => {
            const response = await api.get('/sessions/my-history?limit=10');
            return response.data;
        },
        enabled: !!user,
    });

    const activeTime = dailySummary?.activeTime || 0;
    const idleTime = dailySummary?.idleTime || 0;
    const totalTime = activeTime + idleTime;
    const productivity = dailySummary?.productivity || 0;

    const columns = [
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
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (time?: string) => (time ? formatDateTime(time) : 'In Progress'),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (record: Session) => formatDuration(record.activeTime + record.idleTime),
        },
        {
            title: 'Active Time',
            dataIndex: 'activeTime',
            key: 'activeTime',
            render: (seconds: number) => formatDuration(seconds),
        },
        {
            title: 'Productivity',
            key: 'productivity',
            render: (record: Session) => {
                const total = record.activeTime + record.idleTime;
                const prod = total > 0 ? (record.activeTime / total) * 100 : 0;
                return `${prod.toFixed(1)}%`;
            },
        },
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                Welcome back, {user?.name}!
            </Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <SessionControl />
                </Col>

                <Col xs={24} lg={12}>
                    <ProductivityScore
                        score={productivity}
                        activeTime={activeTime}
                        idleTime={idleTime}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Your Alerts">
                        <AlertsPanel maxDisplay={5} showActions={false} />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Today's Time Distribution">
                        {totalTime > 0 ? (
                            <ProductivityPieChart activeTime={activeTime} idleTime={idleTime} height={250} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                                No activity today
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card title="Weekly Productivity Trend">
                        {weeklyData.length > 0 ? (
                            <ProductivityLineChart data={weeklyData} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                                No data available
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Sessions" style={{ marginTop: 24 }}>
                <Table
                    columns={columns}
                    dataSource={sessionHistory}
                    loading={historyLoading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'No sessions yet' }}
                />
            </Card>
        </div>
    );
};
