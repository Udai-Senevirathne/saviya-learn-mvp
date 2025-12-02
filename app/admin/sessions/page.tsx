'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';
import { useAdminTheme } from '@/context';

interface Session {
  _id: string;
  user?: string;
  groupId?: {
    _id: string;
    subject: string;
    topic: string;
  };
  teacherId?: {
    _id: string;
    name?: string;
    email: string;
  };
  status: string;
  meetingLink?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  attendees: Array<{
    userId: string;
    joinedAt: string;
    leftAt?: string;
  }>;
}

interface SessionAnalytics {
  statusCounts: Record<string, number>;
  avgAttendance: number;
  totalSessions: number;
}

export default function SessionManagementPage() {
  const { isDark } = useAdminTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchSessions = useCallback(async () => {
    const token = getToken();
    try {
      let url = `${API_BASE_URL}/sessions/admin/list?`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setSessions(data.sessions || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchAnalytics = async () => {
    const token = getToken();
    try {
      const [statusRes, attendanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sessions/analytics/status-counts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/sessions/analytics/attendance`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const [statusData, attendanceData] = await Promise.all([
        statusRes.json(),
        attendanceRes.json(),
      ]);

      setAnalytics({
        statusCounts: statusData.counts || {},
        avgAttendance: attendanceData.stats?.avgAttendance || 0,
        totalSessions: attendanceData.stats?.totalSessions || 0,
      });
      setShowAnalytics(true);
    } catch {
      alert('Failed to fetch analytics');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Delete this session permanently?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/admin/delete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId }),
      });
      if (response.ok) {
        fetchSessions();
        setSelectedSession(null);
      }
    } catch {
      alert('Failed to delete session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'active': return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'completed': return isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-600';
      case 'cancelled': return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      default: return isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Session Management</h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Manage study sessions and schedules</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            📊 Analytics
          </button>
          <button
            onClick={fetchSessions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl max-w-lg w-full p-6 mx-4 shadow-2xl`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Session Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} text-xl`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analytics.totalSessions}</p>
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>Total Sessions</p>
                </div>
                <div className={`${isDark ? 'bg-blue-500/20' : 'bg-blue-50'} rounded-lg p-4 text-center`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{analytics.avgAttendance.toFixed(1)}</p>
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>Avg Attendance</p>
                </div>
              </div>

              <div>
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium mb-3`}>Status Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-4 shadow-xl`}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition`}
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl overflow-hidden shadow-xl`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Sessions ({total})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-slate-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Group</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Teacher</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Attendees</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Created</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Actions</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-gray-200'}>
              {sessions.map((session) => (
                <tr key={session._id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 text-sm">
                    {typeof session.groupId === 'object' && session.groupId ? (
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{session.groupId.subject}</div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{session.groupId.topic}</div>
                      </div>
                    ) : (
                      <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>N/A</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    {typeof session.teacherId === 'object' && session.teacherId
                      ? (session.teacherId.name || session.teacherId.email)
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    {session.attendees?.length || 0}
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <span className="text-4xl mb-2 block">📅</span>
            <p>No sessions found</p>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4 shadow-2xl`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Session Details</h2>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                  {selectedSession.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} text-xl`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Group</p>
                  {typeof selectedSession.groupId === 'object' && selectedSession.groupId ? (
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedSession.groupId.subject} - {selectedSession.groupId.topic}</p>
                  ) : (
                    <p className={isDark ? 'text-slate-500' : 'text-gray-400'}>N/A</p>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Teacher</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>
                    {typeof selectedSession.teacherId === 'object' && selectedSession.teacherId
                      ? (selectedSession.teacherId.name || selectedSession.teacherId.email)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Created</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                {selectedSession.startedAt && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Started</p>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{new Date(selectedSession.startedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedSession.endedAt && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Ended</p>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{new Date(selectedSession.endedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedSession.meetingLink && (
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Meeting Link</p>
                  <a 
                    href={selectedSession.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedSession.meetingLink}
                  </a>
                </div>
              )}

              {/* Attendees */}
              <div>
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium mb-3`}>Attendees ({selectedSession.attendees?.length || 0})</h3>
                {selectedSession.attendees && selectedSession.attendees.length > 0 ? (
                  <div className={`border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-lg overflow-hidden`}>
                    <table className="w-full">
                      <thead className={isDark ? 'bg-slate-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>User ID</th>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Joined</th>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Left</th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-gray-200'}>
                        {selectedSession.attendees.map((attendee, index) => (
                          <tr key={index} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>{attendee.userId}</td>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                              {new Date(attendee.joinedAt).toLocaleTimeString()}
                            </td>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                              {attendee.leftAt ? new Date(attendee.leftAt).toLocaleTimeString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm`}>No attendees recorded</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedSession(null)}
                className={`px-4 py-2 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition`}
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(selectedSession._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
