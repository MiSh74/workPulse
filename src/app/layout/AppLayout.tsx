import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { ActivityTracker } from '@/components/ActivityTracker';

const { Content, Sider } = Layout;

export const AppLayout = () => {
    const { token } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
            <ActivityTracker />
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                width={260}
                style={{
                    backgroundColor: '#fff',
                    borderRight: '1px solid #f1f5f9',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                <Sidebar />
            </Sider>
            <Layout style={{ marginLeft: 260, background: token.colorBgLayout }}>
                <HeaderBar />
                <Content style={{
                    padding: '32px 32px 48px',
                    minHeight: 280,
                    maxWidth: 1600,
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
