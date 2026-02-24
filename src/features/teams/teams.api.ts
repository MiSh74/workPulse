import api from '@/services/api';

export interface Team {
    id: string;
    name: string;
    description?: string;
    manager_id: string;
    organization_id: string;
    is_active: boolean;
    created_at: string;
    manager?: { first_name: string; last_name: string; email: string };
}

export interface TeamMemberStatus {
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        employee_id: string;
        status: string;
        last_seen: string;
    };
    is_online: boolean;
    active_session: {
        id: string;
        project_name: string;
        start_time: string;
        total_active_seconds: number;
        total_idle_seconds: number;
        status: string;
    } | null;
}

export const createTeam = async (data: { name: string; description?: string }): Promise<Team> => {
    const res = await api.post<Team>('/teams', data);
    return res.data;
};

export const getTeams = async (): Promise<Team[]> => {
    const res = await api.get<Team[]>('/teams');
    return res.data;
};

export const getTeam = async (id: string): Promise<Team> => {
    const res = await api.get<Team>(`/teams/${id}`);
    return res.data;
};

export const updateTeam = async (id: string, data: { name?: string; description?: string }): Promise<Team> => {
    const res = await api.patch<Team>(`/teams/${id}`, data);
    return res.data;
};

export const getTeamMembers = async (teamId: string) => {
    const res = await api.get(`/teams/${teamId}/members`);
    return res.data;
};

export const addTeamMembers = async (teamId: string, user_ids: string[]) => {
    await api.post(`/teams/${teamId}/members`, { user_ids });
};

export const removeTeamMember = async (teamId: string, userId: string) => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
};

export const getTeamProjects = async (teamId: string) => {
    const res = await api.get(`/teams/${teamId}/projects`);
    return res.data;
};

export const createTeamProject = async (teamId: string, data: { name: string; description?: string }) => {
    const res = await api.post(`/teams/${teamId}/projects`, data);
    return res.data;
};

export const assignProjectToEmployee = async (teamId: string, projectId: string, userId: string) => {
    await api.post(`/teams/${teamId}/projects/${projectId}/assign/${userId}`);
};

export const getTeamLiveStatus = async (teamId: string): Promise<TeamMemberStatus[]> => {
    const res = await api.get<TeamMemberStatus[]>(`/teams/${teamId}/live-status`);
    return res.data;
};
