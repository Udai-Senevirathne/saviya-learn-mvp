'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

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
    memberCount: number;
  }>;
  recentActivity: Array<{
    _id: string;
    actionType: string;
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchHome();
  }, []);

  const fetchHome = async () => {
    try {
      // Use existing endpoints to build stats
      let userGroups: any[] = [];
      let recentActivity: any[] = [];
      let userSessions: any[] = [];
      let userResources: any[] = [];
      
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
    } catch (err: any) {
      console.error('Failed to fetch home data:', err);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/');
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-linear-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-linear-to-br from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Navigation Header */}
      <header className={`bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-2xl"></span>
                {t('common.appName')}
              </h1>
              <nav className="hidden md:flex gap-6">
                <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 transition-all duration-200">{t('home.nav.home')}</button>
                <button onClick={() => router.push('/groups')} className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105">{t('home.nav.groups')}</button>
                <button onClick={() => router.push('/help')} className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105">{t('home.nav.communityHelp')}</button>
                <button className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105">{t('home.nav.sessions')}</button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <button onClick={() => router.push('/profile')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-md">
                 {t('home.profile')}
              </button>
              <button onClick={handleLogout} className="px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 hover:shadow-md">
                {t('home.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className={`bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-3xl font-bold mb-2 animate-fade-in">
                {t('home.welcome')}, {user?.profile?.name || t('home.student')}! 
              </h2>
              <p className="text-blue-100 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t('home.welcomeSubtitle')}
              </p>
            </div>
            <div className="text-7xl animate-bounce-in hidden md:block"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: t('home.stats.myGroups'), value: stats?.statistics.groupCount || 0, icon: '', color: 'blue', delay: '150' },
            { label: t('home.stats.sessionsJoined'), value: stats?.statistics.sessionCount || 0, icon: '', color: 'green', delay: '200' },
            { label: t('home.stats.activeNow'), value: stats?.statistics.activeSessions || 0, icon: '', color: 'purple', delay: '250' },
            { label: t('home.stats.resources'), value: stats?.statistics.resourceCount || 0, icon: '', color: 'orange', delay: '300' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-${stat.color}-500 card-hover transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${stat.delay}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
                </div>
                <div className="text-4xl hover:scale-125 transition-transform duration-300">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* My Groups */}
          <div className={`lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span></span> {t('home.myLearningGroups')}
              </h2>
              <button onClick={() => router.push('/groups')} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200">
                {t('home.viewAll')} <span></span>
              </button>
            </div>
            {stats?.groups && stats.groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.groups.slice(0, 4).map((group, index) => (
                  <div key={group._id} onClick={() => router.push(`/groups/${group._id}`)} className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white/50 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{group.subject}</h3>
                        <p className="text-sm text-gray-600 mt-1">{group.topic}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {t('home.grade')} {group.grade}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span></span> {group.memberCount} {t('home.members')}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl hover:scale-110 transition-transform"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce-in"></div>
                <p className="text-gray-500 mb-4">{t('home.noGroups')}</p>
                <button onClick={() => router.push('/groups')} className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg">
                   {t('home.exploreGroups')}
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span></span> {t('home.recentActivity')}
            </h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 6).map((activity, index) => {
                  const actionIcons: { [key: string]: string } = {
                    'joined_group': '',
                    'left_group': '',
                    'joined_session': '',
                    'uploaded_resource': '',
                    'created_group': '',
                    'completed_session': '',
                    'resource_create': '',
                    'name_change': '',
                  };
                  const userName = activity.userId?.profile?.name || activity.userId?.email || 'You';
                  return (
                    <div key={activity._id} className="flex items-start gap-3 border-l-2 border-blue-500 pl-3 py-2 hover:bg-blue-50/50 transition-all duration-200 rounded-r-lg animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="text-xl">{actionIcons[activity.actionType] || ''}</div>
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
                <div className="text-5xl mb-3 animate-bounce-in"></div>
                <p className="text-sm text-gray-500">{t('home.noActivity')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span></span> {t('home.quickActions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => router.push('/groups')} className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300"></div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{t('home.actions.exploreGroups')}</div>
            </button>
            <button onClick={() => router.push('/groups')} className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300"></div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">{t('home.actions.createGroup')}</div>
            </button>
            <button onClick={() => router.push('/help')} className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300"></div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">{t('home.actions.getHelp')}</div>
            </button>
            <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300"></div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{t('home.actions.scheduleSession')}</div>
            </button>
          </div>
        </div>

        {/* User Reputation Section */}
        {user?.reputation && (
          <div className={`bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl p-8 text-white relative overflow-hidden transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 relative z-10">
              <span className="animate-pulse"></span> {t('home.yourImpact')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-4xl font-bold mb-2">{user.reputation.points || 0}</p>
                <p className="text-sm text-indigo-100">{t('home.reputation.points')}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-4xl font-bold mb-2">{user.reputation.sessionsTaught || 0}</p>
                <p className="text-sm text-indigo-100">{t('home.reputation.sessionsTaught')}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-4xl font-bold mb-2">{user.reputation.resourcesShared || 0}</p>
                <p className="text-sm text-indigo-100">{t('home.reputation.resourcesShared')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
