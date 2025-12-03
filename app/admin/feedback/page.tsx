"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';
import { useAdminTheme, useAdminToast } from '@/context';

interface FeedbackItem {
  _id: string;
  user?: { _id: string; name?: string; email?: string } | null;
  name?: string;
  email?: string;
  type?: string;
  message?: string;
  rating?: number;
  status?: string;
  createdAt?: string;
}

export default function AdminFeedbackPage() {
  const { isDark } = useAdminTheme();
  const { showToast, showConfirm } = useAdminToast();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    const token = getToken();
    try {
      let url = `${API_BASE_URL}/feedback?page=${page}&limit=${limit}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (typeFilter) url += `&type=${encodeURIComponent(typeFilter)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedbacks(data.feedbacks || data.items || data.docs || []);
      setTotal(data.total || data.count || data.totalDocs || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load feedbacks';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, typeFilter, showToast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const analytics = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    feedbacks.forEach((f) => {
      const s = f.status || 'open';
      const t = f.type || 'general';
      byStatus[s] = (byStatus[s] || 0) + 1;
      byType[t] = (byType[t] || 0) + 1;
    });
    return { byStatus, byType };
  }, [feedbacks]);

  const handleToggleStatus = async (id: string, current?: string) => {
    const next = current === 'closed' ? 'open' : 'closed';
    const confirmed = await showConfirm({
      title: 'Change Status',
      message: `Change status to "${next}"?`,
      confirmText: 'Change',
      cancelText: 'Cancel',
      type: 'info',
    });
    if (!confirmed) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        showToast('Status updated', 'success');
        fetchFeedbacks();
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.message || 'Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Feedback',
      message: 'Permanently delete this feedback?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Feedback deleted', 'success');
        fetchFeedbacks();
        setSelected(null);
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback & Analytics</h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>View user feedback and quick analytics</p>
        </div>
      </div>

      {/* Analytics */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-4 shadow-xl`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Total Feedbacks</h3>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{total}</div>
          </div>
          <div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>By Status</h3>
            <div className="space-y-2 mt-2">
              {Object.entries(analytics.byStatus).length === 0 && <div className={isDark ? 'text-slate-400' : 'text-gray-500'}>No data</div>}
              {Object.entries(analytics.byStatus).map(([s, c]) => (
                <div key={s} className="flex items-center gap-3 text-gray-500">
                  <div className="w-28 text-sm capitalize ">{s}</div>
                  <div className="flex-1 bg-gray-100/40 rounded-full h-3 overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${Math.min(100, (c / Math.max(1, total)) * 100)}%` }} />
                  </div>
                  <div className="w-10 text-right text-sm">{c}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>By Type</h3>
            <div className="space-y-2 mt-2">
              {Object.entries(analytics.byType).length === 0 && <div className={isDark ? 'text-slate-400' : 'text-gray-500'}>No data</div>}
              {Object.entries(analytics.byType).map(([t, c]) => (
                <div key={t} className="flex items-center gap-3 text-gray-500">
                  <div className="w-28 text-sm capitalize">{t}</div>
                  <div className="flex-1 bg-gray-100/40 rounded-full h-3 overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-green-400 to-blue-500" style={{ width: `${Math.min(100, (c / Math.max(1, total)) * 100)}%` }} />
                  </div>
                  <div className="w-10 text-right text-sm">{c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Table */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-4 shadow-xl`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Search</label>
            <input className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg`} placeholder="Search name, email or message" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Status</label>
            <select className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Type</label>
            <select className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg`} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All</option>
              <option value="general">General</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setSearchQuery(''); setStatusFilter(''); setTypeFilter(''); setPage(1); }} className={`${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg`}>Clear</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Name</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Email</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Type</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Rating</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Status</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Submitted</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} uppercase`}>Actions</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-gray-200'}>
                {feedbacks.map((f) => (
                  <tr key={f._id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                    <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.name || f.user?.name || 'Anonymous'}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{f.email || f.user?.email || '—'}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{f.type || 'general'}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{f.rating ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${f.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>{f.status || 'open'}</span>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={() => setSelected(f)} className="text-blue-400 hover:text-blue-300 text-xs">View</button>
                      <button onClick={() => handleToggleStatus(f._id, f.status)} className="text-green-400 hover:text-green-300 text-xs">Toggle</button>
                      <button onClick={() => handleDelete(f._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>Showing {feedbacks.length} of {total}</div>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>Prev</button>
            <button disabled={feedbacks.length < limit} onClick={() => setPage((p) => p + 1)} className={`px-3 py-1 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>Next</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4 shadow-2xl`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name || selected.user?.name || 'Anonymous'}</h2>
              <button onClick={() => setSelected(null)} className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} text-xl`}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Email</p>
                <p className={isDark ? 'text-white' : 'text-gray-900'}>{selected.email || selected.user?.email || '—'}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Type</p>
                <p className={isDark ? 'text-white' : 'text-gray-900'}>{selected.type}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Rating</p>
                <p className={isDark ? 'text-white' : 'text-gray-900'}>{selected.rating ?? '—'}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Message</p>
                <div className={`${isDark ? 'text-slate-200' : 'text-gray-900'} whitespace-pre-wrap p-3 rounded border ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>{selected.message}</div>
              </div>

              <div className="flex gap-3 mt-4 flex-col sm:flex-row">
                <button onClick={() => handleToggleStatus(selected._id, selected.status)} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded">Toggle Status</button>
                <button onClick={() => handleDelete(selected._id)} className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                <button onClick={() => setSelected(null)} className={`w-full sm:w-auto px-4 py-2 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'} rounded`}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
