import api from '@/lib/api';
import {
  LearningGroup,
  GroupCreateInput,
  GroupUpdateInput,
  GroupFilters,
  GroupsResponse,
} from '@/types';

export const groupsService = {
  async getAll(filters?: GroupFilters): Promise<GroupsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isPrivate !== undefined) params.append('isPrivate', String(filters.isPrivate));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<GroupsResponse>(`/groups?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<LearningGroup> {
    const response = await api.get<LearningGroup>(`/groups/${id}`);
    return response.data;
  },

  async getMyGroups(): Promise<LearningGroup[]> {
    const response = await api.get<LearningGroup[]>('/groups/my');
    return response.data;
  },

  async create(data: GroupCreateInput): Promise<LearningGroup> {
    const response = await api.post<LearningGroup>('/groups', data);
    return response.data;
  },

  async update(id: string, data: GroupUpdateInput): Promise<LearningGroup> {
    const response = await api.put<LearningGroup>(`/groups/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },

  async join(id: string, message?: string): Promise<{ message: string }> {
    const response = await api.post(`/groups/${id}/join`, { message });
    return response.data;
  },

  async leave(id: string): Promise<{ message: string }> {
    const response = await api.post(`/groups/${id}/leave`);
    return response.data;
  },

  async approveRequest(groupId: string, userId: string): Promise<{ message: string }> {
    const response = await api.post(`/groups/${groupId}/approve/${userId}`);
    return response.data;
  },

  async rejectRequest(groupId: string, userId: string): Promise<{ message: string }> {
    const response = await api.post(`/groups/${groupId}/reject/${userId}`);
    return response.data;
  },

  async removeMember(groupId: string, userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: 'admin' | 'moderator' | 'member'
  ): Promise<{ message: string }> {
    const response = await api.put(`/groups/${groupId}/members/${userId}`, { role });
    return response.data;
  },

  async getMembers(groupId: string): Promise<LearningGroup['members']> {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  async getPendingRequests(groupId: string): Promise<LearningGroup['pendingRequests']> {
    const response = await api.get(`/groups/${groupId}/requests`);
    return response.data;
  },
};
