<div align="center">

# 🎓 SaviyaLearn

### Empowering Sri Lankan Students Through Peer-to-Peer Learning

[![Next.js](https://img.shields.io/badge/Next.js-16.0.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>🇱🇰 A trilingual (English • සිංහල • தமிழ்), production-ready Next.js 16 application for collaborative learning</strong>
</p>

[Live Demo](https://saviyalearn.vercel.app) · [Report Bug](https://github.com/dinethjanitha/saviya-learn-mvp/issues) · [Request Feature](https://github.com/dinethjanitha/saviya-learn-mvp/issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Implementation Status](#-implementation-status)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Pages & Routes](#-pages--routes)
- [Component Library](#-component-library)
- [Custom Hooks](#-custom-hooks)
- [Services & API](#-services--api)
- [State Management](#-state-management)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🎯 About

**SaviyaLearn** (සවිය ලර්න்) is a peer-to-peer education platform designed specifically for Sri Lankan students. It enables students to form study groups, share educational resources, and host collaborative learning sessions — breaking down barriers to quality education through community-driven learning.

### The Problem
- Limited access to quality tutoring in rural areas
- High cost of private education
- Lack of collaborative learning tools in Sinhala/Tamil
- Fragmented study resources across platforms

### Our Solution
- Free peer-to-peer study groups by subject & grade
- Centralized resource sharing platform
- Virtual study sessions with multiple formats
- **Trilingual support** (English, සිංහල, தமிழ்)
- Real-time notifications and activity tracking
- Role-based admin dashboard for moderation

---

## 📊 Implementation Status

> **Current Version:** `0.1.0` (MVP - Active Development)

### ✅ Completed Features

| Category | Status | Description |
|----------|--------|-------------|
| **Core Architecture** | ✅ 100% | Next.js 16 App Router, TypeScript strict mode, Tailwind v4 |
| **Authentication System** | ✅ 100% | Login, Signup, Forgot Password, Email Verification, Password Reset |
| **User Dashboard** | ✅ 100% | Home page with stats, activity feeds, quick actions |
| **Learning Groups** | ✅ 100% | Create, join, manage groups with categories & member controls |
| **Study Sessions** | ✅ 100% | Video/Audio/Chat/In-person sessions with scheduling |
| **Resource Library** | ✅ 100% | Multi-format uploads, tagging, engagement metrics |
| **Admin Dashboard** | ✅ 100% | Analytics, user management, content moderation |
| **Internationalization** | ✅ 100% | Full trilingual UI (EN/SI/TA) with 1400+ translations |
| **Real-time Features** | ✅ 100% | Socket.io notifications, activity feeds |
| **UI Component Library** | ✅ 100% | 15+ production-ready components |
| **Custom Hooks** | ✅ 100% | Auth, groups, socket, utilities |
| **API Services** | ✅ 100% | Auth, users, groups, sessions, resources |
| **Type Definitions** | ✅ 100% | Comprehensive TypeScript types |

### 🚧 In Progress

| Feature | Progress | Notes |
|---------|----------|-------|
| Video Conferencing | 🔄 0% | Jitsi/Zoom integration planned |
| Mobile App | 🔄 0% | React Native version planned |
| Push Notifications | 🔄 0% | FCM integration planned |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication System
- ✅ Email/password login with validation
- ✅ User registration with form validation
- ✅ Forgot password with email reset flow
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ JWT token management
- ✅ Role-based access (User/Mod/Admin/SuperAdmin)

</td>
<td width="50%">

### 👥 Learning Groups
- ✅ Create & join study groups
- ✅ 10 subject categories (Programming, Languages, Math, etc.)
- ✅ Public/Private group visibility
- ✅ Member request management
- ✅ Admin/Moderator/Member roles
- ✅ Tag-based categorization
- ✅ Max member limits

</td>
</tr>
<tr>
<td>

### 📚 Resources & Sharing
- ✅ Multi-format support (Documents, Videos, Audio, Images, Code, Links)
- ✅ Public/Private resource sharing
- ✅ View, like, download tracking
- ✅ Tag-based organization
- ✅ Group-specific resources
- ✅ Author attribution
- ✅ Thumbnail support

</td>
<td>

### 🎥 Study Sessions
- ✅ Multiple formats (Video/Audio/Chat/In-person)
- ✅ Calendar scheduling with timezone
- ✅ Recurring patterns (Daily/Weekly/Monthly)
- ✅ Participant tracking & confirmation
- ✅ Session status (Scheduled/Live/Completed/Cancelled)
- ✅ Meeting URL integration
- ✅ Max participant limits

</td>
</tr>
<tr>
<td>

### 🔔 Real-time Features
- ✅ Socket.io live notifications
- ✅ Activity feeds
- ✅ Connection status indicators
- ✅ Auto-reconnection handling
- ✅ User-specific notifications
- ✅ Instant updates across tabs

</td>
<td>

### 🌐 Internationalization
- ✅ 🇬🇧 English (Full)
- ✅ 🇱🇰 සිංහල / Sinhala (Full)
- ✅ 🇱🇰 தமிழ் / Tamil (Full)
- ✅ Dynamic language switching
- ✅ Persisted language preference
- ✅ 1400+ translation keys

</td>
</tr>
<tr>
<td>

### 🛡️ Admin Dashboard
- ✅ Platform analytics & stats
- ✅ User management (view/edit/activate/deactivate)
- ✅ Group moderation tools
- ✅ Session management
- ✅ Resource management
- ✅ Activity logs monitoring
- ✅ Dark/Light theme support

</td>
<td>

### 👤 User Profiles
- ✅ Customizable profiles
- ✅ Skills & interests tagging
- ✅ Bio & location info
- ✅ Avatar support
- ✅ Activity statistics
- ✅ Groups joined tracking
- ✅ Sessions attended count

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.0.6 | React framework with App Router |
| [React](https://react.dev/) | 19.2.0 | UI library with Server Components |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety (strict mode enabled) |
| [TailwindCSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |

### Data & Communication
| Technology | Version | Purpose |
|------------|---------|---------|
| [Axios](https://axios-http.com/) | 1.13.2 | HTTP client with interceptors |
| [Socket.io Client](https://socket.io/) | 4.8.1 | Real-time bidirectional communication |

### UI & Icons
| Technology | Version | Purpose |
|------------|---------|---------|
| [Lucide React](https://lucide.dev/) | 0.555.0 | Icon system (200+ icons) |
| [Geist Font](https://vercel.com/font) | Latest | Typography (Sans & Mono) |

### Developer Experience
| Technology | Purpose |
|------------|---------|
| [ESLint](https://eslint.org/) + Next.js Config | Code linting |
| [PostCSS](https://postcss.org/) | CSS processing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or later
- **npm** 9+ or **yarn** / **pnpm** / **bun**
- **Backend API** - [SaviyaLearn Backend](https://github.com/dinethjanitha/saviya-learn-backend) running

### Quick Start

```bash
# Clone the repository
git clone https://github.com/dinethjanitha/saviya-learn-mvp.git
cd saviya-learn-mvp

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# App Metadata (Optional)
NEXT_PUBLIC_APP_NAME=SaviyaLearn
NEXT_PUBLIC_APP_DESCRIPTION=P2P Education Platform for Sri Lankan Students
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

---

## 📁 Project Structure

```
saviya-learn-mvp/
│
├── 📁 app/                         # Next.js App Router
│   │
│   ├── (auth)/                     # 🔓 Public auth routes
│   │   ├── login/                  # ✅ Login page with validation
│   │   ├── signup/                 # ✅ Registration page
│   │   ├── forgot-password/        # ✅ Password recovery
│   │   ├── reset-password/         # ✅ Password reset
│   │   └── verify-email/           # ✅ Email verification
│   │
│   ├── (dashboard)/                # 🔒 Protected user routes
│   │   ├── home/                   # ✅ User dashboard with stats
│   │   ├── groups/                 # ✅ Learning groups
│   │   │   ├── page.tsx            # Groups listing with filters
│   │   │   └── [id]/               # Dynamic group detail
│   │   ├── profile/                # ✅ User profile management
│   │   └── help/                   # ✅ Help & support
│   │
│   ├── admin/                      # 🛡️ Admin panel
│   │   ├── layout.tsx              # Admin layout with theme
│   │   ├── page.tsx                # ✅ Dashboard with stats
│   │   ├── analytics/              # ✅ Platform analytics
│   │   ├── users/                  # ✅ User management
│   │   ├── groups/                 # ✅ Group moderation
│   │   ├── sessions/               # ✅ Session management
│   │   └── resources/              # ✅ Resource management
│   │
│   ├── layout.tsx                  # Root layout (fonts, providers)
│   ├── page.tsx                    # ✅ Animated landing page
│   └── globals.css                 # Global styles & CSS variables
│
├── 📁 components/
│   ├── ui/                         # ✅ Base UI components
│   │   ├── Avatar.tsx              # User avatars with fallback
│   │   ├── Badge.tsx               # Status badges
│   │   ├── Button.tsx              # Button variants
│   │   ├── Card.tsx                # Card container
│   │   ├── Input.tsx               # Form inputs
│   │   ├── Modal.tsx               # Dialog modals
│   │   ├── Select.tsx              # Dropdown select
│   │   ├── Spinner.tsx             # Loading spinner
│   │   └── Textarea.tsx            # Text areas
│   │
│   ├── forms/                      # ✅ Form components
│   │   ├── LoginForm.tsx           # Login form with validation
│   │   └── SignupForm.tsx          # Signup form
│   │
│   ├── layout/                     # ✅ Layout components
│   │   ├── Footer.tsx              # Site footer
│   │   └── PageLayout.tsx          # Page wrapper
│   │
│   ├── Navigation.tsx              # ✅ Main navigation bar
│   ├── NotificationBell.tsx        # ✅ Notification dropdown
│   └── LanguageSelector.tsx        # ✅ Language switcher
│
├── 📁 context/                     # React Context providers
│   ├── LanguageContext.tsx         # ✅ i18n context
│   ├── ToastContext.tsx            # ✅ Toast notifications
│   ├── AdminThemeContext.tsx       # ✅ Admin dark/light theme
│   └── AdminToastContext.tsx       # ✅ Admin notifications
│
├── 📁 hooks/                       # ✅ Custom React hooks
│   ├── useAuth.ts                  # Authentication hook
│   ├── useGroups.ts                # Groups management
│   ├── useSocket.ts                # Socket.io connection
│   └── useUtils.ts                 # Utility functions
│
├── 📁 lib/                         # ✅ Core utilities
│   ├── api.ts                      # API configuration
│   ├── axios.ts                    # Axios instance with interceptors
│   ├── socket.ts                   # Socket.io client setup
│   ├── translations.ts             # 1400+ i18n translations
│   └── LanguageContext.tsx         # Language provider
│
├── 📁 services/                    # ✅ API service layer
│   ├── auth.service.ts             # Login, signup, password reset
│   ├── users.service.ts            # Profile, admin user management
│   ├── groups.service.ts           # CRUD, join/leave, members
│   ├── sessions.service.ts         # CRUD, scheduling
│   └── resources.service.ts        # CRUD, uploads
│
├── 📁 types/                       # ✅ TypeScript definitions
│   ├── user.ts                     # User, AuthUser, UserProfile
│   ├── group.ts                    # LearningGroup, GroupMember
│   ├── session.ts                  # Session, SessionParticipant
│   ├── resource.ts                 # Resource, ResourceType
│   ├── notification.ts             # Notification types
│   └── api.ts                      # API response types
│
├── 📁 constants/                   # ✅ App constants
│   └── index.ts                    # Categories, routes, messages
│
└── 📁 public/                      # Static assets
    └── icon.png                    # App icon
```

---

## 🏗 Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js 16)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐                │
│   │   Pages    │───▶│   Hooks    │───▶│  Context   │                │
│   │ (App Dir)  │    │ useAuth()  │    │  Providers │                │
│   └────────────┘    │ useGroups()│    └────────────┘                │
│         │           │ useSocket()│           │                       │
│         │           └────────────┘           │                       │
│         │                 │                  │                       │
│         │                 ▼                  │                       │
│         │    ┌───────────────────────────────────┐                  │
│         │    │         Services Layer            │                  │
│         │    │  auth | users | groups | sessions │                  │
│         │    │           resources               │                  │
│         │    └───────────────────────────────────┘                  │
│         │                   │                                        │
│         │                   ▼                                        │
│         │    ┌───────────────────────────────────┐                  │
│         │    │       Axios + Socket.io           │                  │
│         │    │  • HTTP requests with tokens      │                  │
│         │    │  • Real-time events               │                  │
│         │    │  • Auto reconnection              │                  │
│         │    └───────────────────────────────────┘                  │
│         │                   │                                        │
│         ▼                   │                                        │
│   ┌────────────┐            │                                        │
│   │    UI      │            │                                        │
│   │ Components │            │                                        │
│   └────────────┘            │                                        │
│                             │                                        │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Node.js)                           │
│                    (Express.js + MongoDB)                            │
│            https://github.com/dinethjanitha/saviya-learn-backend     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RootLayout
├── LanguageProvider (i18n context)
├── ToastProvider (notifications)
│
├── [Public Routes]
│   ├── LandingPage (animated hero, typewriter, counters)
│   └── AuthPages
│       ├── LoginPage
│       ├── SignupPage
│       ├── ForgotPasswordPage
│       ├── ResetPasswordPage
│       └── VerifyEmailPage
│
├── [Protected Routes - User]
│   └── Navigation
│       ├── HomePage (stats, activity, groups)
│       ├── GroupsPage → GroupDetailPage
│       ├── ProfilePage
│       └── HelpPage
│
└── [Protected Routes - Admin]
    └── AdminLayout (sidebar, theme toggle)
        ├── AdminDashboard (stats cards, quick actions)
        ├── AnalyticsPage
        ├── UsersPage
        ├── GroupsPage
        ├── SessionsPage
        └── ResourcesPage
```

---

## 📄 Pages & Routes

### Public Routes

| Route | Page | Features |
|-------|------|----------|
| `/` | Landing Page | Typewriter animation, trilingual hero, animated counters, feature cards, mobile responsive navigation |
| `/login` | Login | Email/password, show/hide toggle, forgot password link, validation |
| `/signup` | Sign Up | Name, email, password with validation |
| `/forgot-password` | Password Recovery | Email input with confirmation message |
| `/reset-password` | Password Reset | Token-based password reset |
| `/verify-email` | Email Verification | Token verification flow |

### Protected Routes (User)

| Route | Page | Features |
|-------|------|----------|
| `/home` | User Dashboard | Welcome message, stats cards (groups/resources/sessions), recent activity, quick actions, gamification badges |
| `/groups` | Groups Listing | Search, category filters, group cards with member count, join/leave buttons |
| `/groups/[id]` | Group Detail | Group info, members list, resources, sessions, admin controls |
| `/profile` | User Profile | Avatar, editable info, skills/interests, activity stats |
| `/help` | Help Center | FAQs, support information |

### Admin Routes

| Route | Page | Features |
|-------|------|----------|
| `/admin` | Admin Dashboard | Total users, active users, groups, sessions, resources stats, quick actions |
| `/admin/analytics` | Analytics | Platform-wide statistics and charts |
| `/admin/users` | User Management | List users, view details, activate/deactivate |
| `/admin/groups` | Group Management | Moderate groups, member management |
| `/admin/sessions` | Session Management | View/manage all sessions |
| `/admin/resources` | Resource Management | Content moderation, resource stats |

---

## 🧩 Component Library

All components are located in `components/ui/` with full TypeScript support:

### Form Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon` | Primary, secondary, outline, ghost, danger variants |
| `Input` | `label`, `error`, `leftIcon`, `rightIcon` | Text input with validation states |
| `Textarea` | `label`, `error`, `rows` | Multi-line text input |
| `Select` | `options`, `placeholder`, `error` | Dropdown select component |

### Display Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Card` | `variant` | Container with default, bordered, elevated styles |
| `Avatar` | `src`, `name`, `size` | User avatar with initials fallback |
| `Badge` | `variant` | Status indicators (success, warning, danger, info) |
| `Spinner` | `size` | Loading spinner animation |
| `Modal` | `isOpen`, `onClose`, `title`, `size` | Dialog modal with overlay |

### Layout Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Navigation` | `user` | Main navigation bar with notifications |
| `PageLayout` | `children` | Page wrapper with footer |
| `Footer` | - | Site footer with links |
| `LanguageSelector` | - | Language switcher dropdown |
| `NotificationBell` | `userId` | Real-time notification dropdown |

---

## 🪝 Custom Hooks

All hooks are located in `hooks/` with TypeScript types:

| Hook | Purpose | Usage |
|------|---------|-------|
| `useAuth()` | Authentication state & actions | `const { user, isAuthenticated, login, logout } = useAuth()` |
| `useGroups()` | Groups data & operations | `const { groups, isLoading, fetchGroups } = useGroups()` |
| `useSocket()` | Socket.io connection management | `const { socket, isConnected } = useSocket()` |
| `useUtils()` | Utility functions | `const { formatDate, truncate } = useUtils()` |

---

## 🔌 Services & API

### API Client (`lib/axios.ts`)

Production-ready Axios instance with:
- ✅ Automatic token attachment
- ✅ Request/response interceptors
- ✅ Token refresh handling
- ✅ Error normalization
- ✅ Base URL configuration

### Service Layer

Each service encapsulates API calls:

| Service | Methods |
|---------|---------|
| `authService` | `login`, `signup`, `logout`, `forgotPassword`, `resetPassword`, `verifyEmail`, `resendVerification`, `changePassword` |
| `usersService` | `getProfile`, `updateProfile`, `listUsers`, `getUserById`, `updateUser`, `deleteUser` |
| `groupsService` | `getAll`, `getById`, `create`, `update`, `delete`, `join`, `leave`, `getMembers`, `approveMember` |
| `sessionsService` | `getAll`, `getById`, `create`, `update`, `delete`, `join`, `leave` |
| `resourcesService` | `getAll`, `getById`, `create`, `update`, `delete`, `like`, `trackView` |

### API Endpoints

```typescript
// Authentication
POST   /auth/login              // User login
POST   /auth/register           // User registration
POST   /auth/forgot-password    // Request password reset
POST   /auth/reset-password     // Reset password
GET    /auth/verify-email/:token // Verify email
POST   /auth/resend-verification // Resend verification email
POST   /auth/change-password    // Change password

// Users
GET    /users/profile           // Get current user profile
PUT    /users/profile           // Update profile
GET    /users                   // List all users (admin)
GET    /users/:id               // Get user by ID
PUT    /users/:id               // Update user (admin)
DELETE /users/:id               // Delete user (admin)

// Groups
GET    /groups                  // List all groups
GET    /groups/my               // User's groups
GET    /groups/:id              // Get group details
POST   /groups                  // Create group
PUT    /groups/:id              // Update group
DELETE /groups/:id              // Delete group
POST   /groups/:id/join         // Join group
POST   /groups/:id/leave        // Leave group

// Sessions
GET    /sessions/list           // List sessions
GET    /sessions/:id            // Get session details
POST   /sessions                // Create session
PUT    /sessions/:id            // Update session
DELETE /sessions/:id            // Delete session

// Resources
GET    /resources               // List resources
GET    /resources/my            // User's resources
GET    /resources/:id           // Get resource details
POST   /resources               // Upload resource
PUT    /resources/:id           // Update resource
DELETE /resources/:id           // Delete resource

// Analytics (Admin)
GET    /analytics               // Platform statistics
GET    /activity-logs           // Activity logs
```

---

## 📦 State Management

### Context Providers

| Context | Purpose | Location |
|---------|---------|----------|
| `LanguageContext` | i18n translations & language switching | `lib/LanguageContext.tsx` |
| `ToastContext` | Toast notifications | `context/ToastContext.tsx` |
| `AdminThemeContext` | Admin panel dark/light mode | `context/AdminThemeContext.tsx` |
| `AdminToastContext` | Admin-specific notifications | `context/AdminToastContext.tsx` |

### Local Storage

- `token` - JWT authentication token
- `user` - Current user object
- `language` - Selected language (en/si/ta)

---

## 🗺 Roadmap

### Phase 1: Core MVP ✅ (Completed)
- [x] Project setup with Next.js 16 + TypeScript
- [x] UI component library (15+ components)
- [x] Authentication system (login, signup, password recovery)
- [x] User dashboard with stats & activity
- [x] Learning groups with categories & member management
- [x] Study sessions with scheduling
- [x] Resource library with multi-format support
- [x] Admin dashboard with analytics
- [x] Trilingual support (EN/SI/TA)
- [x] Real-time notifications with Socket.io

### Phase 2: Enhanced Features 🚧 (In Progress)
- [ ] Video conferencing integration (Jitsi/Zoom)
- [ ] Push notifications (FCM)
- [ ] Advanced search with filters
- [ ] Chat messaging system
- [ ] File upload improvements

### Phase 3: Mobile & Scale 📋 (Planned)
- [ ] React Native mobile app
- [ ] PWA support with offline mode
- [ ] AI-powered study recommendations
- [ ] Gamification & achievements
- [ ] Payment integration for premium features

### Phase 4: Polish & Launch 📋 (Planned)
- [ ] Unit & integration tests
- [ ] E2E tests with Playwright
- [ ] Performance optimization
- [ ] SEO enhancements
- [ ] Production deployment

---

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dinethjanitha/saviya-learn-mvp)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t saviyalearn .
docker run -p 3000:3000 saviyalearn
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes (follow conventional commits)
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Convention

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Dineth Janitha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👨‍💻 Developers

<div align="center">

<a href="https://github.com/dinethjanitha">
<img src="https://github.com/dinethjanitha.png" width="120" height="120" style="border-radius: 50%;" alt="Dineth Janitha"/>
</a>

### **Dineth Janitha**

*Software Engineer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dinethjanitha)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/dinethjanitha)

</div>
<br>

<div align="center">

<a href="https://github.com/Udai-Senevirathne">
<img src="https://github.com/Udai-Senevirathne.png" width="120" height="120" style="border-radius: 50%;" alt="Udai Senevirathne"/>
</a>

### **Udai Senevirathne**

*Software Engineering Undergraduate | Developer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Udai-Senevirathne)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/udaisenevirathne)

</div>

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Socket.io](https://socket.io/) - Real-time Communication
- [Lucide](https://lucide.dev/) - Beautiful Icons
- [Axios](https://axios-http.com/) - HTTP Client
- [Vercel](https://vercel.com/) - Deployment Platform

---

<div align="center">

**Built with ❤️ for Sri Lankan students**

🇱🇰 English • සිංහල • தமிழ் 🇱🇰

[⬆ Back to Top](#-saviyalearn)

</div>
