import { useEffect, useState } from 'react';
import type { Language } from '../../../types/menu';

const STORAGE_KEY = 'preferredLanguage';
const SUPPORTED_LANGUAGES: readonly Language[] = ['en', 'ru', 'tr'];

const isLanguage = (value: string | null): value is Language =>
  value !== null && SUPPORTED_LANGUAGES.includes(value as Language);

const readSavedLanguage = (): Language | null => {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(saved) ? saved : null;
};

export function usePreferredLanguage(defaultLanguage: Language = 'en') {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    () => readSavedLanguage() ?? defaultLanguage
  );
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    () => readSavedLanguage() !== null
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, currentLanguage);
  }, [currentLanguage]);

  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setHasSelectedLanguage(true);
  };

  return {
    currentLanguage,
    setCurrentLanguage,
    hasSelectedLanguage,
    selectLanguage,
  };
}
