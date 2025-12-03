'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { clearToken } from '@/lib/api';
import { getToken, getUser } from '@/lib/axios';
import { AdminThemeProvider, useAdminTheme, AdminToastProvider, useAdminToast } from '@/context';

interface User {
  _id: string;
  email: string;
  role: string;
  profile?: {
    name?: string;
  };
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '🏠' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📊' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Groups', href: '/admin/groups', icon: '📚' },
  { name: 'Resources', href: '/admin/resources', icon: '📖' },
  { name: 'Sessions', href: '/admin/sessions', icon: '🎓' },
  { name: 'Feedback', href: '/admin/feedback', icon: '📝' },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isDark, toggleTheme } = useAdminTheme();
  const { showToast } = useAdminToast();

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const userData = getUser() as User | null;

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      if (userData.role !== 'admin' && userData.role !== 'superadmin') {
        router.push('/home');
        return;
      }

      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    clearToken();
    showToast('Logged out successfully', 'success');
    router.push('/login');
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    showToast('Refreshing data...', 'info', 2000);
    
    // Trigger a page refresh by re-navigating
    router.refresh();
    
    // Simulate refresh delay for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data refreshed successfully!', 'success');
    }, 1000);
  }, [router, showToast]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-blue-500' : 'border-indigo-600'}`}></div>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-900' : 'bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} border-r shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              S
            </div>
            {sidebarOpen && (
              <div>
                <h1 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>SaviyaLearn</h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : isDark 
                          ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && <span className="font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.profile?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.profile?.name || 'Admin'}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-4 border-t ${isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700' : 'border-gray-200 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'} transition flex items-center justify-center`}
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'} border-b shadow-sm px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {navItems.find((item) => item.href === pathname)?.name || 'Admin'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-xl transition ${isDark ? 'bg-slate-700 text-blue-400 hover:bg-slate-600' : 'bg-gray-100 text-blue-600 hover:bg-blue-50'} ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Data"
              >
                <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition ${isDark ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  user?.role === 'superadmin'
                    ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {user?.role}
              </span>
              <button
                onClick={() => router.push('/home')}
                className={`px-4 py-2 text-sm rounded-xl transition font-medium ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-linear-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition font-medium shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminToastProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminToastProvider>
    </AdminThemeProvider>
  );
}
