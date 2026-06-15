import { useCallback, useEffect, useId, useRef, useState, type TouchEvent } from 'react';
import {
  DRAWER_CLOSE_THRESHOLD,
  DRAWER_DRAG_RESISTANCE,
  DRAWER_MAX_TRANSLATE,
} from './Header.constants';

export function useHeaderDrawer() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerTranslateX, setDrawerTranslateX] = useState(0);
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const menuId = useId();
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const resetDrawerDrag = useCallback(() => {
    setDrawerTranslateX(0);
    setIsDraggingDrawer(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  }, []);

  const closeMenu = useCallback(() => {
    resetDrawerDrag();
    setMenuOpen(false);
  }, [resetDrawerDrag]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((opened) => {
      const nextOpened = !opened;
      if (!nextOpened) {
        resetDrawerDrag();
      }
      return nextOpened;
    });
  }, [resetDrawerDrag]);

  const handleDrawerTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  const handleDrawerTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
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
    },
    [drawerTranslateX, isDraggingDrawer]
  );

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeMenu, menuOpen]);

  const drawerOpacity = isDraggingDrawer ? Math.max(0.82, 1 - drawerTranslateX / 420) : 1;
  const backdropOpacity = menuOpen
    ? isDraggingDrawer
      ? Math.max(0.01, 0.06 - drawerTranslateX / 1000)
      : 0.06
    : 0;

  return {
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
  };
}
