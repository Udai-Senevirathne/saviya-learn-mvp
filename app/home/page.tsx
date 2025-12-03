/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useToast } from '@/context';
import Navigation from '@/components/Navigation';
import { Users, BookOpen, TrendingUp, Zap, FileText, Search, PlusCircle, HelpCircle, Calendar, Trophy, Award, Target, MessageSquare, LogOut as LogOutIcon } from 'lucide-react';

interface HomeStats {
  statistics: {
    groupCount: number;
    sessionCount: number;
    activeSessions: number;
    resourceCount: number;
  };
  groups: Array<{
    _id: string;
    subject: string;
    topic: string;
    grade: string;
    members : [];
    memberCount: number;
  }>;
  recentActivity: Array<{
    _id: string;
    actionType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details: any;
    timestamp: string;
    userId?: {
      _id: string;
      email: string;
      role: string;
      profile?: {
        name?: string;
      };
    };
  }>;
}

export default function HomePage() {
  
  const router = useRouter();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const user = getUser();
  const { t } = useLanguage();

  
  
  const fetchHome = async () => {
    try {
      // Use existing endpoints to build stats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let userGroups: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let recentActivity: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let userSessions: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let userResources: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      
      try {
        const groupsResponse = await axios.get('/groups/my?page=1&limit=50');
        userGroups = groupsResponse.data.groups || [];
      } catch (e) {
        console.error('Error fetching groups:', e);
      }

      try {
        const activityResponse = await axios.get('/activity-logs/my?page=1&limit=10');
        recentActivity = activityResponse.data.logs || [];
        console.log('Activity logs fetched:', recentActivity);
      } catch (e) {
        console.error('Error fetching activity logs:', e);
      }

      try {
        const sessionsResponse = await axios.get('/sessions/list?page=1&limit=1000');
        userSessions = sessionsResponse.data.sessions || [];
        // Count sessions where user is in attendees array or is the teacher
        const attendedSessions = userSessions.filter(session => 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          session.attendees?.some((a: any) => a.userId === user?.id || a.userId?._id === user?.id) ||
          session.teacherId === user?.id ||
          session.teacherId?._id === user?.id
        );
        console.log('User attended sessions:', attendedSessions.length);
      } catch (e) {
        console.error('Error fetching sessions:', e);
      }

      try {
        const resourcesResponse = await axios.get('/resources/my?page=1&limit=1000');
        userResources = resourcesResponse.data.resources || [];
        console.log('User uploaded resources:', userResources.length);
      } catch (e) {
        console.error('Error fetching resources:', e);
      }

      const dashboardStats = {
        statistics: {
          groupCount: userGroups.length,
          sessionCount: userSessions.filter(session => 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session.attendees?.some((a: any) => a.userId === user?.id || a.userId?._id === user?.id) ||
            session.teacherId === user?.id ||
            session.teacherId?._id === user?.id
          ).length,
          resourceCount: userResources.length,
          activeSessions: 0,
        },
        groups: userGroups,
        recentActivity: recentActivity,
      };

      setStats(dashboardStats);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch home data:', err);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    }
  };

  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const exe = () => {
      fetchHome();
    }
    exe()
    
  }, []);


  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  // Feedback modal state
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbMessage, setFbMessage] = useState('');
  const [fbEmail, setFbEmail] = useState(user?.email || '');
  const [fbName, setFbName] = useState(user?.profile?.name || '');
  const [fbRating, setFbRating] = useState<number | ''>('');
  const [fbType, setFbType] = useState('general');
  const [fbLoading, setFbLoading] = useState(false);
  const { showToast } = useToast();

  const resetFeedbackForm = () => {
    setFbMessage('');
    setFbRating('');
    setFbType('general');
    setFbEmail(user?.email || '');
    setFbName(user?.profile?.name || '');
  };

  const submitFeedback = async () => {
    if (!fbMessage || fbMessage.trim().length < 5) {
      showToast(t('feedback.errors.messageRequired') || 'Please enter a feedback message (min 5 chars).', 'warning');
      return;
    }
    setFbLoading(true);
    try {
      const payload: any = { message: fbMessage, type: fbType };
      if (fbRating) payload.rating = fbRating;
      if (fbEmail) payload.email = fbEmail;
      if (fbName) payload.name = fbName;

      const res = await axios.post('/feedback', payload);
      if (res && res.status === 201) {
        showToast('Feedback submitted. Thank you!', 'success');
        resetFeedbackForm();
        setShowFeedback(false);
      } else {
        showToast('Failed to submit feedback.', 'error');
      }
    } catch (err: any) {
      console.error('Feedback submit error', err?.response || err);
      showToast((err?.response?.data?.message) || ('Failed to submit feedback.'), 'error');
    } finally {
      setFbLoading(false);
    }
  };

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-purple-300/30 to-blue-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 animate-pulse">{t('home.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-linear-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-linear-to-br from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Shared Navigation */}
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        {/* Welcome Section */}
        <div className={`bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-5 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold mb-2 animate-fade-in">
                {t('home.welcome')}, {user?.profile?.name || t('home.student')}! 
              </h2>
              <p className="text-blue-100 text-sm sm:text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t('home.welcomeSubtitle')}
              </p>
            </div>
            <TrendingUp className="w-20 h-20 animate-bounce-in hidden md:block" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: t('home.stats.myGroups'), value: stats?.statistics.groupCount || 0, icon: Users, color: 'blue', delay: '150' },
            { label: t('home.stats.sessionsJoined'), value: stats?.statistics.sessionCount || 0, icon: Calendar, color: 'green', delay: '200' },
            { label: t('home.stats.activeNow'), value: stats?.statistics.activeSessions || 0, icon: Zap, color: 'purple', delay: '250' },
            { label: t('home.stats.resources'), value: stats?.statistics.resourceCount || 0, icon: FileText, color: 'purple', delay: '300' },
          ].map((stat) => {
            const IconComponent = stat.icon;
            return (
            <div key={stat.label} className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-${stat.color}-500 card-hover transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${stat.delay}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`text-xl sm:text-3xl font-bold text-${stat.color}-600 mt-1 sm:mt-2`}>{stat.value}</p>
                </div>
                <IconComponent className={`w-6 h-6 sm:w-10 sm:h-10 text-${stat.color}-500 opacity-60 hover:scale-125 transition-transform duration-300`} />
              </div>
            </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* My Groups */}
          <div className={`lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> {t('home.myLearningGroups')}
              </h2>
              <button onClick={() => router.push('/groups')} className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200">
                {t('home.viewAll')} <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            {stats?.groups && stats.groups.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {stats.groups.slice(0, 4).map((group, index) => (
                  <div key={group._id} onClick={() => router.push(`/groups/${group._id}`)} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white/50 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{group.subject}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{group.topic}</p>
                        <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 sm:py-1 rounded-full">
                            {t('home.grade')} {group.grade}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {(group.memberCount ?? group.members?.length ?? 0)} {t('home.members')}
                          </span>
                        </div>
                      </div>
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 hover:scale-110 transition-transform shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 animate-fade-in">
                <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-3 sm:mb-4 animate-bounce-in" />
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">{t('home.noGroups')}</p>
                <button onClick={() => router.push('/groups')} className="px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" /> {t('home.exploreGroups')}
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" /> {t('home.recentActivity')}
            </h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 6).map((activity, index) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const actionIconsMap: { [key: string]: any } = {
                    'joined_group': Users,
                    'left_group': LogOutIcon,
                    'joined_session': Calendar,
                    'uploaded_resource': FileText,
                    'created_group': PlusCircle,
                    'completed_session': Target,
                    'resource_create': FileText,
                    'name_change': Users,
                  };
                  const IconComponent = actionIconsMap[activity.actionType] || MessageSquare;
                  return (
                    <div key={activity._id} className="flex items-start gap-3 border-l-2 border-blue-500 pl-3 py-2 hover:bg-blue-50/50 transition-all duration-200 rounded-r-lg animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <IconComponent className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          <span className="capitalize">{activity.actionType.replace(/_/g, ' ')}</span>
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-3 animate-bounce-in" />
                <p className="text-sm text-gray-500">{t('home.noActivity')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> {t('home.quickActions')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
            <button onClick={() => router.push('/groups')} className="p-3 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <Search className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500 mb-1 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-center">{t('home.actions.exploreGroups')}</div>
            </button>
            <button onClick={() => router.push('/groups')} className="p-3 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <PlusCircle className="w-6 h-6 sm:w-10 sm:h-10 text-green-500 mb-1 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors text-center">{t('home.actions.createGroup')}</div>
            </button>
            <button onClick={() => router.push('/help')} className="p-3 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <HelpCircle className="w-6 h-6 sm:w-10 sm:h-10 text-purple-500 mb-1 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors text-center">{t('home.actions.getHelp')}</div>
            </button>

            {/* Feedback Action */}
            <button onClick={() => setShowFeedback(true)} className="p-3 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <MessageSquare className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600 mb-1 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-center">{'Send Feedback'}</div>
            </button>
          </div>
        </div>

        {/* User Reputation Section */}
        {user?.reputation && (
          <div className={`bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl p-5 sm:p-8 text-white relative overflow-hidden transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> {t('home.yourImpact')}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 relative z-10">
              <div className="bg-white/10 rounded-xl p-3 sm:p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Award className="w-6 h-6 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 text-yellow-300" />
                <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{user.reputation.points || 0}</p>
                <p className="text-xs sm:text-sm text-indigo-100">{t('home.reputation.points')}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Calendar className="w-6 h-6 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 text-green-300" />
                <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{user.reputation.sessionsTaught || 0}</p>
                <p className="text-xs sm:text-sm text-indigo-100">{t('home.reputation.sessionsTaught')}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <FileText className="w-6 h-6 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 text-blue-300" />
                <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{user.reputation.resourcesShared || 0}</p>
                <p className="text-xs sm:text-sm text-indigo-100">{t('home.reputation.resourcesShared')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed text-black inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFeedback(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative z-10 max-h-[90vh] overflow-auto">
            <div className="p-4 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {"Feedback From"}
              </h3>
              <button onClick={() => setShowFeedback(false)} className="text-white opacity-90 hover:opacity-100">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input value={fbName} onChange={(e) => setFbName(e.target.value)} placeholder={'Your name'} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-black placeholder-black/70" />
                <input value={fbEmail} onChange={(e) => setFbEmail(e.target.value)} placeholder={'Email'} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-black placeholder-black/70" />
              </div>
              <div className="mb-4 ">
                <select value={fbType} onChange={(e) => setFbType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 mb-3 text-black">
                  <option value="general">{'General'}</option>
                  <option value="bug">{'Bug'}</option>
                  <option value="feature">{'Feature'}</option>
                </select>
                <textarea value={fbMessage} onChange={(e) => setFbMessage(e.target.value)} rows={6} placeholder={'Describe your feedback...'} className="w-full border border-gray-200 rounded-2xl px-4 py-3 resize-none text-black placeholder-black/70" />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-sm text-gray-600">{'Rating'}</label>
                  <select value={fbRating as any} onChange={(e) => setFbRating(e.target.value ? Number(e.target.value) : '')} className="border border-gray-200 rounded-xl px-3 py-1">
                    <option value="">{'No rating'}</option>
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={() => { resetFeedbackForm(); setShowFeedback(false); }} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 text-gray-700">{t('common.cancel') || 'Cancel'}</button>
                    <button onClick={submitFeedback} disabled={fbLoading} className="w-full sm:w-auto px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 disabled:opacity-60">{fbLoading ? ('Sending...') : 'Send Feedback'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </LanguageProvider>
  );
}
