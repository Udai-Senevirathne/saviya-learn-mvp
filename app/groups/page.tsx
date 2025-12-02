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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Learning Groups</h1>
              <p className="text-gray-600">Join groups to collaborate and learn together</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">+</span>
              Create Group
            </button>
          </div>
        </div>        {/* Tabs and Search */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 px-4 sm:px-6 py-4 font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'text-blue-600 border-b-3 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span className="hidden sm:inline">🔍 Explore Groups</span>
              <span className="sm:hidden">🔍 Explore</span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">{groups.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 px-4 sm:px-6 py-4 font-semibold transition-all ${
                activeTab === 'my'
                  ? 'text-blue-600 border-b-3 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span className="hidden sm:inline">👥 My Groups</span>
              <span className="sm:hidden">👥 Mine</span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">{myGroups.length}</span>
            </button>
          </div>

          {/* Search & Filters */}
          {activeTab === 'explore' && (
            <div className="p-4 sm:p-6 bg-gray-50">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="🔍 Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 shadow-sm"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <span className="sm:hidden">🔍</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Grade (e.g., 10)"
                    value={filters.grade}
                    onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>        {/* Groups Grid */}
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
              <div className="col-span-3 text-center py-16 sm:py-20">
                <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🔍</div>
                <p className="text-gray-600 text-base sm:text-lg mb-2 font-medium">No groups found</p>
                <p className="text-gray-400 text-sm sm:text-base">Try adjusting your search or filters</p>
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
              <div className="col-span-3 text-center py-16 sm:py-20">
                <div className="text-6xl sm:text-7xl mb-4 animate-bounce">📚</div>
                <p className="text-gray-600 text-base sm:text-lg mb-4 font-medium">You haven't joined any groups yet</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold text-base"
                >
                  <span className="flex items-center gap-2">
                    <span>🌍</span>
                    Explore Groups
                  </span>
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
              className="px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 text-base w-full sm:w-auto"
            >
              {exploreLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>⬇️</span>
                  Load More Groups
                </span>
              )}
            </button>
          </div>
        )}

        {activeTab === 'my' && myGroupsHasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMoreMyGroups}
              disabled={myGroupsLoading}
              className="px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 text-base w-full sm:w-auto"
            >
              {myGroupsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>⬇️</span>
                  Load More Groups
                </span>
              )}
            </button>
          </div>
        )}
      </main>
      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed right-4 bottom-4 sm:right-6 sm:bottom-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-50"
        aria-label="Create Group"
      >
        <span className="text-3xl font-light">+</span>
      </button>
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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 border border-gray-100 hover:border-blue-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              📚 Grade {group.grade}
            </span>
            {group.groupType === 'private' && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                🔒 Private
              </span>
            )}
            {isMember && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                ✓ Joined
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{group.subject}</h3>
          <p className="text-gray-600 text-sm sm:text-base">{group.topic}</p>
        </div>
        <div className="text-4xl sm:text-5xl opacity-80 group-hover:scale-110 transition-transform">📚</div>
      </div>

      {group.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-lg">👥</span>
          <span className="font-medium">
            {memberCount}/{group.maxMembers} members
          </span>
        </div>
        {isFull && !isMember && (
          <span className="px-2 py-1 text-xs text-red-600 font-semibold bg-red-50 rounded-full">FULL</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all font-semibold border border-gray-200 text-center"
        >
          View Details
        </button>
        {isMember ? (
          onLeave && (
            <button
              onClick={onLeave}
              className="px-4 py-3 bg-gradient-to-r from-red-100 to-red-50 text-red-700 rounded-xl hover:from-red-200 hover:to-red-100 transition-all font-semibold border border-red-200"
            >
              Leave
            </button>
          )
        ) : (
          onJoin && (
            <button
              onClick={onJoin}
              disabled={isFull}
              className={`px-4 py-3 rounded-xl transition-all font-semibold ${
                isFull
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg border border-blue-600'
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Gradient Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Create Learning Group</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/90 hover:text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-all hover:rotate-90"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[calc(90vh-88px)] scrollbar-thin">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Grade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., 10, 11, A/L"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👥 Max Members
              </label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📖 Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Mathematics, Physics, Chemistry"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Calculus, Mechanics, Organic Chemistry"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this group will focus on..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all resize-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💬 WhatsApp Group Link (Optional)
            </label>
            <input
              type="url"
              value={formData.whatsappLink}
              onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">🔒 Group Type</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <input
                  type="radio"
                  value="public"
                  checked={formData.groupType === 'public'}
                  onChange={(e) => setFormData({ ...formData, groupType: 'public' })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">🌍 Public</div>
                  <div className="text-xs text-gray-500">Anyone can join</div>
                </div>
              </label>
              <label className="flex-1 flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <input
                  type="radio"
                  value="private"
                  checked={formData.groupType === 'private'}
                  onChange={(e) => setFormData({ ...formData, groupType: 'private' })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">🔐 Private</div>
                  <div className="text-xs text-gray-500">Invite only</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold active:scale-95 text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  Create Group
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
