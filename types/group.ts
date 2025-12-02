// Learning Group Types

import { User } from './user';

export interface LearningGroup {
  _id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  creator: User | string;
  members: GroupMember[];
  pendingRequests: PendingRequest[];
  maxMembers: number;
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  user: User | string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface PendingRequest {
  user: User | string;
  message?: string;
  requestedAt: string;
}

export interface GroupCreateInput {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  maxMembers?: number;
  isPrivate?: boolean;
  image?: string;
}

export interface GroupUpdateInput {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  maxMembers?: number;
  isPrivate?: boolean;
  image?: string;
}

export interface GroupFilters {
  category?: string;
  search?: string;
  isPrivate?: boolean;
  hasSpace?: boolean;
  page?: number;
  limit?: number;
}

export interface GroupsResponse {
  groups: LearningGroup[];
  total: number;
  page: number;
  totalPages: number;
}

export const GROUP_CATEGORIES = [
  'Programming',
  'Languages',
  'Mathematics',
  'Science',
  'Arts',
  'Music',
  'Business',
  'Design',
  'Health',
  'Other',
] as const;

export type GroupCategory = typeof GROUP_CATEGORIES[number];
