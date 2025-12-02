'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import Navigation from '@/components/Navigation';
import { LanguageProvider } from '@/lib/LanguageContext';

interface UserProfile {
  _id: string;
  email: string;
  profile: {
    name: string;
    bio?: string;
    avatar?: string;
    country?: string;
    region?: string;
  };
  skills?: Array<{
    subject: string;
    topics: string[];
    proficiency: string;
  }>;
  reputation: {
    points: number;
    sessionsTaught: number;
    resourcesShared: number;
  };
  role: string;
  status: string;
  verified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    country: '',
    region: '',
  });
  const [skills, setSkills] = useState<Array<{subject: string; topics: string[]; proficiency: string}>>([]);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/users/me');
      setProfile(response.data);
      setEditForm({
        name: response.data.profile.name || '',
        bio: response.data.profile.bio || '',
        country: response.data.profile.country || '',
        region: response.data.profile.region || '',
      });
      setSkills(response.data.skills || []);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put('/users/me', {
        profile: editForm,
        skills: skills,
      });
      await fetchProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  const addSkill = () => {
    setSkills([...skills, { subject: '', topics: [], proficiency: 'beginner' }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <button 
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-linear-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-linear-to-br from-pink-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
        </div>

        {/* Shared Navigation */}
        <Navigation user={{ id: profile._id, _id: profile._id, email: profile.email, profile: profile.profile, role: profile.role }} />

        <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          {/* Page Header */}
          <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information and skills</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mx-auto mb-4">
                    {profile.profile.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Name & Email */}
                  <h2 className="text-xl font-bold text-gray-900">{profile.profile.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
                  
                  {/* Badges */}
                  <div className="flex items-center justify-center mt-4 gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.verified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {profile.verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                      {profile.role}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`w-full mt-6 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isEditing 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-linear-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                    }`}
                  >
                    {isEditing ? '✕ Cancel Editing' : '✏️ Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Reputation Stats */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">⭐</span>
                  Reputation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <span className="text-gray-700 font-medium">Points</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">{profile.reputation.points}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎓</span>
                      <span className="text-gray-700 font-medium">Sessions</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{profile.reputation.sessionsTaught}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <span className="text-gray-700 font-medium">Resources</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{profile.reputation.resourcesShared}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details & Skills */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Details */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">👤</span>
                  Profile Details
                </h3>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                        <p className="text-gray-900 font-medium">{profile.profile.name}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                        <p className="text-gray-900 font-medium">{profile.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-500 mb-1">🌍 Country</p>
                        <p className="text-gray-900 font-medium">{profile.profile.country || 'Not specified'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-500 mb-1">📍 Region</p>
                        <p className="text-gray-900 font-medium">{profile.profile.region || 'Not specified'}</p>
                      </div>
                    </div>
                    {profile.profile.bio && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-500 mb-1">📝 Bio</p>
                        <p className="text-gray-900">{profile.profile.bio}</p>
                      </div>
                    )}
                    {!profile.profile.bio && (
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-gray-400 italic">No bio added yet. Click "Edit Profile" to add one.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
                        <input
                          type="text"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🌍 Country</label>
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          placeholder="Enter your country"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📍 Region</label>
                        <input
                          type="text"
                          value={editForm.region}
                          onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                          placeholder="Enter your region"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📝 Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-3 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-700 delay-250 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">💡</span>
                    Skills & Expertise
                  </h3>
                  {isEditing && (
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white text-sm rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>➕</span> Add Skill
                    </button>
                  )}
                </div>
                
                {skills.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-3">🎯</div>
                    <p className="text-gray-500 mb-2">No skills added yet</p>
                    <p className="text-gray-400 text-sm">Add your skills to help others find you for peer learning</p>
                    {isEditing && (
                      <button
                        onClick={addSkill}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
                      >
                        Add your first skill
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 bg-white"
                      >
                        {!isEditing ? (
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                              <span>📖</span> {skill.subject}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {skill.topics.map((topic, i) => (
                                <span key={i} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <span className={`inline-block capitalize px-3 py-1 rounded-full text-xs font-medium ${
                              skill.proficiency === 'expert' ? 'bg-purple-100 text-purple-700' :
                              skill.proficiency === 'advanced' ? 'bg-blue-100 text-blue-700' :
                              skill.proficiency === 'intermediate' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {skill.proficiency}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={skill.subject}
                              onChange={(e) => updateSkill(index, 'subject', e.target.value)}
                              placeholder="Subject (e.g., Mathematics)"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                            />
                            <input
                              type="text"
                              value={skill.topics.join(', ')}
                              onChange={(e) => updateSkill(index, 'topics', e.target.value.split(',').map(t => t.trim()))}
                              placeholder="Topics (comma-separated)"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={skill.proficiency}
                                onChange={(e) => updateSkill(index, 'proficiency', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                              </select>
                              <button
                                onClick={() => removeSkill(index)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}
