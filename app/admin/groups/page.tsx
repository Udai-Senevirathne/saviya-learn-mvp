'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken, clearToken } from '@/lib/api';

interface GroupMember {
  userId: string;
  role: string;
  joinedAt: string;
}

interface Group {
  _id: string;
  grade: string;
  subject: string;
  topic: string;
  description?: string;
  status: string;
  maxMembers: number;
  groupType: string;
  whatsappLink?: string;
  createdBy: {
    _id: string;
    name?: string;
    email: string;
  };
  members: GroupMember[];
  createdAt: string;
}

export default function GroupManagementPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, [searchQuery, statusFilter]);

  const fetchGroups = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      let url = `${API_BASE_URL}/groups?`;
      if (searchQuery) url += `q=${searchQuery}&`;
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
      setGroups(data.groups || []);
      setTotal(data.total || 0);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch groups');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const handleArchive = async (groupId: string) => {
    if (!confirm('Archive this group?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}?archive=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchGroups();
    } catch (err: any) {
      alert('Failed to archive group');
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Permanently delete this group? This cannot be undone!')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchGroups();
    } catch (err: any) {
      alert('Failed to delete group');
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (!confirm('Remove this member from the group?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        alert('Member removed');
        fetchGroups();
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(null);
        }
      }
    } catch (err: any) {
      alert('Failed to remove member');
    }
  };

  const handleChangeMemberRole = async (groupId: string, userId: string, newRole: string) => {
    if (!confirm(`Change member role to ${newRole}?`)) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        alert('Member role updated');
        fetchGroups();
      }
    } catch (err: any) {
      alert('Failed to change member role');
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const token = getToken();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      topic: formData.get('topic') as string,
      description: formData.get('description') as string,
      maxMembers: Number(formData.get('maxMembers')),
      groupType: formData.get('groupType') as string,
      status: formData.get('status') as string,
      whatsappLink: formData.get('whatsappLink') as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroup._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedGroup(null);
        fetchGroups();
        alert('Group updated successfully');
      }
    } catch (err: any) {
      alert('Failed to update group');
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
          <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Users
            </button>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Groups ({total})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{group.subject} - {group.topic}</div>
                      {group.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{group.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{group.grade}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {group.createdBy?.name || group.createdBy?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {group.members.length} / {group.maxMembers}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {group.groupType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => { setSelectedGroup(group); setShowEditModal(false); }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => { setSelectedGroup(group); setShowEditModal(true); }}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        Edit
                      </button>
                      {group.status === 'active' && (
                        <button
                          onClick={() => handleArchive(group._id)}
                          className="text-yellow-600 hover:text-yellow-800 text-xs"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(group._id)}
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

      {/* Group Detail Modal */}
      {selectedGroup && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedGroup.subject} - {selectedGroup.topic}</h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Grade</p>
                <p className="text-gray-900">{selectedGroup.grade}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-gray-900">{selectedGroup.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-gray-900">{selectedGroup.groupType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-gray-900">{selectedGroup.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Members</p>
                  <p className="text-gray-900">{selectedGroup.members.length} / {selectedGroup.maxMembers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-gray-900">{new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedGroup.whatsappLink && (
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp Link</p>
                  <a href={selectedGroup.whatsappLink} target="_blank" className="text-blue-600 hover:underline text-sm">
                    {selectedGroup.whatsappLink}
                  </a>
                </div>
              )}

              {/* Members List */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Members ({selectedGroup.members.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Joined</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedGroup.members.map((member) => (
                        <tr key={member.userId}>
                          <td className="px-4 py-2 text-sm text-gray-900">{member.userId}</td>
                          <td className="px-4 py-2 text-sm">
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeMemberRole(selectedGroup._id, member.userId, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-xs"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              onClick={() => handleRemoveMember(selectedGroup._id, member.userId)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {selectedGroup && showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Edit Group</h2>
              <button
                onClick={() => { setShowEditModal(false); setSelectedGroup(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  defaultValue={selectedGroup.grade}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  defaultValue={selectedGroup.subject}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  defaultValue={selectedGroup.topic}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedGroup.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                  <input
                    type="number"
                    name="maxMembers"
                    defaultValue={selectedGroup.maxMembers}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
                  <select
                    name="groupType"
                    defaultValue={selectedGroup.groupType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="invite-only">Invite Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={selectedGroup.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Link</label>
                <input
                  type="url"
                  name="whatsappLink"
                  defaultValue={selectedGroup.whatsappLink}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedGroup(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
