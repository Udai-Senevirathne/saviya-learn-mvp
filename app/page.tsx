'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

// Typewriter Animation Hook - loops continuously
function useTypewriter(text: string, speed: number = 50, pauseDuration: number = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      if (!isDeleting) {
        // Typing
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(tick, speed);
        } else {
          // Finished typing, pause then start deleting
          setIsTyping(false);
          timeoutId = setTimeout(() => {
            isDeleting = true;
            setIsTyping(true);
            tick();
          }, pauseDuration);
        }
      } else {
        // Deleting
        if (currentIndex > 0) {
          currentIndex--;
          setDisplayText(text.slice(0, currentIndex));
          timeoutId = setTimeout(tick, speed / 2); // Delete faster
        } else {
          // Finished deleting, pause then start typing again
          isDeleting = false;
          setIsTyping(false);
          timeoutId = setTimeout(() => {
            setIsTyping(true);
            tick();
          }, 500);
        }
      }
    };

    timeoutId = setTimeout(tick, 500); // Initial delay

    return () => clearTimeout(timeoutId);
  }, [text, speed, pauseDuration]);

  return { displayText, isTyping };
}

// Animated Counter Hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

// Counter Component
function AnimatedCounter({ value, label, suffix = '+' }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value, 2000);
  
  return (
    <div 
      ref={ref}
      className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50"
    >
      <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const heroTitle = t('landing.heroTitle');
  const { displayText, isTyping } = useTypewriter(heroTitle, 80, 2000);

  useEffect(() => {
    // Check if user is already logged in
    const user = getUser();
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
      return;
    }
    // Trigger animations after mount with requestAnimationFrame
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className={`bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">📚</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{t('common.appName')}</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSelector />
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105"
              >
                {t('landing.signIn')}
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-105 btn-animate"
              >
                {t('landing.getStarted')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'}`}>
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
              <LanguageSelector />
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('landing.signIn')}
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-300 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('landing.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="whitespace-nowrap">
                {displayText.includes(',') ? (
                  <>
                    {displayText.split(',')[0]},{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                      {displayText.split(',')[1]}
                    </span>
                  </>
                ) : (
                  displayText
                )}
                <span className={`text-blue-600 ${isTyping ? 'animate-pulse' : 'animate-blink'}`}>|</span>
              </span>
            </h1>
            <p className={`text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200 px-4 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="italic">&ldquo;{t('landing.heroSubtitle')}&rdquo;</span>
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center px-4 transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link
                href="/signup"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 text-base sm:text-lg hover:shadow-xl hover:shadow-blue-300 hover:scale-105 hover:-translate-y-1 btn-animate"
              >
                {t('landing.getStarted')}
              </Link>
              <Link
                href="/login"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all duration-300 border border-gray-200 text-base sm:text-lg hover:border-blue-300 hover:scale-105 hover:-translate-y-1"
              >
                {t('landing.signIn')}
              </Link>
            </div>
          </div>

          {/* Stats with Animated Counters */}
          <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <AnimatedCounter value={500} label={t('landing.activeStudents')} />
            <AnimatedCounter value={50} label={t('landing.studyGroups')} />
            <AnimatedCounter value={200} label={t('landing.tutoringSessions')} />
            <AnimatedCounter value={95} label={t('landing.successRate')} suffix="%" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.whyChooseUs')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing.discoverBenefits')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ), 
                title: t('landing.peerLearning'), 
                desc: t('landing.peerLearningDesc'), 
                gradient: 'from-blue-50 to-indigo-50', 
                iconBg: 'bg-blue-100' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                ), 
                title: t('landing.expertTutors'), 
                desc: t('landing.expertTutorsDesc'), 
                gradient: 'from-green-50 to-emerald-50', 
                iconBg: 'bg-green-100' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                title: t('landing.flexibleSchedule'), 
                desc: t('landing.flexibleScheduleDesc'), 
                gradient: 'from-purple-50 to-violet-50', 
                iconBg: 'bg-purple-100' 
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className={`bg-linear-to-br ${feature.gradient} rounded-2xl p-8 card-hover group cursor-default list-item-animate`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-linear-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('landing.readyToStart')}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {t('landing.joinThousands')}
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1"
          >
            {t('landing.createFreeAccount')} 
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">📚</span>
                <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{t('common.appName')}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                {t('auth.brandingDescription')}
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/signup" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('auth.signup')}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('auth.login')}
                  </Link>
                </li>
                <li>
                  <Link href="/groups" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('nav.groups')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">{t('help.title')}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('help.faq')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('help.contactUs')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('auth.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    {t('auth.termsOfService')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">{t('common.copyright')}</p>
              <p className="text-sm flex items-center gap-1">
                Made in Sri Lanka
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
