import { Card, Typography, Space, Progress, List, Tag } from 'antd';
import { HistoryOutlined, ProjectOutlined } from '@ant-design/icons';
import { formatDuration } from '@/utils/format';
import type { MidnightSummary } from '@/types';

const { Text } = Typography;

interface MidnightSummaryCardProps {
    summary?: MidnightSummary | null;
}

export const MidnightSummaryCard = ({ summary }: MidnightSummaryCardProps) => {
    if (!summary) {
        return (
            <Card title="Midnight Summary" extra={<Tag color="orange">Pending</Tag>} bordered={false} style={{ borderRadius: 12 }}>
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <HistoryOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 12 }} />
                    <br />
                    <Text type="secondary">Generated every midnight to summarize your previous day's performance.</Text>
                </div>
            </Card>
        );
    }

    const totalTime = summary.total_active_seconds + summary.total_idle_seconds;
    const productivity = totalTime > 0 ? (summary.total_active_seconds / totalTime) * 100 : 0;

    return (
        <Card
            title={<><HistoryOutlined /> Midnight Summary</>}
            extra={<Text type="secondary">{summary.date}</Text>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
                <div style={{ textAlign: 'center' }}>
                    <Progress
                        type="dashboard"
                        percent={Math.round(productivity)}
                        strokeColor={productivity >= 75 ? '#52c41a' : '#faad14'}
                        format={(percent) => (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}%</span>
                                <span style={{ fontSize: 12 }}>Productive</span>
                            </div>
                        )}
                    />
                </div>

                <List
                    header={<Text strong><ProjectOutlined /> Project Distribution</Text>}
                    dataSource={summary.projects}
                    renderItem={p => (
                        <List.Item style={{ padding: '8px 0' }}>
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text>{p.project_name}</Text>
                                    <Text strong>{formatDuration(p.seconds)}</Text>
                                </div>
                                <Progress percent={Math.round((p.seconds / summary.total_active_seconds) * 100)} size="small" showInfo={false} />
                            </div>
                        </List.Item>
                    )}
                />
            </Space>
        </Card>
    );
};
