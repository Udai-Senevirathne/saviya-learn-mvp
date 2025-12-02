'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Lock, Mail, AlertCircle, CheckCircle, ArrowLeft, Loader2, Shield, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
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

    if (!email) {
      setError(t('forgotPassword.emailRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/auth/request-password-reset', { email });
      setSuccess(response.data.message || t('forgotPassword.resetLinkSent'));
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgotPassword.sendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden px-4 py-8">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <Shield className="absolute top-20 left-[15%] w-12 h-12 text-white/10 animate-float" style={{ animationDelay: '0s' }} />
        <Mail className="absolute bottom-32 right-[20%] w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <Lock className="absolute top-40 right-[30%] w-8 h-8 text-white/10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10 border border-white/50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className={`text-center mb-6 sm:mb-8 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg animate-bounce-in">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">{t('forgotPassword.subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl animate-shake flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl animate-scale-in flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('forgotPassword.emailLabel')}
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-400 text-base" placeholder={t('forgotPassword.emailPlaceholder')} required />
            </div>
          </div>

          <div className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 text-base">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('forgotPassword.sending')}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t('forgotPassword.sendButton')}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className={`mt-5 sm:mt-6 text-center transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-indigo-600 font-semibold hover:underline transition-all duration-200 text-sm sm:text-base group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('forgotPassword.backToLogin')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
