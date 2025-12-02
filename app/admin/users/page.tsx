'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken, clearToken } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  profile: {
    name: string;
    country?: string;
    region?: string;
  };
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearToken();
        router.push('/login');
        return;
      }

      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err: any) {
      alert('Failed to delete user');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Ban this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchUsers();
    } catch (err: any) {
      alert('Failed to ban user');
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspend this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchUsers();
    } catch (err: any) {
      alert('Failed to suspend user');
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Reactivate this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reactivate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchUsers();
    } catch (err: any) {
      alert('Failed to reactivate user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) fetchUsers();
    } catch (err: any) {
      alert('Failed to change role');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword }),
      });
      if (response.ok) {
        alert('Password reset successful');
      }
    } catch (err: any) {
      alert('Failed to reset password');
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/admin/analytics')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Analytics
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Users ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quick Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.profile?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.emailVerified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-gray-400">Not verified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.profile?.country || 'N/A'}
                      {user.profile?.region && `, ${user.profile.region}`}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => handleBan(user._id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Ban
                        </button>
                      )}
                      {user.status !== 'suspended' && user.status !== 'banned' && (
                        <button
                          onClick={() => handleSuspend(user._id)}
                          className="text-yellow-600 hover:text-yellow-800 text-xs"
                        >
                          Suspend
                        </button>
                      )}
                      {(user.status === 'suspended' || user.status === 'banned') && (
                        <button
                          onClick={() => handleReactivate(user._id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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
    </div>
  );
}
