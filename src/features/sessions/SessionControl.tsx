import { useState, useEffect } from 'react';
import { Card, Button, Select, Space, Typography, Divider, message, Modal, Alert } from 'antd';
import { PlayCircleOutlined, StopOutlined, ProjectOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startSession, stopSession } from './session.api';
import { useActiveSession } from './useActiveSession';
import { LiveTimer } from '@/components/LiveTimer';
import { StatusBadge } from '@/components/StatusBadge';
import { getProjects } from '@/features/projects/projects.api';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import type { Project } from '@/types';

const { Title, Text } = Typography;

export const SessionControl = () => {
    const queryClient = useQueryClient();
    const [selectedProject, setSelectedProject] = useState<string>('');
    const { user } = useAuth();

    // Fetch active session
    const { data: activeSession, isLoading: sessionLoading } = useActiveSession();

    // Fetch projects (filtered by role)
    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
        queryKey: ['projects', user?.id, user?.role],
        queryFn: () => getProjects(user?.id, user?.role),
    });

    // Check if user is in onboarding (only has Training project)
    const isOnboarding = user?.role === 'employee' &&
        projects.length === 1 &&
        projects[0]?.isSystemProject;

    // Auto-select default project
    useEffect(() => {
        if (projects.length > 0 && !selectedProject && !activeSession) {
            // Default to first non-training project, or Training if none
            const defaultProject = projects.find(p => !p.isSystemProject) || projects[0];
            setSelectedProject(defaultProject?.id || '');
        }
    }, [projects, selectedProject, activeSession]);

    // Start session mutation
    const startMutation = useMutation({
        mutationFn: startSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            message.success('Session started successfully!');
            setSelectedProject('');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to start session');
        },
    });

    // Stop session mutation
    const stopMutation = useMutation({
        mutationFn: stopSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSession'] });
            queryClient.invalidateQueries({ queryKey: ['sessionHistory'] });
            message.success('Session stopped successfully!');
        },
        onError: (error: Error) => {
            message.error(error.message || 'Failed to stop session');
        },
    });

    // Activity tracker
    useEffect(() => {
        if (!activeSession) return;

        const activityInterval = setInterval(() => {
            // Send activity ping (could track mouse/keyboard events)
            // For now, just keep the session alive
            api
                .post(`/sessions/${activeSession.id}/activity`, {
                    timestamp: new Date().toISOString(),
                })
                .catch(() => {
                    // Silently fail
                });
        }, 60000); // Every minute

        return () => clearInterval(activityInterval);
    }, [activeSession]);

    const handleStart = () => {
        if (!selectedProject) {
            message.warning('Please select a project');
            return;
        }
        startMutation.mutate({ projectId: selectedProject });
    };

    const handleStop = () => {
        if (!activeSession) return;

        Modal.confirm({
            title: 'Stop Session',
            content: 'Are you sure you want to stop this session?',
            okText: 'Yes, Stop',
            okType: 'danger',
            onOk: () => stopMutation.mutate(activeSession.id),
        });
    };

    const isActive = !!activeSession;

    return (
        <Card>
            <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                    <ProjectOutlined /> Session Control
                </Title>

                {/* Onboarding Banner */}
                {isOnboarding && (
                    <Alert
                        type="info"
                        message="Onboarding Phase"
                        description="You are currently in onboarding. Your work will be logged under Internal / Training."
                        showIcon
                        style={{ marginBottom: 16, textAlign: 'left' }}
                    />
                )}

                {isActive ? (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <StatusBadge status={activeSession.status} />
                            <Divider type="vertical" />
                            <Text strong>{activeSession.projectName}</Text>
                        </div>

                        <LiveTimer startTime={activeSession.startTime} additionalSeconds={activeSession.activeTime} />

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                                <Text type="secondary">Active Time:</Text>
                                <Text strong>{Math.floor(activeSession.activeTime / 3600)}h {Math.floor((activeSession.activeTime % 3600) / 60)}m</Text>
                            </Space>
                            <Space>
                                <Text type="secondary">Idle Time:</Text>
                                <Text>{Math.floor(activeSession.idleTime / 60)}m</Text>
                            </Space>
                        </Space>

                        <Divider />
                        <Button
                            type="primary"
                            danger
                            size="large"
                            icon={<StopOutlined />}
                            onClick={handleStop}
                            loading={stopMutation.isPending}
                            disabled={activeSession.status === 'stopped'}
                            block
                            style={{ marginTop: 24 }}
                        >
                            Stop Session
                        </Button>
                    </>
                ) : (
                    <>
                        <Select
                            placeholder="Select Project"
                            value={selectedProject || undefined}
                            onChange={setSelectedProject}
                            loading={projectsLoading}
                            style={{ width: '100%', marginBottom: 16 }}
                            size="large"
                            options={projects.map((p) => ({ label: p.name, value: p.id }))}
                        />

                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={handleStart}
                            loading={startMutation.isPending || sessionLoading}
                            disabled={!selectedProject}
                            block
                        >
                            Start Session
                        </Button>
                    </>
                )}
            </div>
        </Card>
    );
};
