'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';
import { useAdminTheme } from '@/context';

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

interface Group {
  _id: string;
  subject: string;
  topic: string;
}

export default function ResourceManagementPage() {
  const { isDark } = useAdminTheme();
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', link: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchResources = useCallback(async () => {
    const token = getToken();
    if (!selectedGroupId) return;

    try {
      let url = `${API_BASE_URL}/resources/group/${selectedGroupId}?`;
      if (searchQuery) url += `q=${searchQuery}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resources';
      setError(errorMessage);
    }
  }, [searchQuery, selectedGroupId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchResources();
    }
  }, [fetchResources, selectedGroupId]);

  const fetchGroups = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (resource: Resource) => {
    setSelectedResource(resource);
    setShowEditModal(false);
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

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/resources/${selectedResource._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedResource(null);
        fetchResources();
        alert('Resource updated successfully');
      }
    } catch {
      alert('Failed to update resource');
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchResources();
    } catch {
      alert('Failed to delete resource');
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Resource Management</h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Manage educational resources by group</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Group Selection */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-4 shadow-xl`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Select Group</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.subject} - {group.topic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              disabled={!selectedGroupId}
              className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
            />
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {selectedGroupId ? (
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl overflow-hidden shadow-xl`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'} flex justify-between items-center`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Resources ({total})</h2>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Refresh
            </button>
          </div>

          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {resources.map((resource) => (
                <div
                  key={resource._id}
                  className={`${isDark ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} border rounded-lg p-4 transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {resource.type === 'video' ? '🎬' : 
                         resource.type === 'document' ? '📄' : 
                         resource.type === 'link' ? '🔗' : '📁'}
                      </span>
                      <span className={`px-2 py-0.5 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'} rounded text-xs`}>
                        {resource.type}
                      </span>
                    </div>
                    <span className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-xs`}>👁 {resource.views}</span>
                  </div>

                  <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium mb-1 line-clamp-1`}>{resource.title}</h3>
                  {resource.description && (
                    <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'} text-sm mb-3 line-clamp-2`}>{resource.description}</p>
                  )}

                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'} mb-3`}>
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(resource)}
                      className={`flex-1 px-3 py-1.5 ${isDark ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded text-xs transition`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(resource)}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-500 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource._id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-500 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <span className="text-4xl mb-2 block">📭</span>
              <p>No resources found in this group</p>
            </div>
          )}
        </div>
      ) : (
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-sm border-gray-200'} border rounded-xl p-12 text-center shadow-xl`}>
          <span className="text-5xl mb-4 block">📚</span>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Select a Group</h3>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Choose a learning group above to view and manage its resources</p>
        </div>
      )}

      {/* View Resource Modal */}
      {selectedResource && !showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl max-w-lg w-full p-6 mx-4 shadow-2xl`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {selectedResource.type === 'video' ? '🎬' : 
                   selectedResource.type === 'document' ? '📄' : 
                   selectedResource.type === 'link' ? '🔗' : '📁'}
                </span>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedResource.title}</h2>
                  <span className={`px-2 py-0.5 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'} rounded text-xs`}>
                    {selectedResource.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} text-xl`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedResource.description && (
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Description</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedResource.description}</p>
                </div>
              )}

              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Link</p>
                <a 
                  href={selectedResource.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {selectedResource.link}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Views</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedResource.views}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Created</p>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{new Date(selectedResource.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <a
                href={selectedResource.link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
              >
                Open Resource
              </a>
              <button
                onClick={() => handleEdit(selectedResource)}
                className={`px-4 py-2 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition`}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {selectedResource && showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl max-w-lg w-full p-6 mx-4 shadow-2xl`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Resource</h2>
              <button
                onClick={() => { setShowEditModal(false); setSelectedResource(null); }}
                className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} text-xl`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateResource} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Link</label>
                <input
                  type="url"
                  value={editForm.link}
                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                  className={`w-full px-3 py-2 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedResource(null); }}
                  className={`px-4 py-2 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
