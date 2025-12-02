// User Types

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  interests: string[];
  skills: string[];
  bio?: string;
  location?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export interface UserProfile extends User {
  groupsJoined: number;
  sessionsAttended: number;
  resourcesShared: number;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  dateOfBirth?: string;
  interests?: string[];
  skills?: string[];
  avatar?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
