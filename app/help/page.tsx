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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Community Help <Handshake className="w-8 h-8 text-blue-600" />
                </h1>
                <p className="text-gray-600 mt-1">Request or share educational resources with the community</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium flex items-center gap-2 hover:scale-105 hover:shadow-lg"
              >
                New Request
              </button>
            </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'my'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Requests ({myRequests.length})
            </button>
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
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
function CreateRequestModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    type: 'notes',
    groupId: '',
  });
  const [groups, setGroups] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const response = await axios.get('/groups/my');
      setGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Create Resource Request</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">None (Public Request)</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  Grade {group.grade} - {group.subject} - {group.topic}
                </option>
              ))}
            </select>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6">
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
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => onMarkFulfilled(request._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                Mark as Fulfilled
              </button>
              <button
                onClick={() => onCloseRequest(request._id)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
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
