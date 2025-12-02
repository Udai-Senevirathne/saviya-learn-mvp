// Types - Barrel Export

// User types
export type {
  User,
  UserProfile,
  UserCreateInput,
  UserUpdateInput,
  AuthUser,
  AuthState,
} from './user';

// Group types
export type {
  LearningGroup,
  GroupMember,
  PendingRequest,
  GroupCreateInput,
  GroupUpdateInput,
  GroupFilters,
  GroupsResponse,
  GroupCategory,
} from './group';
export { GROUP_CATEGORIES } from './group';

// Resource types
export type {
  Resource,
  ResourceType,
  ResourceCreateInput,
  ResourceUpdateInput,
  ResourceFilters,
  ResourcesResponse,
} from './resource';
export { RESOURCE_TYPES } from './resource';

// Session types
export type {
  Session,
  SessionType,
  SessionStatus,
  SessionParticipant,
  RecurringPattern,
  SessionCreateInput,
  SessionUpdateInput,
  SessionFilters,
  SessionsResponse,
} from './session';

// Notification types
export type {
  Notification,
  NotificationType,
  NotificationData,
  NotificationPreferences,
  NotificationsResponse,
} from './notification';

// API types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  LoginInput,
  SignupInput,
  AuthResponse,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './api';
