import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';

const { Content, Sider } = Layout;

export const AppLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider breakpoint="lg" collapsedWidth="0" width={250}>
                <Sidebar />
            </Sider>
            <Layout>
                <HeaderBar />
                <Content style={{ margin: '24px 16px', padding: 24, background: '#f5f5f5' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
