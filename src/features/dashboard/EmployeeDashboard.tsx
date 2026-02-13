import { Row, Col, Typography, Card, Segmented, Space } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarOutlined, LayoutOutlined } from '@ant-design/icons';
import { SessionControl } from '@/features/sessions/SessionControl';
import { ProductivityScore } from '@/components/ProductivityScore';
import { ProductivityPieChart } from '@/components/charts/ProductivityPieChart';
import { AlertsPanel } from '@/components/AlertsPanel';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { MidnightSummaryCard } from '@/components/MidnightSummaryCard';
import { WeeklySummaryCard } from '@/components/WeeklySummaryCard';
import { useAuthStore } from '@/store/auth.store';
import { getDailySummary, getWeeklyAttendance } from '@/features/sessions/sessions.api';
import type { DailySummary, WeeklyAttendance } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const EmployeeDashboard = () => {
    const user = useAuthStore((state) => state.user);
    const [viewMode, setViewMode] = useState<'overview' | 'attendance'>('overview');

    // Fetch today's summary
    const { data: dailySummary } = useQuery<DailySummary>({
        queryKey: ['dailySummary', user?.id],
        queryFn: () => getDailySummary(dayjs().format('YYYY-MM-DD')),
        enabled: !!user,
        refetchInterval: 30000,
    });

    // Fetch weekly attendance
    const { data: weeklyAttendance } = useQuery<WeeklyAttendance>({
        queryKey: ['attendance', 'weekly', user?.id],
        queryFn: getWeeklyAttendance,
        enabled: !!user,
    });

    const activeTime = dailySummary?.total_active_seconds || 0;
    const idleTime = dailySummary?.total_idle_seconds || 0;
    const totalTime = activeTime + idleTime;
    const productivity = totalTime > 0 ? (activeTime / totalTime) * 100 : 0;

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                        Welcome back, {user?.first_name}!
                    </Title>
                    <Text type="secondary">Here's what's happening with your productivity today.</Text>
                </div>
                <Segmented
                    options={[
                        { label: 'Overview', value: 'overview', icon: <LayoutOutlined /> },
                        { label: 'Attendance', value: 'attendance', icon: <CalendarOutlined /> },
                    ]}
                    value={viewMode}
                    onChange={(val) => setViewMode(val as any)}
                    size="large"
                />
            </div>

            {viewMode === 'overview' ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <SessionControl />
                            <ProductivityScore
                                score={productivity}
                                active_seconds={activeTime}
                                idle_seconds={idleTime}
                            />
                            <WeeklySummaryCard data={weeklyAttendance} />
                        </Space>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <Card title="Today's Time Distribution" bordered={false} style={{ borderRadius: 12 }}>
                                {totalTime > 0 ? (
                                    <ProductivityPieChart active_seconds={activeTime} idle_seconds={idleTime} height={300} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                                        <div style={{ fontSize: 40, marginBottom: 16 }}>☕</div>
                                        <Text type="secondary">No active sessions yet. Start a project to see distribution.</Text>
                                    </div>
                                )}
                            </Card>
                            <Card title="Recent Alerts" bordered={false} style={{ borderRadius: 12 }}>
                                <AlertsPanel maxDisplay={3} showActions={false} />
                            </Card>
                        </Space>
                    </Col>

                    <Col xs={24} lg={6}>
                        <MidnightSummaryCard summary={dailySummary ? { ...dailySummary, generated_at: new Date().toISOString(), organization_id: user?.organization_id || '' } : null} />
                    </Col>
                </Row>
            ) : (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <AttendanceCalendar days={weeklyAttendance?.days || []} />
                    </Col>
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size={24} style={{ width: '100%' }}>
                            <WeeklySummaryCard data={weeklyAttendance} />
                            <Card title="Attendance Insights" bordered={false} style={{ borderRadius: 12 }}>
                                <Text type="secondary">Your attendance is calculated based on session logs and system activity.</Text>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            )}
        </div>
    );
};
