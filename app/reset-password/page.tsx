'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = searchParams.get('token');

    if (!token) {
      setError(t('resetPassword.tokenMissing'));
      return;
    }

    if (!password || password.length < 6) {
      setError(t('resetPassword.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordsNoMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      setSuccess(response.data.message || t('resetPassword.success'));
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('resetPassword.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-indigo-50 to-blue-100 relative overflow-hidden">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-purple-300/30 to-indigo-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-indigo-300/30 to-blue-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Floating Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[20%] text-4xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 right-[25%] text-3xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg animate-bounce-in">
            <span className="text-3xl"></span>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {t('resetPassword.title')}
          </h1>
          <p className="text-gray-600">{t('resetPassword.subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-shake flex items-center gap-3">
            <span className="text-xl"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-scale-in flex items-center gap-3">
            <span className="text-xl"></span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('resetPassword.newPasswordLabel')}
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"></span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 hover:bg-white focus:bg-white input-focus text-gray-900 placeholder-gray-400" placeholder={t('resetPassword.newPasswordPlaceholder')} required />
            </div>
          </div>

          <div className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('resetPassword.confirmPasswordLabel')}
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"></span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 hover:bg-white focus:bg-white input-focus text-gray-900 placeholder-gray-400" placeholder={t('resetPassword.confirmPasswordPlaceholder')} required />
            </div>
          </div>

          <div className={`transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] btn-animate flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('resetPassword.resetting')}</span>
                </>
              ) : (
                <>
                  <span></span>
                  <span>{t('resetPassword.resetButton')}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className={`mt-6 text-center transition-all duration-500 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/login" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all duration-200">
            <span></span>
            <span>{t('resetPassword.backToLogin')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-indigo-50 to-blue-100">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
