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
      className={`fixed inset-y-0 left-0 z-70 flex w-[min(23rem,92vw)] flex-col overflow-hidden rounded-r-3xl border-r border-emerald-200/80 bg-linear-to-b from-white via-emerald-50/65 to-amber-50/40 text-slate-800 shadow-[0_22px_60px_rgba(2,44,34,0.28)] ${
        menuOpen ? '' : 'pointer-events-none'
      }`}
      aria-hidden={!menuOpen}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{
        transform: menuOpen ? `translateX(${-drawerTranslateX}px)` : 'translateX(-106%)',
        opacity: drawerOpacity,
        transition: isDraggingDrawer
          ? 'none'
          : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease',
      }}
    >
      <div className="shrink-0 px-3 pt-[calc(env(safe-area-inset-top,0)+12px)] sm:px-4">
        <div className="mb-2 flex items-start justify-between gap-3 rounded-2xl border border-emerald-100/90 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700/85">
              {drawerTitle[currentLanguage]}
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
              {restaurant.displayName[currentLanguage]}
            </h1>
            {restaurant.description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {restaurant.description[currentLanguage]}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white/90 text-lg text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-white hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/60"
          >
            <span aria-hidden className="leading-none">
              ✕
            </span>
          </button>
        </div>
        <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80">
          {swipeToCloseHint[currentLanguage]}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom,0)+16px)] sm:px-4">
        <section className="mb-3 rounded-2xl border border-emerald-200/80 bg-white/85 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm">
            {languageSectionTitle[currentLanguage]}
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => onLanguageChange(language)}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition duration-200 ${
                  currentLanguage === language
                    ? 'border-emerald-800 bg-linear-to-r from-emerald-900 to-emerald-700 text-emerald-50 shadow-[0_0_0_3px_rgba(6,78,59,0.16)]'
                    : 'border-emerald-100 bg-white text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/70'
                }`}
              >
                {languageLabels[language]}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl border border-emerald-200/80 bg-linear-to-br from-white to-emerald-50/80 p-3 shadow-sm sm:p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm">
            {cuisineSectionTitle[currentLanguage]}
          </p>
          <ul className="space-y-2">
            {restaurant.cuisineTypes?.map((cuisineType) => (
              <li key={cuisineType}>
                <span className="flex items-center rounded-xl border border-emerald-100/90 bg-white/80 px-4 py-3 text-sm font-medium text-emerald-900">
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-base text-emerald-700">
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
