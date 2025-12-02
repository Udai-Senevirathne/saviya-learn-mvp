// Application Constants

export const APP_NAME = 'SaviyaLearn';
export const APP_DESCRIPTION = 'Learn Together, Grow Together';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

// Session
export const SESSION_TYPES = [
  { value: 'video', label: 'Video Call' },
  { value: 'audio', label: 'Audio Call' },
  { value: 'chat', label: 'Chat Session' },
  { value: 'in-person', label: 'In Person' },
] as const;

export const SESSION_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

// Group Categories
export const GROUP_CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'languages', label: 'Languages' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'arts', label: 'Arts' },
  { value: 'music', label: 'Music' },
  { value: 'business', label: 'Business' },
  { value: 'design', label: 'Design' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
] as const;

// Resource Types
export const RESOURCE_TYPES = [
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'link', label: 'Link', icon: '🔗' },
  { value: 'code', label: 'Code', icon: '💻' },
  { value: 'presentation', label: 'Presentation', icon: '📊' },
  { value: 'other', label: 'Other', icon: '📁' },
] as const;

// Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
] as const;

// Validation
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  BIO_MAX_LENGTH: 500,
  GROUP_NAME_MAX_LENGTH: 100,
  GROUP_DESCRIPTION_MAX_LENGTH: 1000,
  RESOURCE_TITLE_MAX_LENGTH: 200,
  RESOURCE_DESCRIPTION_MAX_LENGTH: 2000,
  SESSION_TITLE_MAX_LENGTH: 200,
  SESSION_DESCRIPTION_MAX_LENGTH: 2000,
  MAX_TAGS: 10,
  MAX_GROUP_MEMBERS: 100,
  MAX_SESSION_PARTICIPANTS: 50,
} as const;

// Timeouts
export const TIMEOUTS = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  SOCKET_RECONNECT_DELAY: 1000,
  API_TIMEOUT: 30000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  GROUPS: '/groups',
  SESSIONS: '/sessions',
  RESOURCES: '/resources',
  HELP: '/help',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    GROUPS: '/admin/groups',
    SESSIONS: '/admin/sessions',
    RESOURCES: '/admin/resources',
    ANALYTICS: '/admin/analytics',
  },
} as const;

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/groups',
  '/sessions',
  '/resources',
  '/help',
  '/admin',
];

// Admin Routes (require admin role)
export const ADMIN_ROUTES = ['/admin'];
