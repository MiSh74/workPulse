import { useState } from 'react';
import { Card, Table, Button, DatePicker, Select, Space, Typography, Row, Col, Statistic, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { formatDateTime, formatDuration, formatProductivity, exportToCSV } from '@/utils/format';
import { getReports } from './reports.api';
import api from '@/services/api';
import type { Report, ReportFilters, User, Project } from '@/types';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export const ReportsPage = () => {
    const user = useAuthStore((state) => state.user);
    const [filters, setFilters] = useState<ReportFilters>({});
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const canFilterByUser = isAdmin || isManager;

    // Fetch users for filter (admin/manager only)
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const endpoint = isManager ? '/users/team' : '/users';
            const response = await api.get(endpoint);
            return response.data;
        },
        enabled: canFilterByUser,
    });

    // Fetch projects for filter
    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await api.get('/projects');
            return response.data;
        },
    });

    // Fetch reports
    const { data: reports = [], isLoading } = useQuery<Report[]>({
        queryKey: ['reports', filters],
        queryFn: () => getReports(filters),
    });

    // Calculate summary metrics
    const totalSessions = reports.reduce((sum, r) => sum + r.totalSessions, 0);
    const totalActiveTime = reports.reduce((sum, r) => sum + r.activeTime, 0);
    const totalIdleTime = reports.reduce((sum, r) => sum + r.idleTime, 0);
    const avgProductivity = reports.length > 0
        ? reports.reduce((sum, r) => sum + r.productivity, 0) / reports.length
        : 0;

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates) {
            setDateRange(dates);
            setFilters({
                ...filters,
                startDate: dates[0]?.toISOString(),
                endDate: dates[1]?.toISOString(),
            });
        } else {
            setDateRange([null, null]);
            const { startDate, endDate, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleUserChange = (userId?: string) => {
        if (userId) {
            setFilters({ ...filters, userId });
        } else {
            const { userId, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleProjectChange = (projectId?: string) => {
        if (projectId) {
            setFilters({ ...filters, projectId });
        } else {
            const { projectId, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleExport = () => {
        const exportData = reports.map((r) => ({
            User: r.userName,
            'Start Date': formatDateTime(r.startDate),
            'End Date': formatDateTime(r.endDate),
            'Total Sessions': r.totalSessions,
            'Active Time': formatDuration(r.activeTime),
            'Idle Time': formatDuration(r.idleTime),
            'Productivity %': r.productivity.toFixed(1),
        }));
        exportToCSV(exportData, 'productivity-reports');
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            hidden: !canFilterByUser,
        },
        {
            title: 'Period',
            key: 'period',
            render: (record: Report) => (
                <Space direction="vertical" size={0}>
                    <span>{formatDateTime(record.startDate)}</span>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>to {formatDateTime(record.endDate)}</span>
                </Space>
            ),
        },
        {
            title: 'Sessions',
            dataIndex: 'totalSessions',
            key: 'totalSessions',
            sorter: (a: Report, b: Report) => a.totalSessions - b.totalSessions,
        },
        {
            title: 'Active Time',
            dataIndex: 'activeTime',
            key: 'activeTime',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: Report, b: Report) => a.activeTime - b.activeTime,
        },
        {
            title: 'Idle Time',
            dataIndex: 'idleTime',
            key: 'idleTime',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: Report, b: Report) => a.idleTime - b.idleTime,
        },
        {
            title: 'Productivity',
            dataIndex: 'productivity',
            key: 'productivity',
            render: (productivity: number) => {
                let color = 'default';
                if (productivity >= 80) color = 'success';
                else if (productivity >= 50) color = 'warning';
                else color = 'error';

                return <Tag color={color}>{formatProductivity(productivity)}</Tag>;
            },
            sorter: (a: Report, b: Report) => a.productivity - b.productivity,
        },
    ].filter((col) => !col.hidden);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Reports
                </Title>
                <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    disabled={reports.length === 0}
                >
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Sessions" value={totalSessions} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Active Time"
                            value={formatDuration(totalActiveTime)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Idle Time"
                            value={formatDuration(totalIdleTime)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
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

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Space wrap>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        format="YYYY-MM-DD"
                        placeholder={['Start Date', 'End Date']}
                    />

                    {canFilterByUser && (
                        <Select
                            placeholder="Select User"
                            style={{ width: 200 }}
                            allowClear
                            onChange={handleUserChange}
                            options={[
                                { label: 'All Users', value: undefined },
                                ...users.map((u) => ({ label: u.name, value: u.id })),
                            ]}
                        />
                    )}

                    <Select
                        placeholder="Select Project"
                        style={{ width: 200 }}
                        allowClear
                        onChange={handleProjectChange}
                        options={[
                            { label: 'All Projects', value: undefined },
                            ...projects.map((p) => ({ label: p.name, value: p.id })),
                        ]}
                    />
                </Space>
            </Card>

            {/* Reports Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={reports}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    locale={{ emptyText: 'No reports found. Try adjusting the filters.' }}
                />
            </Card>
        </div>
    );
};
