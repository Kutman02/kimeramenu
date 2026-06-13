import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import type { MenuItem } from '../../../types/menu';

const DRAG_CLOSE_THRESHOLD = 150;
const DRAG_MAX_TRANSLATE = 260;
const DRAG_RESISTANCE = 0.85;

export function useItemDetailsModal() {
  const [itemStack, setItemStack] = useState<MenuItem[]>([]);
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartScrollTopRef = useRef(0);
  const openAnimationFrameRef = useRef<number | null>(null);

  const selectedItem = itemStack[itemStack.length - 1] ?? null;

  const resetSheet = useCallback(() => {
    setSheetTranslateY(0);
    setIsDraggingSheet(false);
  }, []);

  const cancelOpenAnimation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (openAnimationFrameRef.current == null) return;

    window.cancelAnimationFrame(openAnimationFrameRef.current);
    openAnimationFrameRef.current = null;
  }, []);

  const startOpenFromBottomAnimation = useCallback(() => {
    if (typeof window === 'undefined') {
      resetSheet();
      return;
    }

    cancelOpenAnimation();
    const startTranslate = Math.min(Math.max(window.innerHeight * 0.68, 300), 560);
    setIsDraggingSheet(false);
    setSheetTranslateY(startTranslate);

    openAnimationFrameRef.current = window.requestAnimationFrame(() => {
      setSheetTranslateY(0);
      openAnimationFrameRef.current = null;
    });
  }, [cancelOpenAnimation, resetSheet]);

  const openItemDetails = useCallback(
    (item: MenuItem) => {
      startOpenFromBottomAnimation();
      setItemStack([item]);
    },
    [startOpenFromBottomAnimation]
  );

  const openRelatedItemDetails = useCallback(
    (item: MenuItem) => {
      resetSheet();
      setItemStack((prev) => {
        if (!prev.length) return [item];
        if (prev[prev.length - 1]?.id === item.id) return prev;
        return [...prev, item];
      });
    },
    [resetSheet]
  );

  const closeItemDetails = useCallback(() => {
    cancelOpenAnimation();
    resetSheet();
    setItemStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : []));
  }, [cancelOpenAnimation, resetSheet]);

  const handleModalTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const body = modalBodyRef.current;
    if (!body) return;

    touchStartYRef.current = e.touches[0].clientY;
    touchStartScrollTopRef.current = body.scrollTop;
  }, []);

  const handleModalTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const body = modalBodyRef.current;
      if (!body || touchStartYRef.current == null) return;

      const deltaY = e.touches[0].clientY - touchStartYRef.current;
      const canSwipeClose =
        touchStartScrollTopRef.current <= 0 && body.scrollTop <= 0 && deltaY > 0;

      if (!canSwipeClose) {
        if (isDraggingSheet || sheetTranslateY !== 0) {
          setIsDraggingSheet(false);
          setSheetTranslateY(0);
        }
        return;
      }

      setIsDraggingSheet(true);
      setSheetTranslateY(Math.min(deltaY * DRAG_RESISTANCE, DRAG_MAX_TRANSLATE));
    },
    [isDraggingSheet, sheetTranslateY]
  );

  const handleModalTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    touchStartScrollTopRef.current = 0;

    if (!isDraggingSheet) return;

    if (sheetTranslateY > DRAG_CLOSE_THRESHOLD) {
      closeItemDetails();
      return;
    }

    setSheetTranslateY(0);
    setIsDraggingSheet(false);
  }, [closeItemDetails, isDraggingSheet, sheetTranslateY]);

  const isModalOpen = selectedItem !== null;

  useEffect(() => {
    if (!isModalOpen || typeof window === 'undefined') return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    return () => {
      html.style.scrollBehavior = 'auto';
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;
      html.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);

      requestAnimationFrame(() => {
        html.style.scrollBehavior = previousHtmlScrollBehavior;
      });
    };
  }, [isModalOpen]);

  useEffect(
    () => () => {
      cancelOpenAnimation();
    },
    [cancelOpenAnimation]
  );

  return {
    selectedItem,
    sheetTranslateY,
    isDraggingSheet,
    modalBodyRef,
    openItemDetails,
    openRelatedItemDetails,
    closeItemDetails,
    handleModalTouchStart,
    handleModalTouchMove,
    handleModalTouchEnd,
  };
}
