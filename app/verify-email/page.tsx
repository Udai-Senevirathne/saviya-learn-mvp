'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsLoaded(true);
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(t('verifyEmail.tokenMissing'));
      return;
    }

    verifyEmail(token);
  }, [searchParams, t]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.get(`/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message || t('verifyEmail.success'));

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || t('verifyEmail.failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-green-300/30 to-blue-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative z-10 border border-white/50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {status === 'loading' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {t('verifyEmail.verifyingTitle')}
            </h1>
            <p className="text-gray-600">{t('verifyEmail.pleaseWait')}</p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-scale-in">
            <div className="mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
               {t('verifyEmail.successTitle')}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4 animate-pulse">{t('verifyEmail.redirecting')}</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg font-semibold">
              {t('verifyEmail.goToLogin')} 
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-shake">
            <div className="mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              {t('verifyEmail.failedTitle')}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/signup" className="block px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 hover:shadow-lg font-semibold">
                 {t('verifyEmail.signUpAgain')}
              </Link>
              <Link href="/login" className="block px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 font-semibold">
                 {t('verifyEmail.backToLogin')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-blue-50 to-indigo-100">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
