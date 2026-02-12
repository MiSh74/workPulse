import api from '@/services/api';
import { mockProjects, mockUsers, SYSTEM_TRAINING_PROJECT } from '@/mocks/data';
import type { Project } from '@/types';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

export const getProjects = async (userId?: string, userRole?: 'admin' | 'manager' | 'employee'): Promise<Project[]> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockProjects];

                // Role-based filtering
                if (userRole === 'manager' && userId) {
                    // Managers see only projects where they are assigned as manager
                    filtered = filtered.filter(p => p.managerId === userId);
                } else if (userRole === 'employee' && userId) {
                    // Employees see only projects they are assigned to
                    const user = mockUsers.find(u => u.id === userId);
                    const assignedProjectIds = user?.assignedProjects || [];
                    filtered = filtered.filter(p => assignedProjectIds.includes(p.id));
                }
                // Admin sees all projects (no filtering)

                // Always include system Training project for all roles
                const hasTraining = filtered.some(p => p.id === SYSTEM_TRAINING_PROJECT.id);
                if (!hasTraining) {
                    filtered = [SYSTEM_TRAINING_PROJECT, ...filtered];
                }

                resolve(filtered);
            }, 300);
        });
    }
    const response = await api.get('/projects');
    return response.data;
};

// Helper function to check if user can access a project
export const canUserAccessProject = (userId: string, projectId: string, userRole: 'admin' | 'manager' | 'employee'): boolean => {
    // System Training project is always accessible
    if (projectId === SYSTEM_TRAINING_PROJECT.id) {
        return true;
    }

    if (userRole === 'admin') {
        return true; // Admin can access all projects
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) return false;

    if (userRole === 'employee') {
        // Employee can only access assigned projects
        return user.assignedProjects?.includes(projectId) || false;
    }

    if (userRole === 'manager') {
        // Manager can access projects they manage
        const project = mockProjects.find(p => p.id === projectId);
        return project?.managerId === userId;
    }

    return false;
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt'>, creatorId: string, creatorName: string, creatorRole: 'admin' | 'manager'): Promise<Project> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newProject: Project = {
                    ...project,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    createdBy: creatorId,
                    createdByName: creatorName,
                    // If manager creates, they are automatically assigned as manager
                    managerId: creatorRole === 'manager' ? creatorId : project.managerId,
                    managerName: creatorRole === 'manager' ? creatorName : project.managerName,
                    teamMembers: project.teamMembers || [],
                    teamMemberNames: project.teamMemberNames || [],
                    projectType: project.projectType || 'regular',
                    isDeletable: true,
                    isEditable: true,
                };
                mockProjects.push(newProject);
                resolve(newProject);
            }, 300);
        });
    }
    const response = await api.post('/projects', project);
    return response.data;
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockProjects.findIndex(p => p.id === id);
                if (index !== -1) {
                    const existingProject = mockProjects[index];

                    // Prevent editing system projects
                    if (existingProject.isSystemProject || existingProject.isEditable === false) {
                        reject(new Error('Cannot edit system project'));
                        return;
                    }

                    mockProjects[index] = { ...existingProject, ...project };
                    resolve(mockProjects[index]);
                } else {
                    reject(new Error('Project not found'));
                }
            }, 300);
        });
    }
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
};

export const assignManagerToProject = async (projectId: string, managerId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const project = mockProjects.find(p => p.id === projectId);
                const manager = mockUsers.find(u => u.id === managerId);
                if (project && manager) {
                    project.managerId = managerId;
                    project.managerName = manager.name;
                }
                resolve();
            }, 300);
        });
    }
    await api.patch(`/projects/${projectId}/assign-manager`, { managerId });
};

export const assignTeamMembersToProject = async (projectId: string, memberIds: string[]): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const project = mockProjects.find(p => p.id === projectId);
                if (project) {
                    project.teamMembers = memberIds;
                    project.teamMemberNames = memberIds.map(id => {
                        const user = mockUsers.find(u => u.id === id);
                        return user?.name || 'Unknown';
                    });

                    // Update user's assigned projects
                    memberIds.forEach(memberId => {
                        const user = mockUsers.find(u => u.id === memberId);
                        if (user) {
                            if (!user.assignedProjects) {
                                user.assignedProjects = [SYSTEM_TRAINING_PROJECT.id];
                            }
                            if (!user.assignedProjects.includes(projectId)) {
                                user.assignedProjects.push(projectId);
                            }
                            // Update onboarding status if they have real projects
                            if (user.assignedProjects.length > 1) {
                                user.onboardingStatus = 'active';
                            }
                        }
                    });
                }
                resolve();
            }, 300);
        });
    }
    await api.patch(`/projects/${projectId}/assign-team`, { memberIds });
};

export const deleteProject = async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const project = mockProjects.find(p => p.id === id);

                // Prevent deletion of system projects
                if (project?.isSystemProject || project?.isDeletable === false) {
                    reject(new Error('Cannot delete system project'));
                    return;
                }

                const index = mockProjects.findIndex(p => p.id === id);
                if (index !== -1) {
                    mockProjects.splice(index, 1);

                    // Remove project from user assignments
                    mockUsers.forEach(user => {
                        if (user.assignedProjects) {
                            user.assignedProjects = user.assignedProjects.filter(pid => pid !== id);
                            // Update onboarding status if only Training project remains
                            if (user.assignedProjects.length === 1 && user.assignedProjects[0] === SYSTEM_TRAINING_PROJECT.id) {
                                user.onboardingStatus = 'training';
                            }
                        }
                    });
                }
                resolve();
            }, 300);
        });
    }
    await api.delete(`/projects/${id}`);
};
