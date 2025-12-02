'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import Navigation from '@/components/Navigation';

interface DashboardStats {
  statistics: {
    groupCount: number;
    sessionCount: number;
    activeSessions: number;
    resourceCount: number;
  };
  groups: Array<{
    _id: string;
    subject: string;
    topic: string;
    grade: string;
    memberCount: number;
  }>;
  recentActivity: Array<{
    _id: string;
    actionType: string;
    details: any;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/users/dashboard');
      setStats(response.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.profile?.name || user?.email}!</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              My Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Groups</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.statistics.groupCount || 0}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.statistics.sessionCount || 0}</p>
              </div>
              <div className="text-4xl">🎓</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.statistics.activeSessions || 0}</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resources</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.statistics.resourceCount || 0}</p>
              </div>
              <div className="text-4xl">📖</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* My Groups */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Learning Groups</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            {stats?.groups && stats.groups.length > 0 ? (
              <div className="space-y-3">
                {stats.groups.slice(0, 5).map((group) => (
                  <div 
                    key={group._id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{group.subject}</h3>
                        <p className="text-sm text-gray-600">{group.topic}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Grade {group.grade}
                          </span>
                          <span className="text-xs text-gray-500">
                            {group.memberCount} members
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl">👥</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 mb-4">You haven't joined any groups yet</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Explore Groups
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 8).map((activity) => {
                  const actionIcons: { [key: string]: string } = {
                    'joined_group': '✅',
                    'left_group': '👋',
                    'joined_session': '🎓',
                    'uploaded_resource': '📤',
                    'created_group': '🎉',
                    'completed_session': '✨',
                  };

                  return (
                    <div 
                      key={activity._id} 
                      className="flex items-start gap-3 border-l-2 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition"
                    >
                      <div className="text-xl">
                        {actionIcons[activity.actionType] || '📌'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {activity.actionType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                Explore Groups
              </div>
            </button>

            <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">➕</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                Create Group
              </div>
            </button>

            <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📤</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Share Resource
              </div>
            </button>

            <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                Schedule Session
              </div>
            </button>
          </div>
        </div>

        {/* User Reputation Section */}
        {user?.reputation && (
          <div className="mt-8 bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Your Impact 🌟</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{user.reputation.points || 0}</p>
                <p className="text-sm text-indigo-100">Reputation Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{user.reputation.sessionsTaught || 0}</p>
                <p className="text-sm text-indigo-100">Sessions Taught</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{user.reputation.resourcesShared || 0}</p>
                <p className="text-sm text-indigo-100">Resources Shared</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
