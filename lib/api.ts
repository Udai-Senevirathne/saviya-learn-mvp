// Simple API utility
import axiosInstance from './axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token management
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const clearToken = () => {
  localStorage.removeItem('token');
};

// API base URL
export const API_BASE_URL = API_URL;

// Default export for axios instance
export default axiosInstance;
