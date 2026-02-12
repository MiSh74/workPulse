import type { User, Session, Project, Alert, Report, OnlineUser, DailySummary, UserComparisonData, ProductivityChartData } from '@/types';

// System Training Project - Mandatory fallback for all employees
export const SYSTEM_TRAINING_PROJECT: Project = {
    id: 'system-training',
    name: 'Internal / Training',
    description: 'Default project for onboarding and training activities',
    createdAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    createdByName: 'System',
    isSystemProject: true,
    isDeletable: false,
    isEditable: false,
    projectType: 'training',
    managerId: undefined,
    teamMembers: [], // All employees have implicit access
};

// Mock Users
export const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
        id: '2',
        email: 'manager@example.com',
        name: 'Manager User',
        role: 'manager',
        createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
        id: '3',
        email: 'employee@example.com',
        name: 'Employee User',
        role: 'employee',
        managerId: '2', // Reports to Manager User
        assignedProjects: ['system-training', '1', '2'], // Training + assigned projects
        onboardingStatus: 'active', // Has real projects assigned
        createdAt: '2024-02-01T00:00:00.000Z',
    },
    {
        id: '4',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'employee',
        managerId: '2', // Reports to Manager User
        assignedProjects: ['system-training', '1', '2'], // Training + assigned projects
        onboardingStatus: 'active',
        createdAt: '2024-02-05T00:00:00.000Z',
    },
    {
        id: '5',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'employee',
        managerId: '2', // Reports to Manager User
        assignedProjects: ['system-training', '1', '3'], // Training + assigned projects
        onboardingStatus: 'active',
        createdAt: '2024-02-10T00:00:00.000Z',
    },
    {
        id: '6',
        email: 'new.employee@example.com',
        name: 'New Employee',
        role: 'employee',
        managerId: '2', // Reports to Manager User
        assignedProjects: ['system-training'], // Only Training project
        onboardingStatus: 'training', // Still in onboarding
        createdAt: '2024-02-15T00:00:00.000Z',
    },
];

// Mock Projects
export const mockProjects: Project[] = [
    {
        id: '1',
        name: 'WorkPulse Frontend',
        description: 'Building the frontend application',
        createdAt: '2024-01-01T00:00:00.000Z',
        createdBy: '1',
        createdByName: 'Admin User',
        managerId: '2',
        managerName: 'Manager User',
        teamMembers: ['3', '4', '5'],
        teamMemberNames: ['Employee User', 'John Doe', 'Jane Smith'],
        projectType: 'regular',
        isDeletable: true,
        isEditable: true,
    },
    {
        id: '2',
        name: 'WorkPulse Backend',
        description: 'API and database development',
        createdAt: '2024-01-05T00:00:00.000Z',
        createdBy: '2',
        createdByName: 'Manager User',
        managerId: '2',
        managerName: 'Manager User',
        teamMembers: ['3', '4'],
        teamMemberNames: ['Employee User', 'John Doe'],
        projectType: 'regular',
        isDeletable: true,
        isEditable: true,
    },
    {
        id: '3',
        name: 'Mobile App',
        description: 'React Native mobile application',
        createdAt: '2024-01-10T00:00:00.000Z',
        createdBy: '1',
        createdByName: 'Admin User',
        managerId: '2',
        managerName: 'Manager User',
        teamMembers: ['5'],
        teamMemberNames: ['Jane Smith'],
        projectType: 'regular',
        isDeletable: true,
        isEditable: true,
    },
    {
        id: '4',
        name: 'Documentation',
        description: 'User guides and API documentation',
        createdAt: '2024-01-15T00:00:00.000Z',
        createdBy: '1',
        createdByName: 'Admin User',
        managerId: '2',
        managerName: 'Manager User',
        teamMembers: [],
        teamMemberNames: [],
        projectType: 'regular',
        isDeletable: true,
        isEditable: true,
    },
];

// Mock Active Sessions
export const mockActiveSessions: Session[] = [
    {
        id: '1',
        userId: '3',
        userName: 'Employee User',
        projectId: '1',
        projectName: 'WorkPulse Frontend',
        startTime: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        activeTime: 5400, // 1.5 hours in seconds
        idleTime: 900, // 15 minutes
        status: 'active',
    },
    {
        id: '2',
        userId: '4',
        userName: 'John Doe',
        projectId: '2',
        projectName: 'WorkPulse Backend',
        startTime: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
        activeTime: 10800, // 3 hours
        idleTime: 1800, // 30 minutes
        status: 'active',
    },
    {
        id: '3',
        userId: '5',
        userName: 'Jane Smith',
        projectId: '3',
        projectName: 'Mobile App',
        startTime: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
        activeTime: 2700, // 45 minutes
        idleTime: 600, // 10 minutes
        status: 'idle',
    },
];

// Mock Online Users
export const mockOnlineUsers: OnlineUser[] = [
    {
        id: '3',
        name: 'Employee User',
        email: 'employee@example.com',
        role: 'employee',
        status: 'active',
        lastSeen: new Date().toISOString(),
    },
    {
        id: '4',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'employee',
        status: 'active',
        lastSeen: new Date().toISOString(),
    },
    {
        id: '5',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'employee',
        status: 'idle',
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    },
    {
        id: '2',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
        status: 'active',
        lastSeen: new Date().toISOString(),
    },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
    {
        id: '1',
        userId: '5',
        userName: 'Jane Smith',
        type: 'inactive',
        severity: 'warning',
        message: 'User has been idle for 5 minutes',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        resolved: false,
    },
    {
        id: '2',
        userId: '4',
        userName: 'John Doe',
        type: 'overtime',
        severity: 'error',
        message: 'User has been working for over 9 hours',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        resolved: false,
    },
    {
        id: '3',
        userId: '3',
        userName: 'Employee User',
        type: 'inactive',
        severity: 'info',
        message: 'User resumed activity after idle period',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        resolved: true,
    },
];

