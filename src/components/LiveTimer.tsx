import { useState, useEffect } from 'react';
import { Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LiveTimerProps {
    start_time: string;
    total_active_seconds?: number;
    status?: 'active' | 'stopped';
    showIcon?: boolean;
}

export const LiveTimer = ({
    start_time,
    total_active_seconds = 0,
    status = 'active',
    showIcon = true,
}: LiveTimerProps) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const start = new Date(start_time).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.floor((now - start) / 1000);
            setElapsedSeconds(diff + total_active_seconds);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [start_time, total_active_seconds]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getColor = () => {
        if (status === 'stopped') return '#d9d9d9'; // gray
        if (elapsedSeconds >= 9 * 3600) return '#ff4d4f'; // red
        return '#52c41a'; // green
    };

    const color = getColor();

    return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Space direction="vertical" size="small">
                {showIcon && (
                    <ClockCircleOutlined style={{ fontSize: 32, color }} />
                )}
                <Title
                    level={1}
                    style={{
                        margin: 0,
                        fontSize: 56,
                        fontWeight: 'bold',
                        color,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '0.05em',
                    }}
                >
                    {formatTime(elapsedSeconds)}
                </Title>
                {elapsedSeconds >= 9 * 3600 && (
                    <Text type="danger" style={{ fontSize: 14 }}>
                        Overtime
                    </Text>
                )}
            </Space>
        </div>
    );
};
