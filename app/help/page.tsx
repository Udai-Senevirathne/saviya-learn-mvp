/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { getUser } from '@/lib/axios';
import Navigation from '@/components/Navigation';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/context';
import { Handshake, Search, BookOpen, FileText, Link as LinkIcon } from 'lucide-react';

interface Request {
  _id: string;
  requesterId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  title: string;
  description: string;
  subject: string;
  topic: string;
  type: string;
  groupId?: {
    _id: string;
    grade: number;
    subject: string;
    topic: string;
  };
  status: 'open' | 'fulfilled' | 'closed';
  responses: Array<{
    userId: {
      _id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    message: string;
    resourceLink?: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function CommunityHelpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const currentUser = getUser();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        axios.get('/resource-requests'),
        axios.get('/resource-requests/my')
      ]);
      setRequests(allRes.data.requests || []);
      setMyRequests(myRes.data.requests || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateRequest = async (data: any) => {
    try {
      // Convert empty groupId to undefined
      const requestData = { ...data };
      if (!requestData.groupId || requestData.groupId === '') {
        delete requestData.groupId;
      }
      await axios.post('/resource-requests', requestData);
      setShowCreateModal(false);
      fetchRequests();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create request', 'error');
    }
  };

  const handleRespondToRequest = async (requestId: string, message: string, resourceLink?: string) => {
    try {
      // If resourceLink provided, append it to the message
      const finalMessage = resourceLink ? `${message}\n\nResource Link: ${resourceLink}` : message;
      await axios.post(`/resource-requests/${requestId}/respond`, { message: finalMessage });
      
      // Refresh the selected request immediately to show new response
      if (selectedRequest?._id === requestId) {
        const updated = await axios.get(`/resource-requests/${requestId}`);
        setSelectedRequest(updated.data);
      }
      
      // Also refresh the lists
      fetchRequests();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to respond', 'error');
    }
  };

  const handleMarkFulfilled = async (requestId: string) => {
    try {
      await axios.patch(`/resource-requests/${requestId}/fulfill`);
      fetchRequests();
      if (selectedRequest?._id === requestId) {
        setSelectedRequest(null);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to mark as fulfilled', 'error');
    }
  };

  const handleCloseRequest = async (requestId: string) => {
    try {
      await axios.patch(`/resource-requests/${requestId}/close`);
      fetchRequests();
      if (selectedRequest?._id === requestId) {
        setSelectedRequest(null);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to close request', 'error');
    }
  };

  const displayRequests = activeTab === 'all' ? requests : myRequests;
  const filteredRequests = displayRequests.filter((req) => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterSubject !== 'all' && req.subject.toLowerCase() !== filterSubject.toLowerCase()) return false;
    return true;
  });

  const uniqueSubjects = Array.from(new Set(requests.map(r => r.subject)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Shared Navigation */}
        <Navigation user={currentUser} />

        {/* Page Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  Community Help <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Request or share educational resources with the community</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium items-center gap-2 hover:scale-105 hover:shadow-lg shadow-md text-sm sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">New Request</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-medium transition text-sm sm:text-base ${activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">All Requests</span>
              <span className="sm:hidden">All</span>
              <span className="ml-1">({requests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-medium transition text-sm sm:text-base ${activeTab === 'my'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">My Requests</span>
              <span className="sm:hidden">Mine</span>
              <span className="ml-1">({myRequests.length})</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base">
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                currentUserId={currentUser?.id || currentUser?._id}
                onClick={() => setSelectedRequest(request)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Search className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No requests found</p>
            {activeTab === 'my' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Request
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed right-4 bottom-4 w-14 h-14 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-50"
        aria-label="New Request"
      >
        <span className="text-3xl font-light">+</span>
      </button>

      {/* Modals */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRequest}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          currentUserId={currentUser?.id || currentUser?._id}
          onClose={() => setSelectedRequest(null)}
          onRespond={handleRespondToRequest}
          onMarkFulfilled={handleMarkFulfilled}
          onCloseRequest={handleCloseRequest}
        />
      )}
      </div>
    </LanguageProvider>
  );
}

