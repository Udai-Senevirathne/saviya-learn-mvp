'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthUser } from '@/types';

// Storage subscription for auth state
const authSubscribers = new Set<() => void>();

function getAuthSnapshot(): { user: AuthUser | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as AuthUser;
      return { user, token };
    } catch {
      return { user: null, token: null };
    }
  }
  return { user: null, token: null };
}

function getServerAuthSnapshot(): { user: AuthUser | null; token: string | null } {
  return { user: null, token: null };
}

function subscribeAuth(callback: () => void) {
  authSubscribers.add(callback);
  return () => authSubscribers.delete(callback);
}

function notifyAuthChange() {
  authSubscribers.forEach(callback => callback());
}

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const authData = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  
  const isAuthenticated = !!authData.token && !!authData.user;

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        notifyAuthChange();

        return { success: true };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return {
          success: false,
          error: err.response?.data?.message || 'Login failed',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      try {
        await api.post('/auth/register', { name, email, password });
        return { success: true };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return {
          success: false,
          error: err.response?.data?.message || 'Signup failed',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    notifyAuthChange();
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((user: AuthUser) => {
    localStorage.setItem('user', JSON.stringify(user));
    notifyAuthChange();
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: err.response?.data?.message || 'Request failed',
      };
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        await api.post('/auth/reset-password', { token, password });
        return { success: true };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return {
          success: false,
          error: err.response?.data?.message || 'Reset failed',
        };
      }
    },
    []
  );

  return {
    user: authData.user,
    token: authData.token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
  };
}
