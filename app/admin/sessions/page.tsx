'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken, clearToken } from '@/lib/api';

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
  statusCounts: {
    counts: Record<string, number>;
  };
  attendanceStats: {
    stats: {
      avgAttendance: number;
      minAttendance: number;
      maxAttendance: number;
      totalSessions: number;
    };
  };
  recentSessions: {
    sessions: Session[];
  };
}

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const fetchSessions = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      let url = `${API_BASE_URL}/sessions/admin/list?`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearToken();
        router.push('/login');
        return;
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setTotal(data.total || 0);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const [statusRes, attendanceRes, recentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sessions/analytics/status-counts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/sessions/analytics/attendance`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/sessions/analytics/recent`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const [statusData, attendanceData, recentData] = await Promise.all([
        statusRes.json(),
        attendanceRes.json(),
        recentRes.json(),
      ]);

      setAnalytics({
        statusCounts: statusData,
        attendanceStats: attendanceData,
        recentSessions: recentData,
      });
      setShowAnalytics(true);
    } catch (err: any) {
      alert('Failed to fetch analytics');
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
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
    } catch (err: any) {
      alert('Failed to delete session');
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    if (!confirm(`Update session status to ${status}?`)) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/admin/update-status`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId, status }),
      });
      if (response.ok) {
        fetchSessions();
        setSelectedSession(null);
        alert('Status updated');
      }
    } catch (err: any) {
      alert('Failed to update status');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <div className="space-x-4">
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              View Analytics
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Users
            </button>
            <button
              onClick={() => router.push('/admin/groups')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Groups
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setStatusFilter('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Sessions ({total})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.groupId ? `${session.groupId.subject} - ${session.groupId.topic}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {session.teacherId?.name || session.teacherId?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {session.status || 'scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {session.attendees?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(session._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Session Details</h2>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Group</p>
                  <p className="text-gray-900">
                    {selectedSession.groupId ? `${selectedSession.groupId.subject} - ${selectedSession.groupId.topic}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teacher</p>
                  <p className="text-gray-900">
                    {selectedSession.teacherId?.name || selectedSession.teacherId?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <select
                    value={selectedSession.status || 'scheduled'}
                    onChange={(e) => handleUpdateStatus(selectedSession._id, e.target.value)}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Attendees</p>
                  <p className="text-gray-900">{selectedSession.attendees?.length || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Meeting Link</p>
                {selectedSession.meetingLink ? (
                  <a href={selectedSession.meetingLink} target="_blank" className="text-blue-600 hover:underline text-sm">
                    {selectedSession.meetingLink}
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No meeting link</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-gray-900">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                {selectedSession.startedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Started</p>
                    <p className="text-gray-900">{new Date(selectedSession.startedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedSession.endedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Ended</p>
                  <p className="text-gray-900">{new Date(selectedSession.endedAt).toLocaleString()}</p>
                </div>
              )}

              {/* Attendees List */}
              {selectedSession.attendees && selectedSession.attendees.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Attendees ({selectedSession.attendees.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Joined</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Left</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedSession.attendees.map((attendee, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{attendee.userId}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {new Date(attendee.joinedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {attendee.leftAt ? new Date(attendee.leftAt).toLocaleString() : 'Still in session'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Session Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Counts */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sessions by Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.statusCounts.counts || {}).map(([status, count]) => (
                    <div key={status} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1 capitalize">{status}</div>
                      <div className="text-3xl font-bold text-gray-900">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Stats */}
              {analytics.attendanceStats.stats && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attendance Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-600 mb-1">Avg Attendance</div>
                      <div className="text-3xl font-bold text-blue-900">
                        {analytics.attendanceStats.stats.avgAttendance?.toFixed(1) || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-green-600 mb-1">Min Attendance</div>
                      <div className="text-3xl font-bold text-green-900">
                        {analytics.attendanceStats.stats.minAttendance || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-purple-600 mb-1">Max Attendance</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {analytics.attendanceStats.stats.maxAttendance || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">Total Sessions</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {analytics.attendanceStats.stats.totalSessions || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Sessions (Last 7 Days) */}
              {analytics.recentSessions.sessions && analytics.recentSessions.sessions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Sessions (Last 7 Days)</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-4">
                    {analytics.recentSessions.sessions.length} sessions
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Group</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Attendees</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analytics.recentSessions.sessions.map((session) => (
                          <tr key={session._id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {session.groupId ? `${session.groupId.subject} - ${session.groupId.topic}` : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {session.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{session.attendees?.length || 0}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
