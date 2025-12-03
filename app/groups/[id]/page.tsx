'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import Navigation from '@/components/Navigation';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/context';
import { Paperclip, Send, BookOpen, Lock, Crown, Star, Check, Users, User, Calendar, MessageSquare, LogOut, X, UserPlus, Edit2, Plus, CalendarClock, Link as LinkIcon, CircleDot, CheckCircle, XCircle, Trash2, Reply } from 'lucide-react';

interface Member {
  userId: string | {
    _id: string;
    email: string;
    profile?: { name?: string; avatar?: string };
  };
  role: string;
  joinedAt: string;
}

interface Group {
  _id: string;
  grade: string;
  subject: string;
  topic: string;
  description?: string;
  whatsappLink?: string;
  members: Member[];
  maxMembers: number;
  groupType: 'public' | 'private';
  status: string;
  createdBy: { _id: string; email: string; profile?: { name?: string } };
  createdAt: string;
}

interface ChatMessage {
  _id: string;
  userId: {
    _id: string;
    email: string;
    profile?: { name?: string; avatar?: string };
  };
  message: string;
  type: string;
  resourceId?: {
    _id: string;
    title: string;
    type: string;
  };
  resourceLink?: string;
  replyTo?: {
    _id: string;
    userId: {
      _id: string;
      email: string;
      profile?: { name?: string; avatar?: string };
    };
    message: string;
  };
  timestamp: string;
}

