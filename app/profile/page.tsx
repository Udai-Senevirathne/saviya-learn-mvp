'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';

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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-linear-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-linear-to-br from-pink-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <header className={`bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-2xl">👤</span> My Profile
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              🏠 Home
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Profile Card */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg animate-bounce-in">
                {profile.profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{profile.profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    profile.verified 
                      ? 'bg-green-100 text-green-800 animate-pulse' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.verified ? '✓ Verified' : '⏳ Not Verified'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                isEditing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-linear-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
              }`}
            >
              {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-4 animate-fade-in">
              {profile.profile.bio && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">📝 Bio</p>
                  <p className="text-gray-900">{profile.profile.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {profile.profile.country && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">🌍 Country</p>
                    <p className="text-gray-900">{profile.profile.country}</p>
                  </div>
                )}
                {profile.profile.region && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">📍 Region</p>
                    <p className="text-gray-900">{profile.profile.region}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 input-focus text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 input-focus text-gray-900 placeholder-gray-400"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🌍 Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 input-focus text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📍 Region</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 input-focus text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
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

        {/* Reputation Stats */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="animate-pulse">⭐</span> Reputation
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="text-3xl font-bold text-yellow-600">{profile.reputation.points}</div>
              <div className="text-sm text-gray-600 mt-1">🏆 Points</div>
            </div>
            <div className="text-center p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="text-3xl font-bold text-green-600">{profile.reputation.sessionsTaught}</div>
              <div className="text-sm text-gray-600 mt-1">🎓 Sessions Taught</div>
            </div>
            <div className="text-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="text-3xl font-bold text-blue-600">{profile.reputation.resourcesShared}</div>
              <div className="text-sm text-gray-600 mt-1">📚 Resources Shared</div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>💡</span> Skills
            </h3>
            {isEditing && (
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white text-sm rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <span>➕</span> Add Skill
              </button>
            )}
          </div>
          
          {skills.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-500">No skills added yet</p>
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
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 animate-fade-in bg-white/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {!isEditing ? (
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>📖</span> {skill.subject}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Topics:</span> {skill.topics.join(', ')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Proficiency:</span>{' '}
                        <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${
                          skill.proficiency === 'expert' ? 'bg-purple-100 text-purple-700' :
                          skill.proficiency === 'advanced' ? 'bg-blue-100 text-blue-700' :
                          skill.proficiency === 'intermediate' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {skill.proficiency}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={skill.subject}
                        onChange={(e) => updateSkill(index, 'subject', e.target.value)}
                        placeholder="Subject (e.g., Mathematics)"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="text"
                        value={skill.topics.join(', ')}
                        onChange={(e) => updateSkill(index, 'topics', e.target.value.split(',').map(t => t.trim()))}
                        placeholder="Topics (comma-separated)"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={skill.proficiency}
                          onChange={(e) => updateSkill(index, 'proficiency', e.target.value)}
                          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                        <button
                          onClick={() => removeSkill(index)}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-all duration-300 hover:scale-105"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
