"use client";

import { useEffect, useState } from 'react';
import axios, { getUser } from '@/lib/axios';
import Navigation from '@/components/Navigation';
import { LanguageProvider } from '@/lib/LanguageContext';
import { useToast } from '@/context';
import { formatDistanceToNowStrict } from 'date-fns';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const user = getUser();
  // no local translations used here
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/notifications?page=${page}&limit=${limit}`);
      const data = res.data || {};
      setNotifications(data.notifications || data.items || []);
      setTotal(data.total || data.count || data.totalDocs || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
      showToast('Failed to load notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
      showToast('Marked read', 'success');
    } catch (err) {
      console.error('Mark read failed', err);
      showToast('Failed to mark as read', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/notifications/read/all');
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked read', 'success');
    } catch (err) {
      console.error('Mark all failed', err);
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleClick = async (n: NotificationItem) => {
    if (!n.read) await markAsRead(n._id);
    if (n.link) window.location.href = n.link;
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation user={user} />
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-3">
              <button onClick={markAllRead} className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md text-sm">Mark all read</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            {isLoading ? (
              <div className="py-12 text-center">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No notifications</div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <div key={n._id} className={`py-3 px-2 sm:px-4 cursor-pointer ${n.read ? '' : 'bg-blue-50'} rounded mb-2`} onClick={() => handleClick(n)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="text-xl leading-none">🔔</div>
                          <div className="min-w-0">
                            <div className={`text-sm font-medium ${n.read ? 'text-gray-800' : 'text-gray-900'}`}>{n.title}</div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{n.createdAt ? formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true }) : ''}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {!n.read && (
                        <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }} className="text-xs text-blue-600">Mark read</button>
                      )}
                      {n.link && (
                        <a href={n.link} onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-600">Open</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Showing {notifications.length} of {total}</div>
              <div className="space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded bg-gray-100 text-sm">Prev</button>
                <button disabled={notifications.length < limit} onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded bg-gray-100 text-sm">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}
