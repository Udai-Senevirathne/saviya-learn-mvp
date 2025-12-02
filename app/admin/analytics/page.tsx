'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken, clearToken } from '@/lib/api';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  suspendedUsers: number;
  adminCount: number;
  superadminCount: number;
  recentActivities: Array<{
    _id: string;
    userId: string;
    actionType: string;
    timestamp: string;
    details?: any;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearToken();
        router.push('/login');
        return;
      }

      const data = await response.json();
      setAnalytics(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Users
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}

        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Total Users</div>
              <div className="text-3xl font-bold text-gray-900">{analytics?.totalUsers || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Active Users</div>
              <div className="text-3xl font-bold text-green-600">{analytics?.activeUsers || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Suspended</div>
              <div className="text-3xl font-bold text-yellow-600">{analytics?.suspendedUsers || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Banned</div>
              <div className="text-3xl font-bold text-red-600">{analytics?.bannedUsers || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Admins</div>
              <div className="text-3xl font-bold text-purple-600">{analytics?.adminCount || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Super Admins</div>
              <div className="text-3xl font-bold text-indigo-600">{analytics?.superadminCount || 0}</div>
            </div>
          </div>
        </div>

        {/* User Distribution Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Status Distribution</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Active Users</span>
                  <span className="text-gray-600">
                    {analytics?.activeUsers || 0} ({Math.round(((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full" 
                    style={{ width: `${Math.round(((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Suspended Users</span>
                  <span className="text-gray-600">
                    {analytics?.suspendedUsers || 0} ({Math.round(((analytics?.suspendedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-600 h-3 rounded-full" 
                    style={{ width: `${Math.round(((analytics?.suspendedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Banned Users</span>
                  <span className="text-gray-600">
                    {analytics?.bannedUsers || 0} ({Math.round(((analytics?.bannedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-600 h-3 rounded-full" 
                    style={{ width: `${Math.round(((analytics?.bannedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Role Distribution</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">
                  {(analytics?.totalUsers || 0) - (analytics?.adminCount || 0) - (analytics?.superadminCount || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-2">Regular Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{analytics?.adminCount || 0}</div>
                <div className="text-sm text-gray-500 mt-2">Admins</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600">{analytics?.superadminCount || 0}</div>
                <div className="text-sm text-gray-500 mt-2">Super Admins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Last 10 Activities</h3>
            </div>
            
            <div className="p-6">
              {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivities.map((activity) => (
                    <div key={activity._id} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {activity.actionType.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          User ID: {activity.userId}
                        </div>
                        {activity.details && (
                          <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                            {JSON.stringify(activity.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
