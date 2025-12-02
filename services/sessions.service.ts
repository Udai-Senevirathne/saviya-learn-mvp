import api from '@/lib/api';
import {
  Session,
  SessionCreateInput,
  SessionUpdateInput,
  SessionFilters,
  SessionsResponse,
} from '@/types';

export const sessionsService = {
  async getAll(filters?: SessionFilters): Promise<SessionsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.hostId) params.append('hostId', filters.hostId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<SessionsResponse>(`/sessions?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Session> {
    const response = await api.get<Session>(`/sessions/${id}`);
    return response.data;
  },

  async getUpcoming(): Promise<Session[]> {
    const response = await api.get<Session[]>('/sessions/upcoming');
    return response.data;
  },

  async getMySessions(): Promise<Session[]> {
    const response = await api.get<Session[]>('/sessions/my');
    return response.data;
  },

  async create(data: SessionCreateInput): Promise<Session> {
    const response = await api.post<Session>('/sessions', data);
    return response.data;
  },

  async update(id: string, data: SessionUpdateInput): Promise<Session> {
    const response = await api.put<Session>(`/sessions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },

  async join(id: string): Promise<{ message: string }> {
    const response = await api.post(`/sessions/${id}/join`);
    return response.data;
  },

  async leave(id: string): Promise<{ message: string }> {
    const response = await api.post(`/sessions/${id}/leave`);
    return response.data;
  },

  async start(id: string): Promise<{ meetingUrl: string }> {
    const response = await api.post(`/sessions/${id}/start`);
    return response.data;
  },

  async end(id: string): Promise<{ message: string }> {
    const response = await api.post(`/sessions/${id}/end`);
    return response.data;
  },

  async cancel(id: string, reason?: string): Promise<{ message: string }> {
    const response = await api.post(`/sessions/${id}/cancel`, { reason });
    return response.data;
  },

  async getParticipants(id: string): Promise<Session['participants']> {
    const response = await api.get(`/sessions/${id}/participants`);
    return response.data;
  },
};
