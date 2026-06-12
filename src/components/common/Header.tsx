import { useCallback, useEffect, useId, useState } from 'react';
import type { RestaurantConfig, Language } from '../../types/menu';

export interface HeaderProps {
  restaurant: RestaurantConfig | null;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const languageLabels: Record<Language, string> = {
  en: '🇬🇧 English',
  ru: '🇷🇺 Русский',
  tr: '🇹🇷 Türkçe',
};

const cuisineSectionTitle: Record<Language, string> = {
  en: 'Cuisine',
  ru: 'Кухня',
  tr: 'Mutfak',
};

const languageSectionTitle: Record<Language, string> = {
  en: 'Language',
  ru: 'Язык',
  tr: 'Dil',
};

const drawerTitle: Record<Language, string> = {
  en: 'Menu',
  ru: 'Меню',
  tr: 'Menü',
};

export function Header({ restaurant, currentLanguage, onLanguageChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen, closeMenu]);

  if (!restaurant) return null;

  const languages: Language[] = ['en', 'ru', 'tr'];

  return (
    <>
      {/* Прозрачный хедер: только один гамбургер, клики мимо кнопки проходят к контенту */}
      <header className="pointer-events-none sticky top-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-7xl justify-start px-3 py-3 sm:px-5 sm:py-4">
          <button
            type="button"
            className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 opacity-40 shadow-none transition hover:bg-slate-900/[0.04] hover:opacity-90 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400/50 sm:h-11 sm:w-11"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className="flex h-3.5 w-[18px] flex-col justify-center gap-[5px]" aria-hidden>
              <span
                className={`h-0.5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 rounded-full bg-current transition-opacity duration-200 ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`h-0.5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Лёгкий прозрачный фон — не перекрывает интерфейс тяжёлым слоем */}
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-slate-900/[0.06] backdrop-blur-[1px] transition-opacity"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

      <div
        id={menuId}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[min(22rem,92vw)] flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 to-purple-950 text-white shadow-2xl transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Без второй кнопки закрытия — только гамбургер в хедере + клик по фону + Esc */}
        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-purple-200/80">
            {drawerTitle[currentLanguage]}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <div className="border-b border-white/10 pb-5">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {restaurant.displayName[currentLanguage]}
            </h1>
            {restaurant.description && (
              <p className="mt-2 text-sm leading-relaxed text-purple-100/95">
                {restaurant.description[currentLanguage]}
              </p>
            )}
          </div>

          <div className="border-b border-white/10 py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-purple-200/90">
              {languageSectionTitle[currentLanguage]}
            </p>
            <div className="flex flex-col gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    currentLanguage === lang
                      ? 'bg-white text-purple-900 shadow-md'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-purple-200/90">
              {cuisineSectionTitle[currentLanguage]}
            </p>
            <ul className="space-y-2">
              {restaurant.cuisineTypes?.map((type) => (
                <li key={type}>
                  <span className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/95">
                    <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/30 text-base">
                      ✦
                    </span>
                    {type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
