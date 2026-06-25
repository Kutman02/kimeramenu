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
      className={`fixed inset-y-0 left-0 z-70 flex w-[min(22rem,92vw)] flex-col border-r border-[#8ea584]/30 bg-linear-to-b from-[#313d31] via-[#2b362c] to-[#263126] text-[#eef3e8] shadow-2xl ${
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
      <div className="shrink-0 border-b border-[#d6dfcc]/15 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[#d6dfcc]/85">
            {drawerTitle[currentLanguage]}
          </p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#dce4d2] transition hover:bg-[#d6dfcc]/10 hover:text-[#f7faf3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6dfcc]/70"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#d6dfcc]/80">
          {swipeToCloseHint[currentLanguage]}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <section className="border-b border-[#d6dfcc]/15 pb-5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {restaurant.displayName[currentLanguage]}
          </h1>
          {restaurant.description && (
            <p className="mt-2 text-sm leading-relaxed text-[#dbe4d1]/85">
              {restaurant.description[currentLanguage]}
            </p>
          )}
        </section>

        <section className="border-b border-[#d6dfcc]/15 py-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#d6dfcc]/90">
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
                    ? 'border border-[#d4dfc8] bg-[#f2f6ec] text-[#2f3a2f] shadow-sm'
                    : 'border border-[#d6dfcc]/20 bg-white/5 text-[#eef3e8] hover:bg-white/10'
                }`}
              >
                {languageLabels[language]}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#d6dfcc]/90">
            {cuisineSectionTitle[currentLanguage]}
          </p>
          <ul className="space-y-2">
            {restaurant.cuisineTypes?.map((cuisineType) => (
              <li key={cuisineType}>
                <span className="flex items-center rounded-xl border border-[#d6dfcc]/20 bg-white/5 px-4 py-3 text-sm font-medium text-[#eef3e8]">
                  <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b7c8a8]/20 text-base text-[#dce8d0]">
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
