import { useState, useEffect } from 'react';
import { Card, Button, Select, Space, Typography, Divider, message, Modal, Alert, Tooltip, Row, Col } from 'antd';
import { PlayCircleOutlined, StopOutlined, ProjectOutlined, PauseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startSession, stopSession, pauseSession, resumeSession } from './sessions.api';
import { useActiveSession } from './useActiveSession';
import { LiveTimer } from '@/components/LiveTimer';
import { StatusBadge } from '@/components/StatusBadge';
import { getProjects } from '@/features/projects/projects.api';
import { useAuthStore } from '@/store/auth.store';
import { useSessionStore } from '@/store/session.store';
import type { Project } from '@/types';

const { Title, Text } = Typography;

export const SessionControl = () => {
    const queryClient = useQueryClient();
    const [selectedProject, setSelectedProject] = useState<string>('');
    const user = useAuthStore((state) => state.user);
    const { setActiveSession, setPaused } = useSessionStore();

    // Fetch active session
    const { data: activeSession, isLoading: sessionLoading } = useActiveSession();

    // Sync with store
    useEffect(() => {
        setActiveSession(activeSession || null);
    }, [activeSession, setActiveSession]);

    // Fetch projects
    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
        queryKey: ['projects', user?.id],
        queryFn: getProjects,
        enabled: !!user,
    });

    // Onboarding detection
    const isOnboarding = user?.role === 'employee' &&
        projects.length === 1 &&
        projects[0]?.project_type === 'system';

    // Start mutation
    const startMutation = useMutation({
        mutationFn: startSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            message.success('Session started successfully!');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to start session');
        },
    });

    // Pause mutation
    const pauseMutation = useMutation({
        mutationFn: pauseSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            setPaused(true);
            message.info('Session paused');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to pause session');
        },
    });

    // Resume mutation
    const resumeMutation = useMutation({
        mutationFn: resumeSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            setPaused(false);
            message.success('Session resumed');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to resume session');
        },
    });

    // Stop mutation
    const stopMutation = useMutation({
        mutationFn: stopSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            queryClient.invalidateQueries({ queryKey: ['sessions', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
            setSelectedProject('');
            message.success('Session stopped and logs synced');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to stop session');
        },
    });

    const handleStart = () => {
        if (!selectedProject) {
            message.warning('Please select a project to start tracking');
            return;
        }
        startMutation.mutate({ project_id: selectedProject });
    };

    const handleStop = () => {
        if (!activeSession) return;

        Modal.confirm({
            title: 'Stop Work Session',
            content: 'Project switching is only allowed after stopping the current session. All logs will be synced with the current project.',
            okText: 'Stop & Sync',
            okType: 'danger',
            onOk: () => stopMutation.mutate(activeSession.id),
        });
    };

    const isActive = !!activeSession && activeSession.status !== 'stopped';
    const isPaused = activeSession?.status === 'paused';

    return (
        <Card bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderRadius: 12 }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Title level={4} style={{ marginBottom: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ProjectOutlined style={{ color: '#1677ff' }} /> Session Tracker
                </Title>

                {isActive ? (
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                <StatusBadge status={activeSession.status} />
                                <Divider type="vertical" />
                                <Tooltip title="Current Project">
                                    <Text strong style={{ fontSize: 16 }}>{activeSession.projectName}</Text>
                                </Tooltip>
                            </div>

                            <LiveTimer
                                start_time={activeSession.start_time}
                                total_active_seconds={activeSession.total_active_seconds}
                            />
                        </div>

                        <Row gutter={16}>
                            <Col span={12}>
                                {isPaused ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlayCircleOutlined />}
                                        onClick={() => resumeMutation.mutate(activeSession.id)}
                                        loading={resumeMutation.isPending}
                                        block
                                        style={{ height: 50, borderRadius: 8 }}
                                    >
                                        Resume Task
                                    </Button>
                                ) : (
                                    <Button
                                        size="large"
                                        icon={<PauseCircleOutlined />}
                                        onClick={() => pauseMutation.mutate(activeSession.id)}
                                        loading={pauseMutation.isPending}
                                        block
                                        style={{ height: 50, borderRadius: 8 }}
                                    >
                                        Pause Task
                                    </Button>
                                )}
                            </Col>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    danger
                                    size="large"
                                    icon={<StopOutlined />}
                                    onClick={handleStop}
                                    loading={stopMutation.isPending}
                                    block
                                    style={{ height: 50, borderRadius: 8 }}
                                >
                                    Stop & Sync
                                </Button>
                            </Col>
                        </Row>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}>
                            <Space direction="vertical" align="start" size={0}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Active Effort</Text>
                                <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                                    {Math.floor(activeSession.total_active_seconds / 3600)}h {Math.floor((activeSession.total_active_seconds % 3600) / 60)}m
                                </Text>
                            </Space>
                            <Space direction="vertical" align="end" size={0}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Idle/Pause Time</Text>
                                <Text strong style={{ fontSize: 18, color: '#64748b' }}>
                                    {Math.floor(activeSession.total_idle_seconds / 60)}m
                                </Text>
                            </Space>
                        </div>
                    </Space>
                ) : (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                        <div style={{ textAlign: 'left' }}>
                            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>Select Project to Begin</Text>
                            <Select
                                placeholder="Choose a project..."
                                value={selectedProject || undefined}
                                onChange={setSelectedProject}
                                loading={projectsLoading}
                                style={{ width: '100%' }}
                                size="large"
                                options={projects.map((p) => ({ label: p.name, value: p.id }))}
                            />
                        </div>

                        {isOnboarding && (
                            <Alert
                                type="info"
                                message="Onboarding Active"
                                description="Your session will be logged under Internal/Training."
                                showIcon
                                style={{ textAlign: 'left', borderRadius: 8 }}
                            />
                        )}

                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={handleStart}
                            loading={startMutation.isPending || sessionLoading}
                            disabled={!selectedProject}
                            block
                            style={{ height: 56, borderRadius: 8, fontSize: 16, fontWeight: 600, marginTop: 8 }}
                        >
                            Clock In
                        </Button>

                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <SyncOutlined spin={startMutation.isPending} style={{ marginRight: 4 }} />
                            Logs will be automatically synced with your department.
                        </Text>
                    </Space>
                )}
            </div>
        </Card>
    );
};
