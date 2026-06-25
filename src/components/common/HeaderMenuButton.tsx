import type { Language } from '../../types/menu';
import { languageFlags } from './Header.constants';

interface HeaderMenuButtonProps {
  currentLanguage: Language;
  menuOpen: boolean;
  menuId: string;
  onToggle: () => void;
}

const OPEN_MENU_LABEL = 'Open menu';
const CLOSE_MENU_LABEL = 'Close menu';

export function HeaderMenuButton({
  currentLanguage,
  menuOpen,
  menuId,
  onToggle,
}: HeaderMenuButtonProps) {
  const ariaLabel = menuOpen ? CLOSE_MENU_LABEL : OPEN_MENU_LABEL;

  return (
    <button
      type="button"
      className={`pointer-events-auto group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/60 sm:h-11 sm:w-11 ${
        menuOpen
          ? 'border-emerald-800 bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-emerald-50 shadow-[0_10px_24px_rgba(6,78,59,0.35)]'
          : 'border-emerald-200/90 bg-linear-to-b from-white to-emerald-50/70 text-emerald-800 shadow-[0_6px_16px_rgba(5,150,105,0.14)] hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_10px_20px_rgba(5,150,105,0.2)]'
      }`}
      aria-expanded={menuOpen}
      aria-controls={menuId}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      <span className="sr-only">{ariaLabel}</span>
      <span className="flex h-4 w-[19px] flex-col justify-center gap-[4px]" aria-hidden>
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
            menuOpen ? 'translate-y-[6px] rotate-45' : ''
          }`}
        />
        <span
          className={`h-0.5 w-3.5 self-end rounded-full bg-current transition-all duration-200 ${
            menuOpen ? 'scale-x-0 opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
            menuOpen ? 'translate-y-[-6px] -rotate-45' : ''
          }`}
        />
      </span>
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border bg-white/95 text-[11px] leading-none shadow-[0_2px_8px_rgba(15,23,42,0.25)] ring-1 ${
          menuOpen
            ? 'border-white/90 ring-emerald-500/45'
            : 'border-emerald-200 ring-emerald-300/80'
        }`}
      >
        {languageFlags[currentLanguage]}
      </span>
    </button>
  );
}
