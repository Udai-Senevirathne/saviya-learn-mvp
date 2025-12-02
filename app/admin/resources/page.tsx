'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken, clearToken } from '@/lib/api';

interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: string;
  link: string;
  groupId: {
    _id: string;
    subject: string;
    topic: string;
  } | string;
  uploadedBy: {
    _id: string;
    name?: string;
    email: string;
  } | string;
  views: number;
  createdAt: string;
}

interface ResourceAnalytics {
  totalResources: number;
  recentResources: number;
  topViewed: Resource[];
  topUploaders: Array<{
    _id: string;
    count: number;
  }>;
}

export default function ResourceManagementPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', link: '' });
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchResources();
    }
  }, [searchQuery, selectedGroupId]);

  const fetchGroups = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/groups?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearToken();
        router.push('/login');
        return;
      }

      const data = await response.json();
      setGroups(data.groups || []);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch groups');
      setIsLoading(false);
    }
  };

  const fetchResources = async () => {
    const token = getToken();
    if (!token || !selectedGroupId) return;

    try {
      let url = `${API_BASE_URL}/resources/group/${selectedGroupId}?`;
      if (searchQuery) url += `q=${searchQuery}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearToken();
        router.push('/login');
        return;
      }

      const data = await response.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources');
    }
  };

  const fetchAnalytics = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/resource-analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setShowAnalytics(true);
      }
    } catch (err: any) {
      alert('Failed to fetch analytics');
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const handleView = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const handleEdit = (resource: Resource) => {
    setEditForm({
      title: resource.title,
      description: resource.description || '',
      link: resource.link,
    });
    setSelectedResource(resource);
    setShowEditModal(true);
  };

  const handleUpdateResource = async () => {
    if (!selectedResource) return;
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/resources/${selectedResource._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedResource(null);
        fetchResources();
        alert('Resource updated successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update resource');
      }
    } catch (err: any) {
      alert('Failed to update resource');
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Delete this resource permanently?')) return;
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchResources();
        setSelectedResource(null);
        alert('Resource deleted successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete resource');
      }
    } catch (err: any) {
      alert('Failed to delete resource');
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
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
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
              onClick={() => router.push('/admin/sessions')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Sessions
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Group --</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.subject} - {group.topic} (Grade {group.grade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, link..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!selectedGroupId}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroupId('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        {selectedGroupId ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Resources ({total})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resources.map((resource) => (
                    <tr key={resource._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{resource.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{resource.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {typeof resource.uploadedBy === 'object'
                          ? resource.uploadedBy.name || resource.uploadedBy.email
                          : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{resource.views}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleView(resource)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(resource)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(resource._id)}
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
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Please select a group to view resources
          </div>
        )}
      </main>

      {/* View Resource Modal */}
      {selectedResource && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Resource Details</h2>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Title</p>
                <p className="text-gray-900">{selectedResource.title}</p>
              </div>

              {selectedResource.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900">{selectedResource.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-gray-900">{selectedResource.type}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Link</p>
                <a
                  href={selectedResource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {selectedResource.link}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Views</p>
                  <p className="text-gray-900">{selectedResource.views}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {new Date(selectedResource.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Group</p>
                <p className="text-gray-900">
                  {typeof selectedResource.groupId === 'object'
                    ? `${selectedResource.groupId.subject} - ${selectedResource.groupId.topic}`
                    : selectedResource.groupId}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Uploaded By</p>
                <p className="text-gray-900">
                  {typeof selectedResource.uploadedBy === 'object'
                    ? selectedResource.uploadedBy.name || selectedResource.uploadedBy.email
                    : selectedResource.uploadedBy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Edit Resource</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedResource(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link *</label>
                <input
                  type="url"
                  value={editForm.link}
                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedResource(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateResource}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Resource Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-600 mb-1">Total Resources</div>
                  <div className="text-3xl font-bold text-blue-900">{analytics.totalResources}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-600 mb-1">Added (Last 7 Days)</div>
                  <div className="text-3xl font-bold text-green-900">{analytics.recentResources}</div>
                </div>
              </div>

              {/* Top Viewed Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Top 10 Most Viewed Resources</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rank</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Views</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.topViewed.map((resource, index) => (
                        <tr key={resource._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{resource.title}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{resource.views}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(resource.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Uploaders */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Top 5 Most Active Uploaders</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rank</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Resources Uploaded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.topUploaders.map((uploader, index) => (
                        <tr key={uploader._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{uploader._id}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{uploader.count}</td>
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
    </div>
  );
}
