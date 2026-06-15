import type { TouchEventHandler } from 'react';
import type { Language, RestaurantConfig } from '../../types/menu';
import {
  cuisineSectionTitle,
  drawerTitle,
  languageLabels,
  languageSectionTitle,
  LANGUAGE_OPTIONS,
  swipeToCloseHint,
} from './Header.constants';

interface HeaderDrawerProps {
  menuOpen: boolean;
  menuId: string;
  restaurant: RestaurantConfig;
  currentLanguage: Language;
  drawerTranslateX: number;
  drawerOpacity: number;
  isDraggingDrawer: boolean;
  onClose: () => void;
  onLanguageChange: (language: Language) => void;
  onTouchStart: TouchEventHandler<HTMLDivElement>;
  onTouchMove: TouchEventHandler<HTMLDivElement>;
  onTouchEnd: TouchEventHandler<HTMLDivElement>;
}

export function HeaderDrawer({
  menuOpen,
  menuId,
  restaurant,
  currentLanguage,
  drawerTranslateX,
  drawerOpacity,
  isDraggingDrawer,
  onClose,
  onLanguageChange,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: HeaderDrawerProps) {
  return (
    <div
      id={menuId}
      className={`fixed inset-y-0 left-0 z-70 flex w-[min(22rem,92vw)] flex-col border-r border-white/10 bg-linear-to-b from-slate-900 to-purple-950 text-white shadow-2xl ${
        menuOpen ? '' : 'pointer-events-none'
      }`}
      aria-hidden={!menuOpen}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
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
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-purple-100/90 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-200/80"
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
        <section className="border-b border-white/10 pb-5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {restaurant.displayName[currentLanguage]}
          </h1>
          {restaurant.description && (
            <p className="mt-2 text-sm leading-relaxed text-purple-100/95">
              {restaurant.description[currentLanguage]}
            </p>
          )}
        </section>

        <section className="border-b border-white/10 py-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-purple-200/90">
            {languageSectionTitle[currentLanguage]}
          </p>
          <div className="flex flex-col gap-2">
            {LANGUAGE_OPTIONS.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => onLanguageChange(language)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  currentLanguage === language
                    ? 'bg-white text-purple-900 shadow-md'
                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {languageLabels[language]}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-purple-200/90">
            {cuisineSectionTitle[currentLanguage]}
          </p>
          <ul className="space-y-2">
            {restaurant.cuisineTypes?.map((cuisineType) => (
              <li key={cuisineType}>
                <span className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/95">
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/30 text-base">
                    ✦
                  </span>
                  {cuisineType}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
