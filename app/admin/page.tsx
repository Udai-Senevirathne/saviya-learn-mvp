'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';
import Link from 'next/link';
import { useAdminTheme, useAdminToast } from '@/context';
import { useRouter} from 'next/navigation';


interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalSessions: number;
  totalResources: number;
  recentActivities: Array<{
    _id: string;
    actionType: string;
    timestamp: string;
    userId?: string;
  }>;
}



export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useAdminTheme();
  const { showToast } = useAdminToast();
  const  router  = useRouter()
  
  useEffect(() => {
    if(localStorage.getItem("accessToken") == null || localStorage.getItem("accessToken") === undefined) {
      router.push("/login");
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        showToast('Failed to load dashboard stats', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      showToast('Failed to connect to server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Learning Groups',
      value: stats?.totalGroups || 0,
      icon: '📚',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Study Sessions',
      value: stats?.totalSessions || 0,
      icon: '🎓',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Resources',
      value: stats?.totalResources || 0,
      icon: '📖',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
    },
  ];

  const quickActions = [
    { name: 'Add User', icon: '➕', href: '/admin/users' },
    { name: 'Create Group', icon: '📁', href: '/admin/groups' },
    { name: 'View Reports', icon: '📊', href: '/admin/analytics' },
    { name: 'Manage Sessions', icon: '📅', href: '/admin/sessions' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-blue-500' : 'border-indigo-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-indigo-100">
          Monitor and manage your SaviyaLearn platform from this central hub.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div
                className={`w-2 h-2 rounded-full bg-linear-to-r ${stat.color}`}
              ></div>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-6 shadow-md`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-transparent transition group ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200'}`}
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`lg:col-span-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-6 shadow-md`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity._id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>📌</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activity.actionType.replace(/_/g, ' ')}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              <span className="text-4xl mb-2 block">📭</span>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Status */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-6 shadow-md`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>API Server</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Database</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Socket Server</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Service</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
