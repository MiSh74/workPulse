import { useState } from 'react';
import { Card, Table, Button, Select, Space, Typography, Tag, message, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, WarningOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { formatDateTime } from '@/utils/format';
import { getAlerts, resolveAlert, resolveAllAlerts } from './alerts.api';
import type { Alert } from '@/types';

const { Title } = Typography;

export const AlertsPage = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [typeFilter, setTypeFilter] = useState<'idle' | 'overtime' | undefined>();
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(false); // Default: show unresolved

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    // Fetch alerts
    const { data: alerts = [], isLoading } = useQuery<Alert[]>({
        queryKey: ['alerts', 'all', typeFilter, statusFilter],
        queryFn: () =>
            getAlerts({
                type: typeFilter,
                resolved: statusFilter,
            }),
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Resolve mutation
    const resolveMutation = useMutation({
        mutationFn: resolveAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            message.success('Alert resolved');
        },
        onError: () => {
            message.error('Failed to resolve alert');
        },
    });

    // Resolve all mutation
    const resolveAllMutation = useMutation({
        mutationFn: resolveAllAlerts,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            message.success('All alerts resolved');
        },
        onError: () => {
            message.error('Failed to resolve all alerts');
        },
    });

    // Calculate metrics
    const unresolvedCount = alerts.filter((a) => !a.resolved_at).length;
    const idleCount = alerts.filter((a) => a.type === 'idle' && !a.resolved_at).length;
    const overtimeCount = alerts.filter((a) => a.type === 'overtime' && !a.resolved_at).length;

    const getTypeIcon = (type: 'idle' | 'overtime') => {
        switch (type) {
            case 'overtime':
                return <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
            case 'idle':
                return <FieldTimeOutlined style={{ color: '#faad14', fontSize: 16 }} />;
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

    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (type: 'idle' | 'overtime') => (
                <Space>
                    {getTypeIcon(type)}
                    <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
                </Space>
            ),
        },
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            hidden: !isAdmin && !isManager,
            render: (name?: string) => name || 'System',
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
        },
        {
            title: 'Time',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (time: string) => formatDateTime(time),
            sorter: (a: Alert, b: Alert) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: 'Status',
            key: 'status',
            width: 120,
            render: (record: Alert) =>
                record.resolved_at ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                        Resolved
                    </Tag>
                ) : (
                    <Tag color="error">Active</Tag>
                ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            hidden: !isAdmin && !isManager,
            render: (record: Alert) =>
                !record.resolved_at ? (
                    <Button
                        type="link"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => resolveMutation.mutate(record.id)}
                        loading={resolveMutation.isPending}
                    >
                        Resolve
                    </Button>
                ) : null,
        },
    ].filter((col) => !col.hidden);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Alerts
                </Title>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['alerts'] })}
                    >
                        Refresh
                    </Button>
                    {(isAdmin || isManager) && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => resolveAllMutation.mutate()}
                            loading={resolveAllMutation.isPending}
                            disabled={unresolvedCount === 0}
                        >
                            Resolve All
                        </Button>
                    )}
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Active Alerts"
                            value={unresolvedCount}
                            valueStyle={{ color: unresolvedCount > 0 ? '#ff4d4f' : '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Idle Warnings"
                            value={idleCount}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Overtime Alerts"
                            value={overtimeCount}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Space wrap>
                    <Select
                        placeholder="Filter by Type"
                        style={{ width: 150 }}
                        allowClear
                        onChange={setTypeFilter}
                        options={[
                            { label: 'All Types', value: undefined },
                            { label: 'Idle', value: 'idle' },
                            { label: 'Overtime', value: 'overtime' },
                        ]}
                    />

                    <Select
                        placeholder="Filter by Status"
                        style={{ width: 150 }}
                        value={statusFilter === undefined ? 'all' : statusFilter ? 'resolved' : 'active'}
                        onChange={(value) => {
                            if (value === 'all') setStatusFilter(undefined);
                            else setStatusFilter(value === 'resolved');
                        }}
                        options={[
                            { label: 'All Statuses', value: 'all' },
                            { label: 'Active', value: 'active' },
                            { label: 'Resolved', value: 'resolved' },
                        ]}
                    />
                </Space>
            </Card>

            {/* Alerts Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={alerts}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    locale={{ emptyText: 'No alerts found' }}
                />
            </Card>
        </div>
    );
};
