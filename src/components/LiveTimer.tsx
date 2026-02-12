import { useState, useEffect } from 'react';
import { Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LiveTimerProps {
    startTime: string;
    additionalSeconds?: number;
    status?: 'active' | 'idle' | 'stopped';
    showIcon?: boolean;
}

export const LiveTimer = ({
    startTime,
    additionalSeconds = 0,
    status = 'active',
    showIcon = true,
}: LiveTimerProps) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const start = new Date(startTime).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.floor((now - start) / 1000);
            setElapsedSeconds(diff + additionalSeconds);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startTime, additionalSeconds]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine color based on status and duration
    const getColor = () => {
        if (status === 'idle') return '#faad14'; // yellow
        if (status === 'stopped') return '#d9d9d9'; // gray

        // Check for overtime (9+ hours)
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
                {status === 'idle' && (
                    <Text type="warning" style={{ fontSize: 14 }}>
                        Idle
                    </Text>
                )}
                {elapsedSeconds >= 9 * 3600 && (
                    <Text type="danger" style={{ fontSize: 14 }}>
                        Overtime
                    </Text>
                )}
            </Space>
        </div>
    );
};
