import { useState } from 'react';
import { Card, Table, Button, Select, Space, Typography, Tag, message, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { formatDateTime } from '@/utils/format';
import { getAlerts, resolveAlert, resolveAllAlerts } from './alerts.api';
import type { Alert } from '@/types';

const { Title } = Typography;

export const AlertsPage = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [typeFilter, setTypeFilter] = useState<string | undefined>();
    const [severityFilter, setSeverityFilter] = useState<string | undefined>();
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(false); // Default: show unresolved

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    // Fetch alerts
    const { data: alerts = [], isLoading } = useQuery<Alert[]>({
        queryKey: ['alerts', 'all', typeFilter, severityFilter, statusFilter],
        queryFn: () =>
            getAlerts({
                type: typeFilter,
                severity: severityFilter,
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
    const unresolvedCount = alerts.filter((a) => !a.resolved).length;
    const errorCount = alerts.filter((a) => a.severity === 'error' && !a.resolved).length;
    const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.resolved).length;

    const getSeverityIcon = (severity: 'info' | 'warning' | 'error') => {
        switch (severity) {
            case 'error':
                return <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
            case 'warning':
                return <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />;
            case 'info':
                return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />;
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

    const columns = [
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            render: (severity: 'info' | 'warning' | 'error') => getSeverityIcon(severity),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: 'inactive' | 'overtime' | 'system') => (
                <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
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
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (time: string) => formatDateTime(time),
            sorter: (a: Alert, b: Alert) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        },
        {
            title: 'Status',
            dataIndex: 'resolved',
            key: 'resolved',
            width: 100,
            render: (resolved: boolean) =>
                resolved ? (
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
            render: (record: Alert) =>
                !record.resolved ? (
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
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => resolveAllMutation.mutate()}
                        loading={resolveAllMutation.isPending}
                        disabled={unresolvedCount === 0}
                    >
                        Resolve All
                    </Button>
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
                            title="Critical"
                            value={errorCount}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Warnings"
                            value={warningCount}
                            valueStyle={{ color: '#faad14' }}
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
                            { label: 'Inactive', value: 'inactive' },
                            { label: 'Overtime', value: 'overtime' },
                            { label: 'System', value: 'system' },
                        ]}
                    />

                    <Select
                        placeholder="Filter by Severity"
                        style={{ width: 150 }}
                        allowClear
                        onChange={setSeverityFilter}
                        options={[
                            { label: 'All Severities', value: undefined },
                            { label: 'Error', value: 'error' },
                            { label: 'Warning', value: 'warning' },
                            { label: 'Info', value: 'info' },
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
