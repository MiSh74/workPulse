// Core types synchronized with swagger.yml

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    role: 'admin' | 'manager' | 'employee';
    status: 'active' | 'inactive' | 'suspended';
    organization_id: string;
    manager_id: string | null;
    last_seen: string | null;
    created_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    employee_id?: string;
    organization_name?: string;
    organization_id?: string;
    role?: 'admin' | 'manager' | 'employee';
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export interface ResetPasswordRequest {
    new_password: string;
    confirm_password: string;
}

export interface CreateUserRequest {
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    role: 'admin' | 'manager' | 'employee';
    manager_id?: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    organization_id: string;
    created_by: string;
    project_type: 'normal' | 'system';
    is_active: boolean;
    archived_at: string | null;
    created_at: string;
}

export interface WorkSession {
    id: string;
    user_id: string;
    organization_id: string;
    project_id: string;
    start_time: string;
    end_time: string | null;
    total_active_seconds: number;
    total_idle_seconds: number;
    status: 'active' | 'paused' | 'stopped';
    last_activity_at: string | null;
    // UI Helpers
    projectName?: string;
    userName?: string;
}

// Alias for transition
export type Session = WorkSession;

export interface StartSessionRequest {
    project_id: string;
}

export interface ActivityLogRequest {
    type: 'active' | 'idle';
    appName: string;
    windowTitle: string;
    url?: string;
}

export interface Alert {
    id: string;
    organization_id: string;
    user_id: string;
    session_id: string | null;
    type: 'idle' | 'overtime';
    message: string;
    created_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
    // UI Helpers
    userName?: string;
}

// Presence types
export type OnlineUser = Omit<User, 'status'> & {
    status: 'active' | 'paused' | 'idle' | 'offline' | 'inactive' | 'suspended';
};

// WebSocket event types
export type SocketEvent =
    | 'USER_ONLINE'
    | 'USER_OFFLINE'
    | 'SESSION_UPDATE'
    | 'INACTIVE_ALERT'
    | 'OVERTIME_ALERT'
    | 'MIDNIGHT_SUMMARY';

export interface UserOnlinePayload {
    user_id: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface UserOfflinePayload {
    user_id: string;
}

export interface SessionUpdatePayload {
    session: WorkSession;
}

export interface AlertPayload {
    alert_id: string;
    user_id: string;
    type: 'idle' | 'overtime';
    message: string;
}

export interface SocketEventData {
    event: SocketEvent;
    payload: any;
}

export interface UserComparisonData {
    userName: string;
    total_active_seconds: number;
    total_idle_seconds: number;
    total_seconds: number;
    productivity: number;
}

export interface ProductivityChartData {
    date: string;
    productivity: number;
    active_hours: number;
    idle_hours: number;
}

export interface Report {
    id: string;
    user_id: string;
    userName?: string;
    organization_id: string;
    start_date: string;
    end_date: string;
    total_sessions: number;
    total_active_seconds: number;
    total_idle_seconds: number;
    productivity: number;
}

export interface ReportFilters {
    user_id?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
}

// Reports & Charts
export interface DailySummary {
    date: string;
    total_active_seconds: number;
    total_idle_seconds: number;
    projects: {
        project_id: string;
        project_name: string;
        seconds: number;
    }[];
}

export interface MidnightSummary extends DailySummary {
    generated_at: string;
    organization_id: string;
}

export interface AttendanceDay {
    date: string;
    status: 'present' | 'absent' | 'half-day' | 'holiday' | 'leave';
    total_seconds: number;
    sessions_count: number;
}

export interface WeeklyAttendance {
    start_date: string;
    end_date: string;
    days: AttendanceDay[];
    total_hours: number;
    absent_count: number;
}

export interface ChartDataPoint {
    label: string;
    value: number;
    active?: number;
    idle?: number;
}