export default function GroupDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const user = getUser();
  const { showToast, showConfirm } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'chat' | 'resources' | 'sessions'>('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [groupResources, setGroupResources] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}); // userId -> userName
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Set default tab to 'chat' for members
  useEffect(() => {
    if (group && isUserMember()) {
      setActiveTab('resources');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => {
    if (activeTab === 'chat' && group) {
      fetchChatMessages();
      scrollToBottom();

      // Initialize Socket.io connection
      const socket = getSocket();
      console.log('🔌 Socket instance:', socket.id, 'Connected:', socket.connected);
      
      // Join the group room
      socket.emit('join-group', groupId);
      console.log('📡 Emitted join-group for:', groupId);

      // Listen for new messages
      const handleNewMessage = (message: ChatMessage) => {
        console.log('📩 New message received via Socket.io:', message);
        setChatMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === message._id)) {
            console.log('⚠️ Duplicate message, skipping');
            return prev;
          }
          console.log('✅ Adding new message to state');
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);
      };

      socket.on('new-message', handleNewMessage);

      // Listen for typing indicators
      socket.on('user-typing', ({ userId, userName }: { userId: string; userName: string }) => {
        console.log(`💬 ${userName} is typing...`);
        setTypingUsers(prev => ({ ...prev, [userId]: userName }));
        
        // Auto-remove after 3 seconds if no update
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        }, 3000);
      });

      socket.on('user-stop-typing', ({ userId }: { userId: string }) => {
        console.log('⏸️ User stopped typing');
        setTypingUsers(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      });

      // Cleanup on unmount or tab change
      return () => {
        console.log('🧹 Cleaning up socket listeners for group:', groupId);
        socket.emit('leave-group', groupId);
        socket.off('new-message', handleNewMessage);
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [activeTab, group]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    const socket = getSocket();
    const userName = user?.profile?.name || user?.email || 'Someone';
    
    // Emit typing start
    socket.emit('typing-start', { groupId, userId: user?.id, userName });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to emit stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { groupId, userId: user?.id });
    }, 2000);
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`/groups/${groupId}`);
      setGroup(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch group:', err);
      setIsLoading(false);
      showToast('Group not found', 'error');
      router.push('/groups');
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`/chat/group/${groupId}?limit=100`);
      setChatMessages(response.data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const fetchGroupResourcesForChat = async () => {
    try {
      const response = await axios.get(`/resources/group/${groupId}`);
      setGroupResources(response.data.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const response = await axios.post('/chat/send', {
        groupId,
        message: newMessage,
        type: 'text',
        replyTo: replyingTo?._id || undefined,
      });
      
      // Add the message immediately to state (optimistic update)
      const sentMessage = response.data.message;
      setChatMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m._id === sentMessage._id)) return prev;
        return [...prev, sentMessage];
      });
      
      setNewMessage('');
      setReplyingTo(null);
      setTimeout(scrollToBottom, 100);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAttachResource = async (resource: any) => {
    try {
      const response = await axios.post('/chat/send', {
        groupId,
        message: `Shared resource: ${resource.title}`,
        type: 'text',
        resourceId: resource._id,
        resourceLink: resource.link,
      });
      
      // Add the message immediately to state (optimistic update)
      const sentMessage = response.data.message;
      setChatMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m._id === sentMessage._id)) return prev;
        return [...prev, sentMessage];
      });
      
      setShowResourcePicker(false);
      setTimeout(scrollToBottom, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to attach resource', 'error');
    }
  };

  const handleJoinGroup = async () => {
    try {
      await axios.post(`/groups/${groupId}/join`);
      showToast('Successfully joined the group!', 'success');
      await fetchGroupDetails();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to join group', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    const confirmed = await showConfirm({
      title: 'Leave Group',
      message: 'Are you sure you want to leave this group?',
      confirmText: 'Leave',
      type: 'warning'
    });
    if (!confirmed) return;
    try {
      await axios.post(`/groups/${groupId}/leave`);
      showToast('Left the group', 'success');
      router.push('/groups');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to leave group', 'error');
    }
  };

  const isUserMember = () => {
    if (!group || !user) {
      console.log('❌ No group or user');
      return false;
    }
    
    console.log('🔍 Checking membership:');
    console.log('User ID:', user.id, 'Type:', typeof user.id);
    console.log('User Role:', user.role);
    console.log('Group Members:', group.members);
    
    // Admin users have automatic access to all groups
    if (user.role === 'admin') {
      console.log('✅ Admin access granted');
      return true;
    }
    
    // Regular users must be in the members array
    // Note: user object has 'id' but JWT has '_id', group.members has userId as _id
    const userId = user.id || user._id;
    const result = group.members.some(m => {
      // Handle both populated (object) and non-populated (string) userId
      if (!m.userId) {
        console.log('⚠️ Member has no userId:', m);
        return false;
      }
      
      let memberId: string;
      if (typeof m.userId === 'string') {
        memberId = m.userId;
      } else if (typeof m.userId === 'object' && '_id' in m.userId) {
        memberId = m.userId._id;
      } else {
        console.log('⚠️ Invalid member format:', m);
        return false;
      }
      
      const match = memberId === userId;
      console.log(`Comparing "${memberId}" === "${userId}" => ${match}`);
      return match;
    });
    
    console.log('🎯 Final result:', result);
    return result;
  };

  const getUserRole = () => {
    if (!group || !user) return 'non-member';
    
    // Admin users have admin access to all groups
    if (user.role === 'admin') return 'admin';
    
    const userId = user.id || user._id;
    const member = group.members.find(m => {
      // Handle both populated (object) and non-populated (string) userId
      if (!m.userId) {
        return false;
      }
      
      let memberId: string;
      if (typeof m.userId === 'string') {
        memberId = m.userId;
      } else if (typeof m.userId === 'object' && '_id' in m.userId) {
        memberId = m.userId._id;
      } else {
        return false;
      }
      return memberId === userId;
    });
    return member?.role || 'non-member';
  };

  const canEditGroup = () => {
    if (!group || !user) return false;
    // Admin can edit any group
    if (user.role === 'admin') return true;
    // Group owner can edit
    const userRole = getUserRole();
    return userRole === 'owner' || userRole === 'admin';
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditGroup = async (formData: any) => {
    try {
      await axios.put(`/groups/${groupId}/update`, formData);
      setShowEditModal(false);
      await fetchGroupDetails();
      showToast('Group updated successfully!', 'success');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update group', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Group not found</p>
      </div>
    );
  }

  const memberCount = group.members.length;
  const isMember = isUserMember();
  const userRole = getUserRole();

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Group Header */}
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-4 py-1.5 bg-linear-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Grade {group.grade}
                </span>
                {group.groupType === 'private' && (
                  <span className="px-4 py-1.5 bg-linear-to-r from-purple-100 to-purple-50 text-purple-700 text-sm font-bold rounded-full border border-purple-200 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Private
                  </span>
                )}
                {isMember && (
                  <span className="px-4 py-1.5 bg-linear-to-r from-green-100 to-green-50 text-green-700 text-sm font-bold rounded-full border border-green-200 flex items-center gap-1.5">
                    {userRole === 'owner' ? (
                      <><Crown className="w-4 h-4" /> Owner</>
                    ) : userRole === 'admin' ? (
                      <><Star className="w-4 h-4" /> Admin</>
                    ) : (
                      <><Check className="w-4 h-4" /> Member</>
                    )}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{group.subject}</h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-4">{group.topic}</p>
              {group.description && (
                <p className="text-gray-700 mb-4 text-base">{group.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{memberCount}/{group.maxMembers} members</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Created by {group.createdBy.profile?.name || group.createdBy.email}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full lg:w-auto">
              {canEditGroup() && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Group
                </button>
              )}
              {user?.role === 'admin' ? (
                // Admin users see only WhatsApp link (no join/leave)
                <>
                  {group.whatsappLink && (
                    <a
                      href={group.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-center"
                    >
                      WhatsApp Group
                    </a>
                  )}
                  <div className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" /> Admin Access
                  </div>
                </>
              ) : isMember ? (
                // Regular users who are members
                <>
                  {group.whatsappLink && (
                    <a
                      href={group.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full lg:w-auto px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium text-center flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" /> WhatsApp Group
                    </a>
                  )}
                  <button
                    onClick={handleLeaveGroup}
                    className="w-full lg:w-auto px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" /> Leave Group
                  </button>
                </>
              ) : (
                // Regular users who are not members
                <button
                  onClick={handleJoinGroup}
                  disabled={memberCount >= group.maxMembers}
                  className={`w-full lg:w-auto px-8 py-3 rounded-xl transition-all font-bold shadow-lg flex items-center justify-center gap-2 ${
                    memberCount >= group.maxMembers
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {memberCount >= group.maxMembers ? (
                    <><X className="w-5 h-5" /> Group Full</>
                  ) : (
                    <><UserPlus className="w-5 h-5" /> Join Group</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="flex border-b overflow-x-auto scrollbar-hide gap-1 p-2">
            {isMember && (
              <>
                  <TabButton
                    active={activeTab === 'resources'}
                    onClick={() => setActiveTab('resources')}
                    icon="📚"
                    label="Resources"
                  />
                <TabButton
                  active={activeTab === 'chat'}
                  onClick={() => setActiveTab('chat')}
                  icon="💬"
                  label="Chat"
                />
                <TabButton
                  active={activeTab === 'sessions'}
                  onClick={() => setActiveTab('sessions')}
                  icon="🎓"
                  label="Sessions"
                />
              </>
            )}
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon="📋"
              label="Overview"
            />
            <TabButton
              active={activeTab === 'members'}
              onClick={() => setActiveTab('members')}
              icon="👥"
              label={`Members (${memberCount})`}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'chat' && isMember && (
              <ChatTab
                messages={chatMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                isSending={isSendingMessage}
                currentUserId={user?.id || ''}
                chatEndRef={chatEndRef}
                onAttachResource={() => {
                  fetchGroupResourcesForChat();
                  setShowResourcePicker(true);
                }}
                showResourcePicker={showResourcePicker}
                setShowResourcePicker={setShowResourcePicker}
                groupResources={groupResources}
                onSelectResource={handleAttachResource}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                typingUsers={typingUsers}
                onTyping={handleTyping}
                isMember={isMember}
              />
            )}
            {activeTab === 'resources' && isMember && (
              <ResourcesTab groupId={groupId} user={user} />
            )}
            {activeTab === 'sessions' && isMember && (
              <SessionsTab groupId={groupId} user={user} isMember={isMember} />
            )}
            {activeTab === 'overview' && (
              <OverviewTab group={group} isMember={isMember} />
            )}
            {activeTab === 'members' && (
              <MembersTab members={group.members} />
            )}
          </div>
        </div>

        {/* Edit Group Modal */}
        {showEditModal && (
          <EditGroupModal
            group={group}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleEditGroup}
          />
        )}
      </main>
    </div>
    </LanguageProvider>
  );
}

// Tab Button Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap rounded-lg ${
        active
          ? 'text-blue-600 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-md scale-105'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <span className="text-xl sm:text-base">{icon}</span>
        <span className="text-xs sm:text-base">{label}</span>
      </div>
    </button>
  );
}

// Overview Tab
function OverviewTab({ group, isMember }: { group: Group; isMember: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Group</h3>
        <p className="text-gray-700">
          {group.description || 'No description provided for this learning group.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 text-black">
          <h4 className="font-semibold text-gray-900 mb-3">Group Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Grade:</span>
              <span className="font-medium">{group.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subject:</span>
              <span className="font-medium">{group.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Topic:</span>
              <span className="font-medium">{group.topic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{group.groupType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{group.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 text-black">
          <h4 className="font-semibold text-gray-900 mb-3">Group Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Members:</span>
              <span className="font-medium">{group.members.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Capacity:</span>
              <span className="font-medium">{group.maxMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Slots:</span>
              <span className="font-medium">{group.maxMembers - group.members.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {!isMember && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            Join this group to access chat, resources, and sessions!
          </p>
        </div>
      )}
    </div>
  );
}

// Members Tab
function MembersTab({ members }: { members: Member[] }) {
  const roleColors = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    moderator: 'bg-green-100 text-green-700',
    member: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Members</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => {
          // Handle null, string, and object userId cases
          if (!member.userId) {
            return (
              <div key={`unknown-${index}`} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  ?
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Unknown User</div>
                  <div className="text-xs text-gray-500">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${roleColors[member.role as keyof typeof roleColors] || roleColors.member}`}>
                  {member.role}
                </span>
              </div>
            );
          }
          
          const memberUser = typeof member.userId === 'string' ? null : member.userId;
          const memberId = typeof member.userId === 'string' ? member.userId : member.userId._id;
          
          return (
            <div key={memberId} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {memberUser ? (memberUser.profile?.name || memberUser.email).charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {memberUser ? (memberUser.profile?.name || memberUser.email) : 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${roleColors[member.role as keyof typeof roleColors] || roleColors.member}`}>
                {member.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Chat Tab
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChatTab({ messages, newMessage, setNewMessage, onSendMessage, isSending, currentUserId, chatEndRef, onAttachResource, showResourcePicker, setShowResourcePicker, groupResources, onSelectResource, replyingTo, setReplyingTo, typingUsers, onTyping }: any) {
  // Filter out current user from typing users
  const otherTypingUsers = Object.entries(typingUsers || {})
    .filter(([userId]) => userId !== currentUserId)
    .map(([_, userName]) => userName as string);

  return (
    <div className="flex flex-col h-[calc(100vh-400px)] sm:h-[500px] min-h-[400px] max-h-[600px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-1 sm:px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl sm:text-5xl mb-3">💬</div>
            <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isOwn = msg.userId?._id === currentUserId;
            const hasResource = msg.resourceId && msg.resourceLink;
            const hasReply = msg.replyTo;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end pl-12' : 'justify-start'} pr-12`}>
                <div className={`max-w-[70%] relative`}>
                  {!isOwn && msg.userId && (
                    <div className="text-xs text-gray-600 mb-1">
                      {msg.userId.profile?.name || msg.userId.email || 'Unknown User'}
                    </div>
                  )}
                  <div className={`rounded-lg p-3 ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} relative`}>
                    {hasReply && msg.replyTo?.userId && (
                      <div className={`mb-2 pl-3 py-2 border-l-4 ${isOwn ? 'border-blue-400 bg-blue-700' : 'border-gray-400 bg-gray-100'} rounded`}>
                        <div className={`text-xs font-semibold ${isOwn ? 'text-blue-200' : 'text-gray-700'} mb-1`}>
                          {msg.replyTo.userId?.profile?.name || msg.replyTo.userId?.email || 'Unknown User'}
                        </div>
                        <div className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-600'} line-clamp-2`}>
                          {msg.replyTo.message}
                        </div>
                      </div>
                    )}
                    {isOwn ? (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="absolute -left-10 top-2 transition-all p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 border border-white/30"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5 text-black" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="absolute -right-10 top-2 transition-all p-1.5 rounded-full bg-white hover:bg-gray-50 text-gray-600 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 border border-gray-200"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5 text-black" />
                      </button>
                    )}
                    <p className="whitespace-pre-wrap break-all">{msg.message}</p>
                    
                    {hasResource && msg.resourceId && (
                      <a
                        href={msg.resourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-2 block p-3 rounded-lg border-2 ${isOwn ? 'bg-blue-700 border-blue-400' : 'bg-white border-gray-300'} hover:border-blue-500 transition`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {msg.resourceId?.type === 'video' ? '🎥' : msg.resourceId?.type === 'document' ? '📄' : '🔗'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                              {msg.resourceId?.title || 'Resource'}
                            </div>
                            <div className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-600'} capitalize`}>
                              {msg.resourceId?.type || 'unknown'}
                            </div>
                          </div>
                          <span className={`text-xl ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>↗</span>
                        </div>
                      </a>
                    )}
                    
                    <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
        
        {/* Typing Indicator */}
        {otherTypingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg px-4 py-2 max-w-[70%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm text-gray-600">
                  {otherTypingUsers.length === 1
                    ? `${otherTypingUsers[0]} is typing...`
                    : `${otherTypingUsers.length} people are typing...`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {replyingTo && (
        <div className="mb-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-blue-700 mb-1">
              Replying to {replyingTo.userId.profile?.name || replyingTo.userId.email}
            </div>
            <div className="text-sm text-gray-700 line-clamp-2">
              {replyingTo.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="ml-2 text-gray-500 hover:text-gray-700 font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={onSendMessage} className="flex gap-1.5 sm:gap-2 items-end sticky bottom-0 bg-white p-2 sm:p-3 rounded-xl shadow-lg">
        <button
          type="button"
          onClick={onAttachResource}
          className="p-2 sm:p-3 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0 flex items-center justify-center"
          title="Attach Resource"
        >
          <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (onTyping) onTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="px-3 sm:px-5 md:px-6 py-2 sm:py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl active:scale-95 flex-shrink-0 text-sm sm:text-base flex items-center justify-center"
        >
          <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
          <Send className="sm:hidden w-5 h-5" />
        </button>
      </form>

      {showResourcePicker && (
        <ResourcePickerModal
          resources={groupResources}
          onClose={() => setShowResourcePicker(false)}
          onSelect={onSelectResource}
        />
      )}
    </div>
  );
}// Resources Tab (Placeholder)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResourcesTab({ groupId, user }: { groupId: string; user: any }) {
  const { showToast, showConfirm } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, a-z, z-a
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchResources = async (pageNum = 1, append = false) => {
    try {
      if (!append) setIsLoading(true);
      setLoadingMore(true);
      
      const response = await axios.get(`/resources/group/${groupId}?page=${pageNum}&limit=50`);
      const data = response.data;
      
      if (append) {
        setResources(prev => [...prev, ...(data.resources || [])]);
      } else {
        setResources(data.resources || []);
      }
      
      setHasMore(data.hasMore || false);
      setPage(pageNum);
      setIsLoading(false);
      setLoadingMore(false);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResources(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleLoadMore = () => {
    fetchResources(page + 1, true);
  };

  const handleAddResource = async (data: { title: string; description: string; link: string }) => {
    try {
      await axios.post('/resources', {
        ...data,
        groupId,
      });
      setShowAddModal(false);
      setPage(1);
      fetchResources(1, false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add resource', 'error');
    }
  };

  const handleViewResource = async (resourceId: string, link: string) => {
    try {
      await axios.get(`/resources/${resourceId}`);
      window.open(link, '_blank');
    } catch (err) {
      console.error('Failed to track view:', err);
      window.open(link, '_blank');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Resource',
      message: 'Are you sure you want to delete this resource?',
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await axios.delete(`/resources/${resourceId}`);
      setPage(1);
      fetchResources(1, false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete resource', 'error');
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort resources based on selected option
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'a-z':
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      case 'z-a':
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A to Z</option>
            <option value="z-a">Z to A</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Resource</span>
        </button>
      </div>

      {sortedResources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {sortedResources.map((resource) => (
              <div key={resource._id} className="bg-linear-to-br from-white to-gray-50 rounded-xl p-5 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{resource.description}</p>
                    )}
                  </div>
                  <span className="text-3xl ml-2 shrink-0">📄</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                  <div className="text-[13px] text-gray-500 font-medium">
                    👁️ {resource.views || 0} views • 📅 {new Date(resource.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleViewResource(resource._id, resource.link)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      📖 Open
                    </button>
                    {(resource.uploadedBy === user?.id || resource.uploadedBy?._id === user?.id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteResource(resource._id)}
                        className="px-4 py-2 bg-linear-to-r from-red-100 to-red-50 text-red-700 text-sm font-medium rounded-lg hover:from-red-200 hover:to-red-100 transition-all border border-red-200 active:scale-95"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </span>
                ) : (
                  '⬇️ Load More Resources'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'No resources found matching your search' : 'No resources shared yet'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add First Resource
          </button>
        </div>
      )}

      {showAddModal && (
        <AddResourceModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddResource}
        />
      )}
    </div>
  );
}

// Add Resource Modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AddResourceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-auto max-h-[95vh] overflow-y-auto transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📚 Add Resource
            </h2>
            <p className="text-blue-100 text-sm mt-1">Share learning materials with your group</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-2xl font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              📝 Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Calculus Notes Chapter 3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">💬 Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the resource..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              🔗 Resource Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
            <p className="text-sm text-gray-600 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
              💡 <strong>Tip:</strong> Make sure your link is publicly accessible (Google Drive, Dropbox, OneDrive, etc.)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-base shadow-sm hover:shadow-md active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-base disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl active:scale-95"
            >
              {isSubmitting ? '⏳ Adding...' : '✅ Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sessions Tab (Placeholder)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SessionsTab({ groupId, user, isMember }: { groupId: string; user: any; isMember: boolean }) {
  const { showToast, showConfirm } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingSession, setEditingSession] = useState<any>(null);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`/sessions/search?groupId=${groupId}`);
      console.log('Fetched sessions:', response.data.sessions);
      console.log('Current user:', user);
      setSessions(response.data.sessions || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScheduleSession = async (data: any) => {
    try {
      await axios.post('/sessions/create', {
        ...data,
        groupId,
      });
      setShowScheduleModal(false);
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to schedule session', 'error');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await axios.post('/sessions/join', { sessionId });
      console.log('Join session response:', response.data);
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Join session error:', err.response?.data || err.message);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to join session', 'error');
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      const response = await axios.post('/sessions/leave', { sessionId });
      console.log('Leave session response:', response.data);
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Leave session error:', err.response?.data || err.message);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to leave session', 'error');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      const response = await axios.post('/sessions/start', { sessionId });
      console.log('Start session response:', response.data);
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Start session error:', err.response?.data || err.message);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to start session', 'error');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    const confirmed = await showConfirm({
      title: 'End Session',
      message: 'Are you sure you want to end this session?',
      confirmText: 'End Session',
      type: 'warning'
    });
    if (!confirmed) return;
    try {
      const response = await axios.post('/sessions/end', { sessionId });
      console.log('End session response:', response.data);
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('End session error:', err.response?.data || err.message);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to end session', 'error');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const confirmed = await showConfirm({
      title: 'Cancel Session',
      message: 'Are you sure you want to cancel this session?',
      confirmText: 'Cancel Session',
      type: 'warning'
    });
    if (!confirmed) return;
    try {
      await axios.post('/sessions/admin/update-status', { sessionId, status: 'cancelled' });
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel session', 'error');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await axios.post('/sessions/delete', { sessionId });
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete session', 'error');
    }
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditSession = (session: any) => {
    setEditingSession(session);
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateSession = async (formData: any) => {
    try {
      await axios.put(`/sessions/${editingSession._id}`, formData);
      setEditingSession(null);
      fetchSessions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update session', 'error');
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterStatus === 'all') return true;
    return session.status === filterStatus;
  });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUserJoined = (session: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return session.attendees?.some((a: any) => {
      const attendeeId = typeof a.userId === 'string' ? a.userId : a.userId?._id;
      return attendeeId === user?.id;
    });
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isTeacher = (session: any) => {
    const teacherId = typeof session.teacherId === 'string' ? session.teacherId : session.teacherId?._id;
    return teacherId === user?.id;
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canManageSession = (session: any) => {
    // Admin can manage all sessions
    if (user?.role === 'admin') return true;
    // Users can only manage sessions they created
    return isTeacher(session);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('scheduled')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'scheduled' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilterStatus('ongoing')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'ongoing' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === 'completed' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <CalendarClock className="w-5 h-5" />
          Schedule Session
        </button>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          
          {filteredSessions.map((session) => (
            <SessionCard
              key={session._id}
              session={{ ...session, canManage: canManageSession(session) }}
              isTeacher={isTeacher(session)}
              isJoined={isUserJoined(session)}
              onJoin={() => handleJoinSession(session._id)}
              onLeave={() => handleLeaveSession(session._id)}
              onStart={() => handleStartSession(session._id)}
              onEnd={() => handleEndSession(session._id)}
              onCancel={() => handleCancelSession(session._id)}
              onEdit={() => handleEditSession(session)}
              onDelete={() => handleDeleteSession(session._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarClock className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">
            {filterStatus === 'all' ? 'No sessions scheduled yet' : `No ${filterStatus} sessions`}
          </p>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Schedule First Session
          </button>
        </div>
      )}

      {showScheduleModal && (
        <ScheduleSessionModal
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleScheduleSession}
        />
      )}

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSubmit={handleUpdateSession}
        />
      )}
    </div>
  );
}

// Session Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SessionCard({ session, isTeacher, isJoined, onJoin, onLeave, onStart, onEnd, onCancel, onEdit, onDelete }: any) {
  const statusColors = {
    scheduled: 'bg-green-100 text-green-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'ongoing':
        return <CircleDot className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const scheduledDate = new Date(session.scheduledAt);
  const isPast = scheduledDate < new Date();
  const canJoin = session.status === 'ongoing' || (session.status === 'scheduled' && !isPast);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[session.status as keyof typeof statusColors] || statusColors.scheduled}`}>
              {/* <StatusIcon status={session.status} />  */}
              {session.status.toUpperCase()}
            </span>
            {isTeacher && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">👨‍🏫 Teacher</span>}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>{scheduledDate.toLocaleString()}</span>
              {isPast && session.status === 'scheduled' && (
                <span className="text-red-600 text-xs">(Past Due)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span>{session.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{session.attendees?.length || 0} attendees</span>
            </div>
          </div>
        </div>
        
        {/* Edit/Delete buttons for teacher or admin */}
        {(isTeacher || session.canManage) && session.status === 'scheduled' && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit Session"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete Session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {session.meetingLink && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" /> Join Meeting Link
          </a>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {/* Teacher/Admin Actions */}
        {(isTeacher || session.canManage) && (
          <>
            {session.status === 'scheduled' && (
              <>
                <button
                  onClick={onStart}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  Start Session
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition"
                >
                  Cancel
                </button>
              </>
            )}
            {session.status === 'ongoing' && (
              <button
                onClick={onEnd}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
              >
                End Session
              </button>
            )}
          </>
        )}

        {/* Student Actions */}
        {!isTeacher && !session.canManage && canJoin && (
          <>
            {isJoined ? (
              <button
                onClick={onLeave}
                className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition"
              >
                Leave Session
              </button>
            ) : (
              <button
                onClick={onJoin}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Join Session
              </button>
            )}
          </>
        )}

        {session.status === 'completed' && (
          <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg">
            Session Completed
          </span>
        )}

        {session.status === 'cancelled' && (
          <span className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg">
            Session Cancelled
          </span>
        )}
      </div>
    </div>
  );
}

// Schedule Session Modal

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ScheduleSessionModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: '',
    duration: 60,
    meetingLink: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-auto max-h-[95vh] overflow-y-auto transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🎓 Schedule Session
            </h2>
            <p className="text-indigo-100 text-sm mt-1">Plan a study session with your group</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-2xl font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              📝 Session Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Calculus Study Session"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              📅 Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              min={getMinDateTime()}
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              ⏱️ Duration <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 text-base transition-all"
            >
              <option value={30}>⏰ 30 minutes</option>
              <option value={45}>⏰ 45 minutes</option>
              <option value={60}>⏰ 1 hour</option>
              <option value={90}>⏰ 1.5 hours</option>
              <option value={120}>⏰ 2 hours</option>
              <option value={180}>⏰ 3 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              🎥 Meeting Link (Optional)
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
            <p className="text-sm text-gray-600 mt-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
              💡 <strong>Tip:</strong> Add Google Meet, Zoom, or Teams link for online sessions
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-base shadow-sm hover:shadow-md active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-base disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl active:scale-95"
            >
              {isSubmitting ? '⏳ Scheduling...' : '✅ Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Resource Picker Modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResourcePickerModal({ resources, onClose, onSelect }: { resources: any[], onClose: () => void, onSelect: (resource: any) => void }) {
  const [search, setSearch] = useState('');

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-auto max-h-[90vh] overflow-hidden transform transition-all animate-slideUp flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Paperclip className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Attach Resource</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90 duration-300"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources by title or description..."
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all"
              autoFocus
            />
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-600">No resources found</p>
              <p className="text-sm text-gray-500 mt-2">
                {search ? 'Try a different search term' : 'No resources available to attach'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredResources.map((resource) => (
                <button
                  key={resource._id}
                  onClick={() => {
                    onSelect(resource);
                    onClose();
                  }}
                  className="w-full text-left p-4 sm:p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                      {resource.type === 'video' ? (
                        <span className="text-2xl sm:text-3xl">🎥</span>
                      ) : resource.type === 'document' ? (
                        <span className="text-2xl sm:text-3xl">📄</span>
                      ) : (
                        <span className="text-2xl sm:text-3xl">🔗</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{resource.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-3 py-1 bg-linear-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full capitalize font-medium">
                          {resource.type}
                        </span>
                        {resource.uploadedBy && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {resource.uploadedBy?.profile?.name || resource.uploadedBy?.email}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-3xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} available
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Session Modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditSessionModal({ session, onClose, onSubmit }: any) {
  // Format datetime for input (convert to local timezone)
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: session.title || '',
    scheduledAt: formatDateTimeLocal(session.scheduledAt),
    duration: session.duration || 60,
    meetingLink: session.meetingLink || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-auto max-h-[95vh] overflow-y-auto transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              ✏️ Edit Session
            </h2>
            <p className="text-indigo-100 text-sm mt-1">Update session details</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-2xl font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              📝 Session Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Calculus Study Session"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              📅 Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              min={getMinDateTime()}
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              ⏱️ Duration <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 text-base transition-all"
            >
              <option value={30}>⏰ 30 minutes</option>
              <option value={45}>⏰ 45 minutes</option>
              <option value={60}>⏰ 1 hour</option>
              <option value={90}>⏰ 1.5 hours</option>
              <option value={120}>⏰ 2 hours</option>
              <option value={180}>⏰ 3 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              🎥 Meeting Link (Optional)
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
            <p className="text-sm text-gray-600 mt-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
              💡 <strong>Tip:</strong> Add Google Meet, Zoom, or Teams link for online sessions
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-base shadow-sm hover:shadow-md active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-base disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl active:scale-95"
            >
              {isSubmitting ? '⏳ Updating...' : '✅ Update Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Group Modal

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditGroupModal({ group, onClose, onSubmit }: { group: Group; onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    description: group.description || '',
    whatsappLink: group.whatsappLink || '',
    maxMembers: group.maxMembers || 50,
    groupType: group.groupType || 'public',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-auto max-h-[95vh] overflow-y-auto transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              ⚙️ Edit Group Settings
            </h2>
            <p className="text-blue-100 text-sm mt-1">Update your group configuration</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-2xl font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              📝 Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your learning group..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              💬 WhatsApp Group Link
            </label>
            <input
              type="url"
              value={formData.whatsappLink}
              onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base transition-all"
            />
            <p className="text-sm text-gray-600 mt-2 bg-green-50 p-3 rounded-lg border border-green-100">
              💡 <strong>Optional:</strong> Add a WhatsApp group link for external communication
            </p>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              👥 Maximum Members
            </label>
            <select
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base transition-all"
            >
              <option value={10}>👥 10 members</option>
              <option value={20}>👥 20 members</option>
              <option value={30}>👥 30 members</option>
              <option value={50}>👥 50 members</option>
              <option value={100}>👥 100 members</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              🔐 Group Type
            </label>
            <select
              value={formData.groupType}
              onChange={(e) => setFormData({ ...formData, groupType: e.target.value as 'public' | 'private' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base transition-all"
            >
              <option value="public">🌍 Public - Anyone can join</option>
              <option value="private">🔒 Private - Invitation required</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-base shadow-sm hover:shadow-md active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-base disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl active:scale-95"
            >
              {isSubmitting ? '⏳ Updating...' : '✅ Update Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


