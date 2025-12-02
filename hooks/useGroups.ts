'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { LearningGroup, GroupFilters, GroupsResponse } from '@/types';

export function useGroups(initialFilters?: GroupFilters) {
  const [groups, setGroups] = useState<LearningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<GroupFilters>(initialFilters || {});

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const response = await api.get<GroupsResponse>(`/groups?${params}`);
      
      setGroups(response.data.groups);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const updateFilters = useCallback((newFilters: Partial<GroupFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    groups,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refetch: fetchGroups,
  };
}

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<LearningGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get<LearningGroup>(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch group');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const joinGroup = useCallback(async () => {
    try {
      await api.post(`/groups/${groupId}/join`);
      await fetchGroup();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to join group',
      };
    }
  }, [groupId, fetchGroup]);

  const leaveGroup = useCallback(async () => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      await fetchGroup();
      return { success: true };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to leave group',
      };
    }
  }, [groupId, fetchGroup]);

  return {
    group,
    loading,
    error,
    refetch: fetchGroup,
    joinGroup,
    leaveGroup,
  };
}

export function useMyGroups() {
  const [groups, setGroups] = useState<LearningGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<LearningGroup[]>('/groups/my');
      setGroups(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch your groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  return {
    groups,
    loading,
    error,
    refetch: fetchMyGroups,
  };
}
