import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from './auth.api';
import { useAuthStore } from '@/store/auth.store';
import { websocketService } from '@/services/websocket';
import type { LoginRequest } from '@/types';

const { Title, Text } = Typography;

export const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [form] = Form.useForm();

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            login(data.user, data.token);
            websocketService.connect(data.token);
            message.success('Login successful!');

            // Redirect based on role
            if (data.user.role === 'admin' || data.user.role === 'manager') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }
        },
        onError: (error: Error) => {
            message.error(error.message || 'Login failed. Please check your credentials.');
        },
    });

    const handleSubmit = (values: LoginRequest) => {
        loginMutation.mutate(values);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ margin: 0, color: '#4f46e5' }}>
                        WorkPulse
                    </Title>
                    <Text type="secondary">Workforce Productivity Tracker</Text>
                </div>

                <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loginMutation.isPending}
                            style={{ height: 45 }}
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Demo Credentials: admin@example.com / password
                    </Text>
                </div>
            </Card>
        </div>
    );
};
