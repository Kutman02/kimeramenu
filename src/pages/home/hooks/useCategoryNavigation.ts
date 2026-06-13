import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MenuCategory } from '../../../types/menu';

const SCROLL_TO_CATEGORY_OFFSET = 108;
const SECTION_ACTIVATION_OFFSET = 120;
const OBSERVER_SUPPRESS_MS = 900;

export function useCategoryNavigation(filteredCategories: MenuCategory[]) {
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const categoryTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const categoryTabsContainerRef = useRef<HTMLDivElement | null>(null);
  const suppressObserverUntilRef = useRef(0);

  const fallbackCategoryId = filteredCategories[0]?.id ?? '';

  const currentActiveCategoryId = useMemo(
    () =>
      filteredCategories.some((category) => category.id === activeCategoryId)
        ? activeCategoryId
        : fallbackCategoryId,
    [filteredCategories, activeCategoryId, fallbackCategoryId]
  );

  useEffect(() => {
    if (!filteredCategories.length) return;

    let rafId: number | null = null;

    const updateActiveCategoryFromScroll = () => {
      if (Date.now() < suppressObserverUntilRef.current) return;

      let nextActiveId = filteredCategories[0]?.id ?? '';

      for (const category of filteredCategories) {
        const sectionEl = document.getElementById(`cat-${category.id}`);
        if (!sectionEl) continue;

        const top = sectionEl.getBoundingClientRect().top;
        if (top - SECTION_ACTIVATION_OFFSET <= 0) {
          nextActiveId = category.id;
        } else {
          break;
        }
      }

      setActiveCategoryId((prev) => (prev === nextActiveId ? prev : nextActiveId));
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateActiveCategoryFromScroll();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      updateActiveCategoryFromScroll();
    });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [filteredCategories]);

  useEffect(() => {
    if (!currentActiveCategoryId) return;

    const activeTab = categoryTabRefs.current[currentActiveCategoryId];
    const container = categoryTabsContainerRef.current;
    if (!activeTab || !container) return;

    const targetLeft = activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [currentActiveCategoryId]);

  const scrollToCategory = useCallback((categoryId: string) => {
    const element = document.getElementById(`cat-${categoryId}`);
    if (!element) return;

    const y = element.getBoundingClientRect().top + window.scrollY - SCROLL_TO_CATEGORY_OFFSET;
    window.scrollTo({
      top: Math.max(0, y),
      behavior: 'smooth',
    });
  }, []);

  const onCategorySelect = useCallback(
    (categoryId: string) => {
      suppressObserverUntilRef.current = Date.now() + OBSERVER_SUPPRESS_MS;
      setActiveCategoryId(categoryId);
      scrollToCategory(categoryId);
    },
    [scrollToCategory]
  );

  return {
    currentActiveCategoryId,
    categoryTabRefs,
    categoryTabsContainerRef,
    onCategorySelect,
  };
}
