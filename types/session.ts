// Session Types

import { User } from './user';
import { LearningGroup } from './group';

export interface Session {
  _id: string;
  title: string;
  description: string;
  host: User | string;
  group?: LearningGroup | string;
  type: SessionType;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  timezone: string;
  meetingUrl?: string;
  meetingId?: string;
  maxParticipants?: number;
  participants: SessionParticipant[];
  status: SessionStatus;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type SessionType = 'video' | 'audio' | 'chat' | 'in-person';

export type SessionStatus = 
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface SessionParticipant {
  user: User | string;
  status: 'confirmed' | 'pending' | 'declined';
  joinedAt?: string;
  leftAt?: string;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endDate?: string;
  occurrences?: number;
}

export interface SessionCreateInput {
  title: string;
  description: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  timezone?: string;
  groupId?: string;
  meetingUrl?: string;
  maxParticipants?: number;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  tags?: string[];
}

export interface SessionUpdateInput {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  meetingUrl?: string;
  maxParticipants?: number;
  status?: SessionStatus;
  tags?: string[];
}

export interface SessionFilters {
  type?: SessionType;
  status?: SessionStatus;
  groupId?: string;
  hostId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
  page: number;
  totalPages: number;
}
