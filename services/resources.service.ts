import api from '@/lib/api';
import {
  Resource,
  ResourceCreateInput,
  ResourceUpdateInput,
  ResourceFilters,
  ResourcesResponse,
} from '@/types';

export const resourcesService = {
  async getAll(filters?: ResourceFilters): Promise<ResourcesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.isPublic !== undefined) params.append('isPublic', String(filters.isPublic));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<ResourcesResponse>(`/resources?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Resource> {
    const response = await api.get<Resource>(`/resources/${id}`);
    return response.data;
  },

  async getMyResources(): Promise<Resource[]> {
    const response = await api.get<Resource[]>('/resources/my');
    return response.data;
  },

  async create(data: ResourceCreateInput): Promise<Resource> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', data.type);
    
    if (data.url) formData.append('url', data.url);
    if (data.file) formData.append('file', data.file);
    if (data.groupId) formData.append('groupId', data.groupId);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));

    const response = await api.post<Resource>('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: string, data: ResourceUpdateInput): Promise<Resource> {
    const response = await api.put<Resource>(`/resources/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },

  async like(id: string): Promise<{ likes: number }> {
    const response = await api.post(`/resources/${id}/like`);
    return response.data;
  },

  async unlike(id: string): Promise<{ likes: number }> {
    const response = await api.delete(`/resources/${id}/like`);
    return response.data;
  },

  async download(id: string): Promise<{ url: string }> {
    const response = await api.get(`/resources/${id}/download`);
    return response.data;
  },

  async incrementViews(id: string): Promise<{ views: number }> {
    const response = await api.post(`/resources/${id}/view`);
    return response.data;
  },
};
