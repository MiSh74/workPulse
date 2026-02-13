import { useState } from 'react';
import { Card, Table, Button, DatePicker, Select, Space, Typography, Row, Col, Statistic, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { formatDateTime, formatDuration, formatProductivity, exportToCSV } from '@/utils/format';
import { getReports } from './reports.api';
import { getUsers } from '@/features/users/users.api';
import { getProjects } from '@/features/projects/projects.api';
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

    // Fetch users for filter
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users', user?.id],
        queryFn: () => getUsers(isManager ? { manager_id: user?.id } : undefined),
        enabled: canFilterByUser,
    });

    // Fetch projects for filter
    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: getProjects,
    });

    // Fetch reports
    const { data: reports = [], isLoading } = useQuery<Report[]>({
        queryKey: ['reports', filters],
        queryFn: () => getReports(filters),
    });

    // Calculate summary metrics
    const totalSessions = reports.reduce((sum, r) => sum + (r.total_sessions || 0), 0);
    const totalActiveTime = reports.reduce((sum, r) => sum + (r.total_active_seconds || 0), 0);
    const totalIdleTime = reports.reduce((sum, r) => sum + (r.total_idle_seconds || 0), 0);
    const avgProductivity = reports.length > 0
        ? reports.reduce((sum, r) => sum + (r.productivity || 0), 0) / reports.length
        : 0;

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates) {
            setDateRange(dates);
            setFilters({
                ...filters,
                start_date: dates[0]?.toISOString(),
                end_date: dates[1]?.toISOString(),
            });
        } else {
            setDateRange([null, null]);
            const { start_date, end_date, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleUserChange = (user_id?: string) => {
        if (user_id) {
            setFilters({ ...filters, user_id });
        } else {
            const { user_id, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleProjectChange = (project_id?: string) => {
        if (project_id) {
            setFilters({ ...filters, project_id });
        } else {
            const { project_id, ...rest } = filters;
            setFilters(rest);
        }
    };

    const handleExport = () => {
        const exportData = reports.map((r) => ({
            User: r.userName,
            'Start Date': r.start_date ? formatDateTime(r.start_date) : '-',
            'End Date': r.end_date ? formatDateTime(r.end_date) : '-',
            'Total Sessions': r.total_sessions,
            'Active Time': formatDuration(r.total_active_seconds),
            'Idle Time': formatDuration(r.total_idle_seconds),
            'Productivity %': (r.productivity || 0).toFixed(1),
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
                    <span>{record.start_date ? formatDateTime(record.start_date) : '-'}</span>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                        to {record.end_date ? formatDateTime(record.end_date) : '-'}
                    </span>
                </Space>
            ),
        },
        {
            title: 'Sessions',
            dataIndex: 'total_sessions',
            key: 'total_sessions',
            sorter: (a: Report, b: Report) => (a.total_sessions || 0) - (b.total_sessions || 0),
        },
        {
            title: 'Active Time',
            dataIndex: 'total_active_seconds',
            key: 'total_active_seconds',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: Report, b: Report) => (a.total_active_seconds || 0) - (b.total_active_seconds || 0),
        },
        {
            title: 'Idle Time',
            dataIndex: 'total_idle_seconds',
            key: 'total_idle_seconds',
            render: (seconds: number) => formatDuration(seconds),
            sorter: (a: Report, b: Report) => (a.total_idle_seconds || 0) - (b.total_idle_seconds || 0),
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
            sorter: (a: Report, b: Report) => (a.productivity || 0) - (b.productivity || 0),
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
                                ...users.map((u) => ({ label: `${u.first_name} ${u.last_name}`, value: u.id })),
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
                    rowKey={(record) => record.id || `${record.user_id}-${record.start_date}`}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    locale={{ emptyText: 'No reports found. Try adjusting the filters.' }}
                />
            </Card>
        </div>
    );
};