// Mock Reports
export const mockReports: Report[] = [
    {
        id: '1',
        userId: '3',
        userName: 'Employee User',
        startDate: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        endDate: new Date().toISOString(),
        totalSessions: 35,
        activeTime: 108000, // 30 hours
        idleTime: 18000, // 5 hours
        productivity: 85.7,
    },
    {
        id: '2',
        userId: '4',
        userName: 'John Doe',
        startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
        endDate: new Date().toISOString(),
        totalSessions: 42,
        activeTime: 129600, // 36 hours
        idleTime: 14400, // 4 hours
        productivity: 90.0,
    },
    {
        id: '3',
        userId: '5',
        userName: 'Jane Smith',
        startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
        endDate: new Date().toISOString(),
        totalSessions: 28,
        activeTime: 86400, // 24 hours
        idleTime: 21600, // 6 hours
        productivity: 80.0,
    },
];

// Mock Daily Summary (for current user)
export const mockDailySummary: DailySummary = {
    date: new Date().toISOString().split('T')[0],
    activeTime: 18000, // 5 hours
    idleTime: 3600, // 1 hour
    productivity: 83.3,
    totalSessions: 3,
};

// Mock User Comparison Data
export const mockUserComparison: UserComparisonData[] = [
    {
        userName: 'John Doe',
        activeTime: 129600,
        idleTime: 14400,
        totalTime: 144000,
        productivity: 90.0,
    },
    {
        userName: 'Employee User',
        activeTime: 108000,
        idleTime: 18000,
        totalTime: 126000,
        productivity: 85.7,
    },
    {
        userName: 'Jane Smith',
        activeTime: 86400,
        idleTime: 21600,
        totalTime: 108000,
        productivity: 80.0,
    },
];

// Mock Productivity Chart Data (7 days)
export const mockProductivityChartData: ProductivityChartData[] = [
    {
        date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
        productivity: 78,
        activeTime: 6.5,
        idleTime: 1.5,
    },
    {
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        productivity: 82,
        activeTime: 7.2,
        idleTime: 1.3,
    },
    {
        date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
        productivity: 85,
        activeTime: 7.8,
        idleTime: 1.0,
    },
    {
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        productivity: 88,
        activeTime: 8.1,
        idleTime: 0.9,
    },
    {
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        productivity: 84,
        activeTime: 7.5,
        idleTime: 1.2,
    },
    {
        date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        productivity: 86,
        activeTime: 7.9,
        idleTime: 1.1,
    },
    {
        date: new Date().toISOString().split('T')[0],
        productivity: 83,
        activeTime: 5.0,
        idleTime: 1.0,
    },
];

// Mock Session History
export const mockSessionHistory: Session[] = [
    {
        id: '101',
        userId: '3',
        userName: 'Employee User',
        projectId: '1',
        projectName: 'WorkPulse Frontend',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() - 86400000 + 28800000).toISOString(),
        activeTime: 25200, // 7 hours
        idleTime: 3600, // 1 hour
        status: 'stopped',
    },
    {
        id: '102',
        userId: '3',
        userName: 'Employee User',
        projectId: '2',
        projectName: 'WorkPulse Backend',
        startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 2 + 21600000).toISOString(),
        activeTime: 18000, // 5 hours
        idleTime: 3600, // 1 hour
        status: 'stopped',
    },
    {
        id: '103',
        userId: '3',
        userName: 'Employee User',
        projectId: '1',
        projectName: 'WorkPulse Frontend',
        startTime: new Date(Date.now() - 86400000 * 3).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 3 + 32400000).toISOString(),
        activeTime: 28800, // 8 hours
        idleTime: 3600, // 1 hour
        status: 'stopped',
    },
];

// Helper function to get mock data based on user role
export const getMockDataForRole = (role: 'admin' | 'manager' | 'employee') => {
    switch (role) {
        case 'admin':
            return {
                users: mockUsers,
                projects: mockProjects,
                activeSessions: mockActiveSessions,
                onlineUsers: mockOnlineUsers,
                alerts: mockAlerts,
                reports: mockReports,
                userComparison: mockUserComparison,
                productivityChart: mockProductivityChartData,
            };
        case 'manager':
            // Manager sees only team data (employees 3, 4, 5)
            return {
                users: mockUsers.filter(u => ['3', '4', '5'].includes(u.id)),
                projects: mockProjects,
                activeSessions: mockActiveSessions,
                onlineUsers: mockOnlineUsers.filter(u => u.role === 'employee'),
                alerts: mockAlerts,
                reports: mockReports,
                userComparison: mockUserComparison,
                productivityChart: mockProductivityChartData,
            };
        case 'employee':
            // Employee sees only their own data
            return {
                projects: mockProjects,
                dailySummary: mockDailySummary,
                sessionHistory: mockSessionHistory,
                productivityChart: mockProductivityChartData,
                alerts: mockAlerts.filter(a => a.userId === '3'),
            };
        default:
            return {};
    }
};
