// User types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'employee';
    managerId?: string; // For employees - which manager they report to
    assignedProjects?: string[]; // Project IDs assigned to this user
    onboardingStatus?: 'training' | 'active'; // Employee onboarding status
    createdAt: string;
    isActive?: boolean;
    lastSeen?: string;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Session types
export interface Session {
    id: string;
    userId: string;
    userName: string;
    projectId: string; // REQUIRED - no nullable sessions
    projectName: string;
    startTime: string;
    endTime?: string;
    activeTime: number; // seconds
    idleTime: number; // seconds
    status: 'active' | 'idle' | 'stopped';
    lastActivity?: string;
    isTrainingSession?: boolean; // Track training vs regular work
}

export interface StartSessionRequest {
    projectId: string;
}

export interface ActivityUpdate {
    timestamp: string;
}

// Project types
export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    createdBy: string; // userId of creator (admin or manager)
    createdByName: string; // name of creator
    managerId?: string; // assigned manager (if created by admin)
    managerName?: string; // manager's name
    teamMembers?: string[]; // array of employee user IDs assigned by manager
    teamMemberNames?: string[]; // array of employee names for display
    isSystemProject?: boolean; // System-managed project (e.g., Training)
    isDeletable?: boolean; // Can this project be deleted?
    isEditable?: boolean; // Can this project be edited?
    projectType?: 'regular' | 'training' | 'internal'; // Project category
    isArchived?: boolean;
}

// Productivity types
export interface ProductivityScore {
    userId: string;
    userName: string;
    score: number; // 0-100
    activeHours: number;
    idleHours: number;
    totalHours: number;
}

export interface DailySummary {
    date: string;
    totalSessions: number;
    activeTime: number;
    idleTime: number;
    productivity: number;
}

// Alert types
export interface Alert {
    id: string;
    type: 'inactive' | 'overtime' | 'system';
    userId?: string;
    userName?: string;
    message: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error';
    resolved?: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}

// Presence types
export interface OnlineUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
    status: 'active' | 'idle' | 'offline';
    lastSeen: string;
}

// WebSocket event types
export type SocketEvent =
    | 'USER_ONLINE'
    | 'USER_OFFLINE'
    | 'SESSION_UPDATE'
    | 'INACTIVE_ALERT'
    | 'OVERTIME_ALERT';

export interface SocketEventData {
    event: SocketEvent;
    payload: unknown;
}

// WebSocket event payloads
export interface UserOnlinePayload {
    userId: string;
    userName: string;
    userRole: 'admin' | 'manager' | 'employee';
}

export interface UserOfflinePayload {
    userId: string;
}

export interface SessionUpdatePayload {
    session: Session;
}

export interface AlertPayload {
    alert: Alert;
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// Report types
export interface Report {
    id: string;
    userId: string;
    userName: string;
    startDate: string;
    endDate: string;
    totalSessions: number;
    activeTime: number;
    idleTime: number;
    productivity: number;
}

export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    userId?: string;
    projectId?: string;
}

// Chart types
export interface ChartDataPoint {
    label: string;
    value: number;
    active?: number;
    idle?: number;
}

export interface ProductivityChartData {
    date: string;
    productivity: number;
    activeTime: number;
    idleTime: number;
}

export interface UserComparisonData {
    userName: string;
    productivity: number;
    activeTime: number;
    idleTime: number;
    totalTime: number;
}
