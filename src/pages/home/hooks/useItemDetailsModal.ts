import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import type { MenuItem } from '../../../types/menu';

const DRAG_CLOSE_THRESHOLD = 150;
const DRAG_MAX_TRANSLATE = 260;
const DRAG_RESISTANCE = 0.85;
const OPEN_ANIMATION_DURATION_MS = 280;
const CLOSE_ANIMATION_DURATION_MS = 220;
const getViewportHeight = () => {
  if (typeof window === 'undefined') return 720;
  return window.visualViewport?.height ?? window.innerHeight;
};
const getSheetAnimationTranslate = (viewportHeight: number) =>
  Math.min(Math.max(viewportHeight * 0.56, 260), 460);

export function useItemDetailsModal() {
  const [itemStack, setItemStack] = useState<MenuItem[]>([]);
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const [isOpeningSheet, setIsOpeningSheet] = useState(false);
  const [isClosingSheet, setIsClosingSheet] = useState(false);
  const [isPreparingOpenPosition, setIsPreparingOpenPosition] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartScrollTopRef = useRef(0);
  const openAnimationFrameRef = useRef<number | null>(null);
  const openAnimationTimeoutRef = useRef<number | null>(null);
  const closeAnimationFrameRef = useRef<number | null>(null);
  const closeAnimationTimeoutRef = useRef<number | null>(null);
  const imageCacheRef = useRef(new Set<string>());

  const selectedItem = itemStack[itemStack.length - 1] ?? null;

  const resetSheet = useCallback(() => {
    setSheetTranslateY(0);
    setIsDraggingSheet(false);
    setIsOpeningSheet(false);
    setIsClosingSheet(false);
    setIsPreparingOpenPosition(false);
  }, []);

  const cancelOpenAnimation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (openAnimationFrameRef.current == null) return;

    window.cancelAnimationFrame(openAnimationFrameRef.current);
    openAnimationFrameRef.current = null;
  }, []);

  const cancelOpenAnimationTimeout = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (openAnimationTimeoutRef.current == null) return;

    window.clearTimeout(openAnimationTimeoutRef.current);
    openAnimationTimeoutRef.current = null;
  }, []);

  const cancelCloseAnimation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (closeAnimationFrameRef.current == null) return;

    window.cancelAnimationFrame(closeAnimationFrameRef.current);
    closeAnimationFrameRef.current = null;
  }, []);

  const cancelCloseAnimationTimeout = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (closeAnimationTimeoutRef.current == null) return;

    window.clearTimeout(closeAnimationTimeoutRef.current);
    closeAnimationTimeoutRef.current = null;
  }, []);

  const preloadImage = useCallback((src?: string) => {
    const normalizedSrc = src?.trim() ?? '';
    if (!normalizedSrc || typeof window === 'undefined') return Promise.resolve();
    if (imageCacheRef.current.has(normalizedSrc)) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const image = new Image();
      let isResolved = false;

      const finish = (isLoaded: boolean) => {
        if (isResolved) return;
        isResolved = true;

        if (isLoaded) {
          imageCacheRef.current.add(normalizedSrc);
        }

        resolve();
      };

      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = normalizedSrc;

      if (image.complete) {
        finish(true);
      }
    });
  }, []);

  const startOpenFromBottomAnimation = useCallback(() => {
    if (typeof window === 'undefined') {
      resetSheet();
      return;
    }

    cancelOpenAnimation();
    cancelOpenAnimationTimeout();
    cancelCloseAnimation();
    cancelCloseAnimationTimeout();
    const startTranslate = getSheetAnimationTranslate(getViewportHeight());
    setIsOpeningSheet(true);
    setIsClosingSheet(false);
    setIsDraggingSheet(false);
    setIsPreparingOpenPosition(true);
    setSheetTranslateY(startTranslate);

    openAnimationFrameRef.current = window.requestAnimationFrame(() => {
      setIsPreparingOpenPosition(false);
      setSheetTranslateY(0);
      openAnimationFrameRef.current = null;
      openAnimationTimeoutRef.current = window.setTimeout(() => {
        setIsOpeningSheet(false);
        openAnimationTimeoutRef.current = null;
      }, OPEN_ANIMATION_DURATION_MS);
    });
  }, [
    cancelCloseAnimation,
    cancelCloseAnimationTimeout,
    cancelOpenAnimation,
    cancelOpenAnimationTimeout,
    resetSheet,
  ]);

  const startCloseToBottomAnimation = useCallback(
    (onComplete?: () => void) => {
      if (typeof window === 'undefined') {
        onComplete?.();
        resetSheet();
        return;
      }

      cancelOpenAnimation();
      cancelOpenAnimationTimeout();
      cancelCloseAnimation();
      cancelCloseAnimationTimeout();

      setIsOpeningSheet(false);
      setIsClosingSheet(true);
      setIsDraggingSheet(false);

      const closeTranslate = getSheetAnimationTranslate(getViewportHeight());

      closeAnimationFrameRef.current = window.requestAnimationFrame(() => {
        setSheetTranslateY(closeTranslate);
        closeAnimationFrameRef.current = null;
        closeAnimationTimeoutRef.current = window.setTimeout(() => {
          onComplete?.();
          resetSheet();
          closeAnimationTimeoutRef.current = null;
        }, CLOSE_ANIMATION_DURATION_MS);
      });
    },
    [
      cancelCloseAnimation,
      cancelCloseAnimationTimeout,
      cancelOpenAnimation,
      cancelOpenAnimationTimeout,
      resetSheet,
    ]
  );

  const openItemDetails = useCallback(
    (item: MenuItem) => {
      startOpenFromBottomAnimation();
      setItemStack([item]);
      void preloadImage(item.image);
    },
    [preloadImage, startOpenFromBottomAnimation]
  );

  const openRelatedItemDetails = useCallback(
    (item: MenuItem) => {
      if (selectedItem?.id === item.id) return;

      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }

      startOpenFromBottomAnimation();
      setItemStack((prev) => {
        if (!prev.length) return [item];
        return [...prev, item];
      });
      void preloadImage(item.image);
    },
    [preloadImage, selectedItem, startOpenFromBottomAnimation]
  );

  const closeItemDetails = useCallback(() => {
    if (!selectedItem || isClosingSheet) return;

    startCloseToBottomAnimation(() => {
      setItemStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : []));
    });
  }, [isClosingSheet, selectedItem, startCloseToBottomAnimation]);

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
      cancelOpenAnimationTimeout();
      cancelCloseAnimation();
      cancelCloseAnimationTimeout();
    },
    [
      cancelCloseAnimation,
      cancelCloseAnimationTimeout,
      cancelOpenAnimation,
      cancelOpenAnimationTimeout,
    ]
  );

  return {
    selectedItem,
    sheetTranslateY,
    isDraggingSheet,
    isOpeningSheet,
    isClosingSheet,
    isPreparingOpenPosition,
    modalBodyRef,
    openItemDetails,
    openRelatedItemDetails,
    closeItemDetails,
    handleModalTouchStart,
    handleModalTouchMove,
    handleModalTouchEnd,
  };
}