// Request Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequestCard({ request, currentUserId, onClick }: any) {
  const statusColors = {
    open: 'bg-green-100 text-green-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const isMyRequest = request.requesterId?._id === currentUserId || request.requesterId === currentUserId;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg flex-1">{request.title}</h3>
        {isMyRequest && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded ml-2">You</span>}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{request.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {request.subject}
        </span>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {request.topic}
        </span>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {request.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          <span className={`px-2 py-1 rounded font-medium ${statusColors[(request.status || 'open') as keyof typeof statusColors]}`}>
            {(request.status || 'open').toUpperCase()}
          </span>
        </div>
        <div>
          {request.responses?.length || 0} response{request.responses?.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
}

// Create Request Modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CreateRequestModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    type: 'notes',
    groupId: '',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [groups, setGroups] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const fetchMyGroups = async () => {
    try {
      const response = await axios.get('/groups/my');
      // Handle both { groups: [...] } and direct array response formats
      const groupsData = response.data?.groups || response.data || [];
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setGroups([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  useEffect(() => {
    const exe = async () => {
      await fetchMyGroups();
    }

    exe()
  }, []);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Create Resource Request</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg w-8 h-8 flex items-center justify-center transition-all text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Need calculus practice problems"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're looking for..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
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
                placeholder="e.g., Calculus"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white transition-all"
            >
              <option value="notes">Notes</option>
              <option value="book">Book</option>
              <option value="video">Video</option>
              <option value="practice">Practice Problems</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Group (Optional)
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white transition-all"
            >
              <option value="">None (Public Request)</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  Grade {group.grade} - {group.subject} - {group.topic}
                </option>
              ))}
            </select>
          </div>

          {/* Footer with Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Request Detail Modal

function RequestDetailModal({ request, currentUserId, onClose, onRespond, onMarkFulfilled, onCloseRequest }: any) {
  const [responseMessage, setResponseMessage] = useState('');
  const [responseLink, setResponseLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRequester = request.requesterId?._id === currentUserId || request.requesterId === currentUserId;

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onRespond(request._id, responseMessage, responseLink || undefined);
      setResponseMessage('');
      setResponseLink('');
      onClose(); // Close modal on success
    } catch (error) {
      // Keep modal open on error so user can try again
      console.error('Failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors = {
    open: 'bg-green-100 text-green-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Request Details</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg w-8 h-8 flex items-center justify-center transition-all text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Request Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-2xl font-bold text-gray-900">{request.title}</h3>
              <span className={`px-3 py-1 rounded font-medium ${statusColors[(request.status || 'open') as keyof typeof statusColors]}`}>
                {(request.status || 'open').toUpperCase()}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{request.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded">
                <BookOpen className="w-5 h-5 text-blue-600 inline-block mr-1" /> {request.subject}
              </span>
              <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded flex items-center gap-1">
                <FileText className="w-4 h-4 text-purple-600" /> {request.topic}
              </span>
              <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded flex items-center gap-1">
                <FileText className="w-4 h-4 text-indigo-600" /> {request.type}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Requested by {request.requesterId?.profile?.name || request.requesterId?.email || 'Unknown User'} •{' '}
              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Requester Actions */}
          {isRequester && request.status === 'open' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={() => onMarkFulfilled(request._id)}
                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                Mark as Fulfilled
              </button>
              <button
                onClick={() => onCloseRequest(request._id)}
                className="px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                Close Request
              </button>
            </div>
          )}

          {/* Responses */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              Responses ({request.responses?.length || 0})
            </h4>

            {request.responses && request.responses.length > 0 ? (
              <div className="space-y-4 mb-6">
                {request.responses.map((response: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {response.userId?.profile?.name || response.userId?.email || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {response.date ? new Date(response.date).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">
                      {response.message?.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) => 
                        /^https?:\/\//.test(part) ? (
                          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                            {part}
                          </a>
                        ) : part
                      )}
                    </p>
                    {response.resourceId && (
                      <div className="text-blue-600 text-sm flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" /> Shared Resource: {response.resourceId.title || 'Untitled'}
                        {response.resourceId.fileUrl && (
                          <a
                            href={response.resourceId.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline ml-2"
                          >
                            (View File)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-6">No responses yet. Be the first to help!</p>
            )}

            {/* Add Response Form */}
            {request.status === 'open' && !isRequester && (
              <form onSubmit={handleRespond} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    required
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Share your knowledge or provide a helpful response..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share a Resource (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    To share an existing resource, please upload it first in a learning group, then reference it in your message.
                  </p>
                  <input
                    type="text"
                    value={responseLink}
                    onChange={(e) => setResponseLink(e.target.value)}
                    placeholder="Or paste a link to an external resource..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </form>
            )}

            {request.status !== 'open' && !isRequester && (
              <p className="text-gray-500 text-sm text-center py-4">
                This request is {request.status}. No new responses can be added.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
