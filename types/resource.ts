// Resource Types

import { User } from './user';
import { LearningGroup } from './group';

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  fileUrl?: string;
  thumbnail?: string;
  author: User | string;
  group?: LearningGroup | string;
  tags: string[];
  views: number;
  likes: string[];
  downloads: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 
  | 'document'
  | 'video'
  | 'audio'
  | 'image'
  | 'link'
  | 'code'
  | 'presentation'
  | 'other';

export interface ResourceCreateInput {
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  file?: File;
  groupId?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ResourceUpdateInput {
  title?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ResourceFilters {
  type?: ResourceType;
  search?: string;
  groupId?: string;
  authorId?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'views' | 'likes' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface ResourcesResponse {
  resources: Resource[];
  total: number;
  page: number;
  totalPages: number;
}

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'code', label: 'Code' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other', label: 'Other' },
];
