import type { Language } from '../../types/menu';

export interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  className?: string;
}

export function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  className = '',
}: LanguageSwitcherProps) {
  const languages: Language[] = ['en', 'ru', 'tr'];
  const languageNames = {
    en: '🇬🇧 EN',
    ru: '🇷🇺 РУ',
    tr: '🇹🇷 TR',
  };

  const languageFull = {
    en: '🇬🇧 English',
    ru: '🇷🇺 Русский',
    tr: '🇹🇷 Türkçe',
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            currentLanguage === lang
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={languageFull[lang]}
        >
          {languageNames[lang]}
        </button>
      ))}
    </div>
  );
}
