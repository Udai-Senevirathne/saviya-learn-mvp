'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import Navigation from '@/components/Navigation';
import { LanguageProvider } from '@/lib/LanguageContext';

interface Group {
  _id: string;
  grade: string;
  subject: string;
  topic: string;
  description?: string;
  members: Array<{ userId: string | { _id: string }; role: string }>;
  maxMembers: number;
  groupType: 'public' | 'private';
  status: string;
  createdAt: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const user = getUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ grade: '', subject: '', topic: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'my'>('explore');
  
  // Pagination state
  const [explorePage, setExplorePage] = useState(1);
  const [exploreHasMore, setExploreHasMore] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [myGroupsPage, setMyGroupsPage] = useState(1);
  const [myGroupsHasMore, setMyGroupsHasMore] = useState(false);
  const [myGroupsLoading, setMyGroupsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchGroups();
    fetchMyGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async (page = 1, append = false) => {
    try {
      if (!append) setIsLoading(true);
      setExploreLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      if (searchQuery) params.append('q', searchQuery);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.topic) params.append('topic', filters.topic);

      const response = await axios.get(`/groups/search?${params.toString()}`);
      const data = response.data;
      
      if (append) {
        setGroups(prev => [...prev, ...(data.groups || data)]);
      } else {
        setGroups(data.groups || data);
      }
      
      setExploreHasMore(data.hasMore || false);
      setExplorePage(page);
      setIsLoading(false);
      setExploreLoading(false);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setIsLoading(false);
      setExploreLoading(false);
    }
  };

  const fetchMyGroups = async (page = 1, append = false) => {
    try {
      setMyGroupsLoading(true);
      const response = await axios.get(`/groups/my?page=${page}&limit=50`);
      const data = response.data;
      
      if (append) {
        setMyGroups(prev => [...prev, ...(data.groups || data)]);
      } else {
        setMyGroups(data.groups || data);
      }
      
      setMyGroupsHasMore(data.hasMore || false);
      setMyGroupsPage(page);
      setMyGroupsLoading(false);
    } catch (err) {
      console.error('Failed to fetch my groups:', err);
      setMyGroupsLoading(false);
    }
  };

  const handleSearch = () => {
    setExplorePage(1);
    setIsLoading(true);
    fetchGroups(1, false);
  };

  const handleLoadMoreExplore = () => {
    fetchGroups(explorePage + 1, true);
  };

  const handleLoadMoreMyGroups = () => {
    fetchMyGroups(myGroupsPage + 1, true);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await axios.post(`/groups/${groupId}/join`);
      alert('Successfully joined the group!');
      fetchGroups();
      fetchMyGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      await axios.post(`/groups/${groupId}/leave`);
      alert('Left the group');
      fetchMyGroups();
      fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to leave group');
    }
  };

  const isUserMember = (group: Group) => {
    if (!user?._id) return false;
    return group.members.some(m => {
      // Handle both populated (object) and non-populated (string) userId
      const memberId = typeof m.userId === 'string' ? m.userId : m.userId._id;
      return memberId === user._id;
    });
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Shared Navigation */}
        <Navigation user={user} />

        <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title & Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Learning Groups</h2>
            <p className="text-gray-600 mt-1">Join groups to collaborate and learn together</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'explore'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Explore Groups ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'my'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Groups ({myGroups.length})
            </button>
          </div>

          {/* Search & Filters */}
          {activeTab === 'explore' && (
            <div className="p-6 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="md:col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Grade (e.g., 10)"
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'explore' ? (
            groups.length > 0 ? (
              groups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  isMember={isUserMember(group)}
                  onJoin={() => handleJoinGroup(group._id)}
                  onLeave={() => handleLeaveGroup(group._id)}
                  onViewDetails={() => router.push(`/groups/${group._id}`)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">No groups found</p>
              </div>
            )
          ) : (
            myGroups.length > 0 ? (
              myGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  isMember={true}
                  onLeave={() => handleLeaveGroup(group._id)}
                  onViewDetails={() => router.push(`/groups/${group._id}`)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg mb-4">You haven't joined any groups yet</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Explore Groups
                </button>
              </div>
            )
          )}
        </div>

        {/* Load More Button */}
        {activeTab === 'explore' && exploreHasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMoreExplore}
              disabled={exploreLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exploreLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                'Load More Groups'
              )}
            </button>
          </div>
        )}

        {activeTab === 'my' && myGroupsHasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMoreMyGroups}
              disabled={myGroupsLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {myGroupsLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                'Load More Groups'
              )}
            </button>
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
            fetchMyGroups();
          }}
        />
      )}
      </div>
    </LanguageProvider>
  );
}

// Group Card Component
function GroupCard({
  group,
  isMember,
  onJoin,
  onLeave,
  onViewDetails,
}: {
  group: Group;
  isMember: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onViewDetails: () => void;
}) {
  const memberCount = group.members.length;
  const isFull = memberCount >= group.maxMembers;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Grade {group.grade}
            </span>
            {group.groupType === 'private' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                🔒 Private
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{group.subject}</h3>
          <p className="text-gray-600 text-sm mt-1">{group.topic}</p>
        </div>
        <div className="text-3xl">📚</div>
      </div>

      {group.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>👥</span>
          <span>
            {memberCount}/{group.maxMembers} members
          </span>
        </div>
        {isFull && !isMember && (
          <span className="text-xs text-red-600 font-medium">Full</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          View Details
        </button>
        {isMember ? (
          onLeave && (
            <button
              onClick={onLeave}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
            >
              Leave
            </button>
          )
        ) : (
          onJoin && (
            <button
              onClick={onJoin}
              disabled={isFull}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                isFull
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Join
            </button>
          )
        )}
      </div>
    </div>
  );
}

// Create Group Modal Component
function CreateGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    topic: '',
    description: '',
    whatsappLink: '',
    maxMembers: '100',
    groupType: 'public' as 'public' | 'private',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post('/groups', {
        ...formData,
        maxMembers: Number(formData.maxMembers),
      });
      alert('Group created successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create Learning Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., 10, 11, A/L"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Members
              </label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Mathematics, Physics, Chemistry"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Calculus, Mechanics, Organic Chemistry"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this group will focus on..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Group Link (Optional)
            </label>
            <input
              type="url"
              value={formData.whatsappLink}
              onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="public"
                  checked={formData.groupType === 'public'}
                  onChange={(e) => setFormData({ ...formData, groupType: 'public' })}
                  className="text-blue-600"
                />
                <span className="text-sm">Public (Anyone can join)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="private"
                  checked={formData.groupType === 'private'}
                  onChange={(e) => setFormData({ ...formData, groupType: 'private' })}
                  className="text-blue-600"
                />
                <span className="text-sm">Private (Invite only)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
