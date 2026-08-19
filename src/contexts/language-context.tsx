import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import de from '@/locales/de.json';
import en from '@/locales/en.json';
import ka from '@/locales/ka.json';

export type Language = 'en' | 'ka' | 'de';

type Dictionary = Record<string, unknown>;

const DICTIONARIES: Record<Language, Dictionary> = { en, ka, de };

const LANGUAGE_LABELS: Record<Language, string> = { en: 'EN', ka: 'ქა', de: 'DE' };

/** The picker's options, each named in its own language. */
export const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: 'ka', label: LANGUAGE_LABELS.ka, name: 'ქართული' },
  { code: 'en', label: LANGUAGE_LABELS.en, name: 'English' },
  { code: 'de', label: LANGUAGE_LABELS.de, name: 'Deutsch' },
];

/** The web SPA's key, so a language chosen in either carries over when both are served from the
 *  same origin. */
const STORAGE_KEY = 'farm.language';

type LanguageContextValue = {
  language: Language;
  languageLabel: string;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function resolve(dict: Dictionary, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Dictionary)[part];
    }
    return undefined;
  }, dict);
}

/** Georgian by default, as in the web SPA — this is a Georgian farm's market. */
function readStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null && stored in DICTIONARIES ? (stored as Language) : 'ka';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = DICTIONARIES[language];
    const setLanguage = (next: Language) => {
      localStorage.setItem(STORAGE_KEY, next);
      setLanguageState(next);
    };
    return {
      language,
      languageLabel: LANGUAGE_LABELS[language],
      setLanguage,
      // A key that resolves to nothing renders as itself, exactly as in the SPA — silently, with
      // no warning, so a typo ships as `market.titel` on screen. All three files stay in step.
      t: (key, params) => {
        const found = resolve(dict, key);
        if (typeof found !== 'string') return key;
        if (!params) return found;
        return found.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ''));
      },
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
