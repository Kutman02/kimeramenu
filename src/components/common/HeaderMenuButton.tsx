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
      className={`pointer-events-auto relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ca884]/70 sm:h-11 sm:w-11 ${
        menuOpen
          ? 'border-[#5f745a] bg-[#5a7056] text-[#f6f9f1] shadow-[0_4px_10px_rgba(33,49,31,0.22)]'
          : 'border-[#d8dfcd] bg-[#f5f8f0] text-[#486246] shadow-sm hover:border-[#cdd7be] hover:bg-[#edf3e4]'
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
        className={`pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border bg-[#f7faf2] text-[11px] leading-none shadow-[0_2px_6px_rgba(33,49,31,0.18)] ring-1 ${
          menuOpen
            ? 'border-[#e3e9d8] ring-[#d7e0cb]'
            : 'border-[#d8dfcd] ring-[#e7eedb]'
        }`}
      >
        {languageFlags[currentLanguage]}
      </span>
    </button>
  );
}
