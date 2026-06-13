import { useCallback, useEffect, useId, useRef, useState, type TouchEvent } from 'react';
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

const swipeToCloseHint: Record<Language, string> = {
  en: 'Swipe left to close',
  ru: 'Смахните влево, чтобы закрыть',
  tr: 'Kapatmak icin sola kaydirin',
};

const DRAWER_CLOSE_THRESHOLD = 90;
const DRAWER_MAX_TRANSLATE = 220;
const DRAWER_DRAG_RESISTANCE = 0.9;

export function Header({ restaurant, currentLanguage, onLanguageChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerTranslateX, setDrawerTranslateX] = useState(0);
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const menuId = useId();
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const resetDrawerDrag = useCallback(() => {
    setDrawerTranslateX(0);
    setIsDraggingDrawer(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  }, []);

  const handleDrawerTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleDrawerTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current == null || touchStartYRef.current == null) return;

    const deltaX = touchStartXRef.current - e.touches[0].clientX;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    const horizontalGesture = Math.abs(deltaX) > deltaY;
    const canSwipeClose = horizontalGesture && deltaX > 0;

    if (!canSwipeClose) {
      if (isDraggingDrawer || drawerTranslateX !== 0) {
        setIsDraggingDrawer(false);
        setDrawerTranslateX(0);
      }
      return;
    }

    setIsDraggingDrawer(true);
    setDrawerTranslateX(Math.min(deltaX * DRAWER_DRAG_RESISTANCE, DRAWER_MAX_TRANSLATE));
  }, [drawerTranslateX, isDraggingDrawer]);

  const handleDrawerTouchEnd = useCallback(() => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (!isDraggingDrawer) return;

    if (drawerTranslateX > DRAWER_CLOSE_THRESHOLD) {
      closeMenu();
      return;
    }

    setDrawerTranslateX(0);
    setIsDraggingDrawer(false);
  }, [closeMenu, drawerTranslateX, isDraggingDrawer]);

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

  useEffect(() => {
    if (menuOpen) return;
    resetDrawerDrag();
  }, [menuOpen, resetDrawerDrag]);

  if (!restaurant) return null;

  const languages: Language[] = ['en', 'ru', 'tr'];
  const drawerOpacity = isDraggingDrawer ? Math.max(0.82, 1 - drawerTranslateX / 420) : 1;
  const backdropOpacity = menuOpen
    ? isDraggingDrawer
      ? Math.max(0.01, 0.06 - drawerTranslateX / 1000)
      : 0.06
    : 0;

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
          className="fixed inset-0 z-[60] backdrop-blur-[1px] transition-colors"
          aria-label="Close menu"
          onClick={closeMenu}
          style={{ backgroundColor: `rgba(15, 23, 42, ${backdropOpacity})` }}
        />
      )}

      <div
        id={menuId}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[min(22rem,92vw)] flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 to-purple-950 text-white shadow-2xl ${
          menuOpen ? '' : 'pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
        onTouchCancel={handleDrawerTouchEnd}
        style={{
          transform: menuOpen ? `translateX(${-drawerTranslateX}px)` : 'translateX(-100%)',
          opacity: drawerOpacity,
          transition: isDraggingDrawer
            ? 'none'
            : 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 240ms ease',
        }}
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-purple-200/80">
              {drawerTitle[currentLanguage]}
            </p>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-purple-100/90 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-200/80"
            >
              <span aria-hidden className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-purple-200/80">
            {swipeToCloseHint[currentLanguage]}
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
