interface HeaderMenuButtonProps {
  menuOpen: boolean;
  menuId: string;
  onToggle: () => void;
}

const OPEN_MENU_LABEL = 'Open menu';
const CLOSE_MENU_LABEL = 'Close menu';

export function HeaderMenuButton({ menuOpen, menuId, onToggle }: HeaderMenuButtonProps) {
  const ariaLabel = menuOpen ? CLOSE_MENU_LABEL : OPEN_MENU_LABEL;

  return (
    <button
      type="button"
      className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 opacity-40 shadow-none transition hover:bg-slate-900/4 hover:opacity-90 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400/50 sm:h-11 sm:w-11"
      aria-expanded={menuOpen}
      aria-controls={menuId}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      <span className="sr-only">{ariaLabel}</span>
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
            menuOpen ? 'translate-y-[-7px] -rotate-45' : ''
          }`}
        />
      </span>
    </button>
  );
}
