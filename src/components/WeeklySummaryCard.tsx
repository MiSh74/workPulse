import { Card, Typography, Row, Col, Statistic, Progress, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { WeeklyAttendance } from '@/types';

const { Text } = Typography;

interface WeeklySummaryCardProps {
    data?: WeeklyAttendance | null;
}

export const WeeklySummaryCard = ({ data }: WeeklySummaryCardProps) => {
    if (!data) return null;

    const targetHours = 40;
    const progress = Math.min(100, Math.round((data.total_hours / targetHours) * 100));

    return (
        <Card title="Weekly Insights" bordered={false} style={{ borderRadius: 12 }}>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic
                        title="Hours Fixed"
                        value={data.total_hours.toFixed(1)}
                        suffix="/ 40"
                        prefix={<ClockCircleOutlined />}
                    />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Absent Days"
                        value={data.absent_count}
                        valueStyle={{ color: data.absent_count > 0 ? '#ff4d4f' : 'inherit' }}
                        prefix={<CalendarOutlined />}
                    />
                </Col>
                <Col span={24}>
                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Weekly Target Progress</Text>
                            <Text strong>{progress}%</Text>
                        </div>
                        <Progress
                            percent={progress}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            showInfo={false}
                        />
                    </Space>
                </Col>
            </Row>

            <div style={{ marginTop: 24, padding: '12px', background: '#f0f9ff', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <ThunderboltOutlined style={{ color: '#0ea5e9', fontSize: 20 }} />
                <Text style={{ fontSize: 13, color: '#0369a1' }}>
                    {progress >= 80 ? "You're on track for your weekly goal!" : "Keep it up! A few more hours to hit your target."}
                </Text>
            </div>
        </Card>
    );
};
