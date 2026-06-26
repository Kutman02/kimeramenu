import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MenuCategory } from '../../../types/menu';

const SCROLL_TO_CATEGORY_OFFSET = 108;
const SECTION_ACTIVATION_OFFSET = 120;
const OBSERVER_SUPPRESS_MS = 900;

interface UseCategoryNavigationOptions {
  scrollBehavior?: ScrollBehavior;
}

export function useCategoryNavigation(
  filteredCategories: MenuCategory[],
  { scrollBehavior = 'smooth' }: UseCategoryNavigationOptions = {}
) {
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

    let scrollRafId: number | null = null;
    let layoutRafId: number | null = null;
    let sectionPositions: Array<{ id: string; top: number }> = [];

    const collectSectionPositions = () => {
      sectionPositions = filteredCategories
        .map((category) => {
          const sectionEl = document.getElementById(`cat-${category.id}`);
          if (!sectionEl) return null;

          return {
            id: category.id,
            top: sectionEl.getBoundingClientRect().top + window.scrollY,
          };
        })
        .filter((section): section is { id: string; top: number } => section !== null);
    };

    const updateActiveCategoryFromScroll = () => {
      if (Date.now() < suppressObserverUntilRef.current) return;

      if (!sectionPositions.length) return;

      const threshold = window.scrollY + SECTION_ACTIVATION_OFFSET;
      let nextActiveId = sectionPositions[0].id;

      for (let index = 1; index < sectionPositions.length; index += 1) {
        const sectionPosition = sectionPositions[index];
        if (sectionPosition.top <= threshold) {
          nextActiveId = sectionPosition.id;
          continue;
        }
        break;
      }

      setActiveCategoryId((prev) => (prev === nextActiveId ? prev : nextActiveId));
    };

    const scheduleScrollUpdate = () => {
      if (scrollRafId !== null) return;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollRafId = null;
        updateActiveCategoryFromScroll();
      });
    };

    const scheduleLayoutRecalculation = () => {
      if (layoutRafId !== null) return;

      layoutRafId = window.requestAnimationFrame(() => {
        layoutRafId = null;
        collectSectionPositions();
        updateActiveCategoryFromScroll();
      });
    };

    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleLayoutRecalculation);
    window.addEventListener('orientationchange', scheduleLayoutRecalculation);
    scheduleLayoutRecalculation();

    return () => {
      if (scrollRafId !== null) {
        window.cancelAnimationFrame(scrollRafId);
      }

      if (layoutRafId !== null) {
        window.cancelAnimationFrame(layoutRafId);
      }

      window.removeEventListener('scroll', scheduleScrollUpdate);
      window.removeEventListener('resize', scheduleLayoutRecalculation);
      window.removeEventListener('orientationchange', scheduleLayoutRecalculation);
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
      behavior: scrollBehavior,
    });
  }, [currentActiveCategoryId, scrollBehavior]);

  const scrollToCategory = useCallback(
    (categoryId: string) => {
      const element = document.getElementById(`cat-${categoryId}`);
      if (!element) return;

      const y = element.getBoundingClientRect().top + window.scrollY - SCROLL_TO_CATEGORY_OFFSET;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: scrollBehavior,
      });
    },
    [scrollBehavior]
  );

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
