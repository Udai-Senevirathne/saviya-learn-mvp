import api from '@/lib/api';
import { User, UserUpdateInput } from '@/types';

export const usersService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  async updateProfile(data: UserUpdateInput): Promise<User> {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAvatar(): Promise<{ message: string }> {
    const response = await api.delete('/users/avatar');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getStats(): Promise<{
    groupsJoined: number;
    sessionsAttended: number;
    resourcesShared: number;
  }> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async updateNotificationPreferences(preferences: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  }): Promise<{ message: string }> {
    const response = await api.put('/users/notifications', preferences);
    return response.data;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/users/account');
    return response.data;
  },
};
