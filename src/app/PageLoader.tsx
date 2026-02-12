import { Spin } from 'antd';

// Loading fallback
export const PageLoader = () => (
    <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
    </div>
);
