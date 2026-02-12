import { Badge } from 'antd';

interface StatusBadgeProps {
    status: 'active' | 'idle' | 'stopped';
    text?: string;
}

export const StatusBadge = ({ status, text }: StatusBadgeProps) => {
    const statusConfig = {
        active: { status: 'success' as const, text: text || 'Active' },
        idle: { status: 'warning' as const, text: text || 'Idle' },
        stopped: { status: 'default' as const, text: text || 'Stopped' },
    };

    const config = statusConfig[status];

    return <Badge status={config.status} text={config.text} />;
};
