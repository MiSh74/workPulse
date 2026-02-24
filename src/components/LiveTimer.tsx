import { useState, useEffect, useRef } from 'react';
import { Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LiveTimerProps {
    start_time: string;
    total_active_seconds?: number;
    status?: 'active' | 'paused' | 'stopped';
    showIcon?: boolean;
}

export const LiveTimer = ({
    start_time,
    total_active_seconds = 0,
    status = 'active',
    showIcon = true,
}: LiveTimerProps) => {
    const [displaySeconds, setDisplaySeconds] = useState(total_active_seconds);
    const baseRef = useRef(total_active_seconds);
    const tickStartRef = useRef(Date.now());

    // When server sends refreshed totals, update base and reset tick reference
    useEffect(() => {
        baseRef.current = total_active_seconds;
        tickStartRef.current = Date.now();
        setDisplaySeconds(total_active_seconds);
    }, [total_active_seconds, start_time]);

    // Ticking interval — only when session is active
    useEffect(() => {
        if (status !== 'active') return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - tickStartRef.current) / 1000);
            setDisplaySeconds(baseRef.current + elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getColor = () => {
        if (status === 'stopped') return '#d9d9d9';
        if (status === 'paused') return '#faad14';
        if (displaySeconds >= 9 * 3600) return '#ff4d4f';
        return '#52c41a';
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
                    {formatTime(displaySeconds)}
                </Title>
                {status === 'paused' && (
                    <Text style={{ color: '#faad14', fontSize: 14 }}>Paused</Text>
                )}
                {displaySeconds >= 9 * 3600 && status === 'active' && (
                    <Text type="danger" style={{ fontSize: 14 }}>Overtime</Text>
                )}
            </Space>
        </div>
    );
};
