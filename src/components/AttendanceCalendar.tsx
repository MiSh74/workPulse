import { Card, Calendar, Badge, Typography, Space, Tooltip, Divider } from 'antd';
import type { AttendanceDay } from '@/types';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;

interface AttendanceCalendarProps {
    days: AttendanceDay[];
}

export const AttendanceCalendar = ({ days }: AttendanceCalendarProps) => {
    const dateMap = new Map(days.map(d => [d.date, d]));

    const dateCellRender = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        const dayData = dateMap.get(dateStr);

        if (!dayData) return null;

        const statusConfig = {
            present: { color: '#52c41a', label: 'Present' },
            absent: { color: '#ff4d4f', label: 'Absent' },
            'half-day': { color: '#faad14', label: 'Half Day' },
            holiday: { color: '#1890ff', label: 'Holiday' },
            leave: { color: '#722ed1', label: 'Leave' },
        };

        const config = statusConfig[dayData.status];

        return (
            <Tooltip title={`${config.label}: ${Math.floor(dayData.total_seconds / 3600)}h tracked`}>
                <div style={{ padding: '2px', textAlign: 'center' }}>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: config.color,
                        borderRadius: '2px',
                        marginTop: '4px'
                    }} />
                </div>
            </Tooltip>
        );
    };

    return (
        <Card title="Attendance & Activity Calendar" bordered={false} style={{ borderRadius: 12 }}>
            <Calendar
                fullscreen={false}
                cellRender={dateCellRender}
                headerRender={({ value }) => {
                    return (
                        <div style={{ padding: 8, textAlign: 'center' }}>
                            <Space>
                                <Text strong>{value.format('MMMM YYYY')}</Text>
                            </Space>
                        </div>
                    );
                }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space wrap size={[16, 8]}>
                <Badge color="#52c41a" text="Present" />
                <Badge color="#ff4d4f" text="Absent" />
                <Badge color="#faad14" text="Half Day" />
                <Badge color="#1890ff" text="Holiday" />
            </Space>
        </Card>
    );
};
