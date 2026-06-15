import type { RestaurantConfig, Language } from '../../types/menu';
import { HeaderBackdrop } from './HeaderBackdrop';
import { HeaderDrawer } from './HeaderDrawer';
import { HeaderMenuButton } from './HeaderMenuButton';
import { useHeaderDrawer } from './useHeaderDrawer';

export interface HeaderProps {
  restaurant: RestaurantConfig | null;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function Header({ restaurant, currentLanguage, onLanguageChange }: HeaderProps) {
  const {
    menuOpen,
    menuId,
    drawerTranslateX,
    isDraggingDrawer,
    drawerOpacity,
    backdropOpacity,
    closeMenu,
    toggleMenu,
    handleDrawerTouchStart,
    handleDrawerTouchMove,
    handleDrawerTouchEnd,
  } = useHeaderDrawer();

  if (!restaurant) return null;

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-7xl justify-start px-3 py-3 sm:px-5 sm:py-4">
          <HeaderMenuButton menuOpen={menuOpen} menuId={menuId} onToggle={toggleMenu} />
        </div>
      </header>

      <HeaderBackdrop menuOpen={menuOpen} backdropOpacity={backdropOpacity} onClose={closeMenu} />
      <HeaderDrawer
        menuOpen={menuOpen}
        menuId={menuId}
        restaurant={restaurant}
        currentLanguage={currentLanguage}
        drawerTranslateX={drawerTranslateX}
        drawerOpacity={drawerOpacity}
        isDraggingDrawer={isDraggingDrawer}
        onClose={closeMenu}
        onLanguageChange={onLanguageChange}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
      />
    </>
  );
}
