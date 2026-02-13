import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from './auth.api';
import { useAuthStore } from '@/store/auth.store';
import { websocketService } from '@/services/websocket';
import type { RegisterRequest } from '@/types';

const { Title, Text } = Typography;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [form] = Form.useForm();

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            login(data.user, data.access_token);
            websocketService.connect(data.access_token);
            message.success('Registration successful! Welcome to WorkPulse.');
            navigate('/dashboard');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Registration failed. Please try again.');
        },
    });

    const handleSubmit = (values: any) => {
        const { confirm_password, ...registerData } = values;
        registerMutation.mutate(registerData as RegisterRequest);
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
                    maxWidth: 500,
                    borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ margin: 0, color: '#4f46e5' }}>
                        Create Organization
                    </Title>
                    <Text type="secondary">Get started with WorkPulse Productivity Tracker</Text>
                </div>

                <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="first_name"
                                label="First Name"
                                rules={[{ required: true, message: 'Please input your first name!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="First Name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="last_name"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please input your last name!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Last Name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="organization_name"
                        label="Organization Name"
                        rules={[{ required: true, message: 'Please input your organization name!' }]}
                    >
                        <Input prefix={<BankOutlined />} placeholder="Your Company Name" />
                    </Form.Item>

                    <Form.Item
                        name="employee_id"
                        label="Your Employee ID"
                        rules={[{ required: true, message: 'Please input your employee ID!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="e.g. EMP001" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 8, message: 'Password must be at least 8 characters!' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm_password"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={registerMutation.isPending}
                            style={{ height: 45, marginTop: 8 }}
                        >
                            Register & Setup
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </Text>
                </div>
            </Card>
        </div>
    );
};
