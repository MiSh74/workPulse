import { Modal, Form, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from './auth.api';
import type { ChangePasswordRequest } from '@/types';

interface ChangePasswordModalProps {
    open: boolean;
    onCancel: () => void;
}

export const ChangePasswordModal = ({ open, onCancel }: ChangePasswordModalProps) => {
    const [form] = Form.useForm();

    const mutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            message.success('Password changed successfully');
            onCancel();
            form.resetFields();
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to change password');
        },
    });

    const onFinish = (values: ChangePasswordRequest) => {
        mutation.mutate({
            old_password: values.old_password,
            new_password: values.new_password,
            confirm_password: values.confirm_password,
        });
    };

    return (
        <Modal
            title="Change Password"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={mutation.isPending}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="old_password"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please input your current password!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="new_password"
                    label="New Password"
                    rules={[
                        { required: true, message: 'Please input your new password!' },
                        { min: 8, message: 'Password must be at least 8 characters!' },
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="confirm_password"
                    label="Confirm New Password"
                    dependencies={['new_password']}
                    rules={[
                        { required: true, message: 'Please confirm your new password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('new_password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
};
