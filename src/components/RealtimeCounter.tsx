import { useEffect, useState } from 'react';
import { Statistic, Card } from 'antd';
import { usePresenceStore } from '@/store/presence.store';
import { UserOutlined } from '@ant-design/icons';

interface RealtimeCounterProps {
    title?: string;
    style?: React.CSSProperties;
}

export const RealtimeCounter = ({ title = 'Online Users', style }: RealtimeCounterProps) => {
    const onlineUserCount = usePresenceStore((state) => state.onlineUserCount);
    const [previousCount, setPreviousCount] = useState(onlineUserCount);

    useEffect(() => {
        setPreviousCount(onlineUserCount);
    }, [onlineUserCount]);

    return (
        <Card style={style}>
            <Statistic
                title={title}
                value={onlineUserCount}
                prefix={<UserOutlined />}
                valueStyle={{
                    color: onlineUserCount > previousCount ? '#52c41a' : undefined,
                }}
            />
        </Card>
    );
};
