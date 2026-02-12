import { Card, List, Button, Tag, Space, Typography, Empty } from 'antd';
import { CheckCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '@/utils/format';
import api from '@/services/api';
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
        queryFn: async () => {
            const response = await api.get('/alerts?limit=' + maxDisplay);
            return response.data;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const resolveMutation = useMutation({
        mutationFn: async (alertId: string) => {
            await api.patch(`/alerts/${alertId}/resolve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        },
    });

    const getSeverityIcon = (severity: 'info' | 'warning' | 'error') => {
        switch (severity) {
            case 'error':
                return <WarningOutlined style={{ color: '#ff4d4f' }} />;
            case 'warning':
                return <WarningOutlined style={{ color: '#faad14' }} />;
            case 'info':
                return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
        }
    };

    const getTypeColor = (type: 'inactive' | 'overtime' | 'system') => {
        switch (type) {
            case 'inactive':
                return 'orange';
            case 'overtime':
                return 'red';
            case 'system':
                return 'blue';
        }
    };

    const unresolvedAlerts = alerts.filter((a) => !a.resolved);

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
                                    avatar={getSeverityIcon(alert.severity)}
                                    title={
                                        <Space>
                                            <Tag color={getTypeColor(alert.type)}>
                                                {alert.type.toUpperCase()}
                                            </Tag>
                                            {alert.userName && <Text strong>{alert.userName}</Text>}
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size={0}>
                                            <Text>{alert.message}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {formatDateTime(alert.timestamp)}
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
