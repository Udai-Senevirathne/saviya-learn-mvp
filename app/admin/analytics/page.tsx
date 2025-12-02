'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';
import { useAdminTheme } from '@/context';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  suspendedUsers: number;
  adminCount: number;
  superadminCount: number;
  totalGroups: number;
  totalSessions: number;
  totalResources: number;
  activeSessions: number;
  scheduledSessions: number;
  completedSessions: number;
  recentActivities: Array<{
    _id: string;
    userId: string;
    actionType: string;
    timestamp: string;
    details?: Record<string, unknown>;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDark } = useAdminTheme();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-blue-500' : 'border-indigo-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>View platform statistics and metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Users</div>
          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics?.totalUsers || 0}</div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Active Users</div>
          <div className="text-3xl font-bold text-green-500">{analytics?.activeUsers || 0}</div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Suspended</div>
          <div className="text-3xl font-bold text-yellow-500">{analytics?.suspendedUsers || 0}</div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Banned</div>
          <div className="text-3xl font-bold text-red-500">{analytics?.bannedUsers || 0}</div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Admins</div>
          <div className="text-3xl font-bold text-purple-500">{analytics?.adminCount || 0}</div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-5 shadow-md`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Super Admins</div>
          <div className="text-3xl font-bold text-indigo-500">{analytics?.superadminCount || 0}</div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-6 shadow-md`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Total Learning Groups</div>
                <div className="text-3xl font-bold text-blue-500">{analytics?.totalGroups || 0}</div>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Total Sessions</div>
                <div className="text-3xl font-bold text-purple-500">{analytics?.totalSessions || 0}</div>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Total Resources</div>
                <div className="text-3xl font-bold text-green-500">{analytics?.totalResources || 0}</div>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Active Sessions</div>
                <div className="text-3xl font-bold text-orange-500">{analytics?.activeSessions || 0}</div>
              </div>
              <div className="text-4xl">🔴</div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Scheduled Sessions</div>
                <div className="text-3xl font-bold text-yellow-500">{analytics?.scheduledSessions || 0}</div>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Completed Sessions</div>
                <div className="text-3xl font-bold text-cyan-500">{analytics?.completedSessions || 0}</div>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Distribution */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-6 shadow-md`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Status Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Active Users</span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                {analytics?.activeUsers || 0} ({Math.round(((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div 
                className="bg-linear-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Suspended Users</span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                {analytics?.suspendedUsers || 0} ({Math.round(((analytics?.suspendedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div 
                className="bg-linear-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(((analytics?.suspendedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Banned Users</span>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                {analytics?.bannedUsers || 0} ({Math.round(((analytics?.bannedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div 
                className="bg-linear-to-r from-red-500 to-rose-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(((analytics?.bannedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-6 shadow-md`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Role Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`text-center p-4 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(analytics?.totalUsers || 0) - (analytics?.adminCount || 0) - (analytics?.superadminCount || 0)}
            </div>
            <div className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Regular Users</div>
          </div>
          <div className={`text-center p-4 rounded-xl border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
            <div className="text-4xl font-bold text-purple-500">{analytics?.adminCount || 0}</div>
            <div className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Admins</div>
          </div>
          <div className={`text-center p-4 rounded-xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
            <div className="text-4xl font-bold text-indigo-500">{analytics?.superadminCount || 0}</div>
            <div className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Super Admins</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl shadow-md`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
        </div>
        
        <div className="p-6">
          {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivities.map((activity) => (
                <div key={activity._id} className={`flex items-start space-x-3 border-b pb-3 last:border-b-0 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>📋</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activity.actionType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>•</span>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      User ID: {activity.userId}
                    </div>
                    {activity.details && (
                      <div className={`text-xs mt-1 p-2 rounded-lg font-mono border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        {JSON.stringify(activity.details, null, 2)}
                      </div>
                    )}
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
    </div>
  );
}
