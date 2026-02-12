import { Skeleton, Card } from 'antd';

interface LoadingSkeletonProps {
    rows?: number;
    avatar?: boolean;
}

export const LoadingSkeleton = ({ rows = 3, avatar = false }: LoadingSkeletonProps) => {
    return (
        <Card>
            <Skeleton active avatar={avatar} paragraph={{ rows }} />
        </Card>
    );
};
