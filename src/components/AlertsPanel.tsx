import { Card, List, Button, Tag, Space, Typography, Empty } from 'antd';
import { CheckCircleOutlined, WarningOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '@/utils/format';
import { getAlerts, resolveAlert } from '@/features/alerts/alerts.api';
import type { Alert } from '@/types';

const { Text, Title } = Typography;

interface AlertsPanelProps {
    maxDisplay?: number;
    showActions?: boolean;
}

export const AlertsPanel = ({ maxDisplay = 5, showActions = true }: AlertsPanelProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: alerts = [], isLoading } = useQuery<Alert[]>({
        queryKey: ['alerts', 'recent'],
        queryFn: () => getAlerts({ resolved: false }),
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const resolveMutation = useMutation({
        mutationFn: resolveAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        },
    });

    const getTypeIcon = (type: 'idle' | 'overtime') => {
        switch (type) {
            case 'overtime':
                return <WarningOutlined style={{ color: '#ff4d4f' }} />;
            case 'idle':
                return <FieldTimeOutlined style={{ color: '#faad14' }} />;
        }
    };

    const getTypeColor = (type: 'idle' | 'overtime') => {
        switch (type) {
            case 'idle':
                return 'orange';
            case 'overtime':
                return 'red';
        }
    };

    const unresolvedAlerts = alerts.filter((a) => !a.resolved_at).slice(0, maxDisplay);

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5} style={{ margin: 0 }}>
                        Recent Alerts
                    </Title>
                    <Button type="link" size="small" onClick={() => navigate('/alerts')}>
                        View All
                    </Button>
                </div>

                {unresolvedAlerts.length === 0 ? (
                    <Empty
                        description="No active alerts"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '20px 0' }}
                    />
                ) : (
                    <List
                        dataSource={unresolvedAlerts}
                        loading={isLoading}
                        renderItem={(alert: Alert) => (
                            <List.Item
                                actions={
                                    showActions
                                        ? [
                                            <Button
                                                key="resolve"
                                                type="link"
                                                size="small"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => resolveMutation.mutate(alert.id)}
                                                loading={resolveMutation.isPending}
                                            >
                                                Resolve
                                            </Button>,
                                        ]
                                        : undefined
                                }
                            >
                                <List.Item.Meta
                                    avatar={getTypeIcon(alert.type as any)}
                                    title={
                                        <Space>
                                            <Tag color={getTypeColor(alert.type as any)}>
                                                {alert.type.toUpperCase()}
                                            </Tag>
                                            {alert.userName && <Text strong>{alert.userName}</Text>}
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size={0}>
                                            <Text>{alert.message}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {formatDateTime(alert.created_at)}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Space>
        </Card>
    );
};
