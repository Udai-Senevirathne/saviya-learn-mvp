'use client';

import { createContext, useContext, ReactNode, useSyncExternalStore, useCallback } from 'react';
import { Language, t as translate } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Storage subscription for language
const subscribers = new Set<() => void>();

function getLanguageSnapshot(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('language') as Language;
  return saved && ['en', 'si', 'ta'].includes(saved) ? saved : 'en';
}

function getServerSnapshot(): Language {
  return 'en';
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, getServerSnapshot);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    subscribers.forEach(callback => callback());
  }, []);

  const t = useCallback((key: string) => translate(key, language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
