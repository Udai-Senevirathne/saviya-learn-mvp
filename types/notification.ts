// Notification Types

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'group_invite'
  | 'group_join_request'
  | 'group_join_approved'
  | 'group_join_rejected'
  | 'session_reminder'
  | 'session_started'
  | 'session_cancelled'
  | 'new_resource'
  | 'new_message'
  | 'mention'
  | 'system';

export interface NotificationData {
  groupId?: string;
  groupName?: string;
  sessionId?: string;
  sessionTitle?: string;
  resourceId?: string;
  resourceTitle?: string;
  userId?: string;
  userName?: string;
  actionUrl?: string;
}

export interface NotificationPreferences {
  email: {
    groupInvites: boolean;
    sessionReminders: boolean;
    newResources: boolean;
    newMessages: boolean;
    mentions: boolean;
    systemUpdates: boolean;
  };
  push: {
    groupInvites: boolean;
    sessionReminders: boolean;
    newResources: boolean;
    newMessages: boolean;
    mentions: boolean;
    systemUpdates: boolean;
  };
  inApp: {
    groupInvites: boolean;
    sessionReminders: boolean;
    newResources: boolean;
    newMessages: boolean;
    mentions: boolean;
    systemUpdates: boolean;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
}
