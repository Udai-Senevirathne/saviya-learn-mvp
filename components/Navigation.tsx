'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearToken } from '@/lib/axios';
import NotificationBell from './NotificationBell';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from './LanguageSelector';

// Hydration-safe mounted state
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface NavigationProps {
  user: {
    id?: string;
    _id?: string;
    email: string;
    profile?: {
      name?: string;
      avatar?: string;
    };
    role?: string;
  };
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoaded = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const userId = user.id || user._id || '';
  const userName = user.profile?.name || user.email;
  const userInitial = userName.charAt(0).toUpperCase();

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: '' },
    { href: '/groups', label: t('nav.groups'), icon: '' },
    { href: '/help', label: t('nav.help'), icon: '' },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin/analytics', label: t('nav.admin'), icon: '' });
  }

  return (
    <header className={`bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-40 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform duration-300"></div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
              {t('common.appName')}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? 'bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Language + Notifications + User Menu */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notification Bell */}
            <NotificationBell userId={userId} />

            {/* User Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              >
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all duration-300">
                  {userInitial}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 transform ${
                isDropdownOpen 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible -translate-y-2'
              }`}>
                <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <div className="font-semibold text-gray-900 truncate">{userName}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  {isAdmin && (
                    <div className="mt-2">
                      <span className="text-xs bg-linear-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full font-medium">
                         {t('nav.admin')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="py-2">
                  <button
                    onClick={() => { router.push('/profile'); setIsDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-all duration-200 hover:translate-x-1"
                  >
                    <span></span>
                    <span>{t('nav.profile')}</span>
                  </button>
                  <button
                    onClick={() => { router.push('/notifications'); setIsDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 md:hidden transition-all duration-200 hover:translate-x-1"
                  >
                    <span></span>
                    <span>{t('nav.notifications')}</span>
                  </button>
                  
                  {/* Mobile Language Selector */}
                  <div className="sm:hidden px-4 py-2.5">
                    <div className="flex items-center gap-3 text-gray-700 mb-2">
                      <span></span>
                      <span>{t('language.label')}</span>
                    </div>
                    <LanguageSelector />
                  </div>
                  
                  <div className="my-2 border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all duration-200 hover:translate-x-1"
                  >
                    <span></span>
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
