import { Card, Progress, Space, Typography, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { formatDuration } from '@/utils/format';

const { Title, Text } = Typography;

interface ProductivityScoreProps {
    score: number; // 0-100
    active_seconds: number;
    idle_seconds: number;
    trend?: number; // percentage change from previous period
}

export const ProductivityScore = ({ score, active_seconds, idle_seconds, trend }: ProductivityScoreProps) => {
    const total_seconds = active_seconds + idle_seconds;

    // Determine color based on score
    const getColor = (score: number) => {
        if (score >= 80) return '#52c41a'; // green
        if (score >= 50) return '#faad14'; // yellow
        return '#ff4d4f'; // red
    };

    const color = getColor(score);

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ textAlign: 'center' }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Productivity Score
                    </Title>
                    <Progress
                        type="circle"
                        percent={score}
                        format={(percent) => (
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color }}>
                                    {percent?.toFixed(0)}
                                </div>
                                <div style={{ fontSize: 14, color: '#8c8c8c' }}>Score</div>
                            </div>
                        )}
                        strokeColor={color}
                        size={160}
                    />

                    {trend !== undefined && (
                        <div style={{ marginTop: 16 }}>
                            <Space>
                                {trend > 0 ? (
                                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                                ) : trend < 0 ? (
                                    <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                                ) : null}
                                <Text type={trend > 0 ? 'success' : trend < 0 ? 'danger' : 'secondary'}>
                                    {Math.abs(trend).toFixed(1)}% from yesterday
                                </Text>
                            </Space>
                        </div>
                    )}
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Card size="small" style={{ background: '#f0f9ff', border: '1px solid #bae7ff' }}>
                            <Statistic
                                title={<Text style={{ fontSize: 12 }}>Active Time</Text>}
                                value={formatDuration(active_seconds)}
                                valueStyle={{ fontSize: 16, color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}>
                            <Statistic
                                title={<Text style={{ fontSize: 12 }}>Idle Time</Text>}
                                value={formatDuration(idle_seconds)}
                                valueStyle={{ fontSize: 16, color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Total Time: {formatDuration(total_seconds)}
                    </Text>
                </div>
            </Space>
        </Card>
    );
};
