import api from '@/services/api';
import type { Project } from '@/types';

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
};

export const getSystemProject = async (): Promise<Project> => {
    const response = await api.get<Project>('/projects/system');
    return response.data;
};

export const createProject = async (projectData: { name: string; description?: string }): Promise<Project> => {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<void> => {
    await api.patch(`/projects/${id}`, projectData);
};

export const deleteProject = async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
};

export const archiveProject = deleteProject; // Alias

export const assignUsersToProject = async (projectId: string, userIds: string[]): Promise<void> => {
    await api.post(`/projects/${projectId}/assign`, { user_ids: userIds });
};

export const assignManagerToProject = async (projectId: string, managerId: string): Promise<void> => {
    return assignUsersToProject(projectId, [managerId]);
};

export const assignTeamMembersToProject = assignUsersToProject;

export const removeUserFromProject = async (projectId: string, userId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/assign/${userId}`);
};

