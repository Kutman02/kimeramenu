import { useMemo } from 'react';
import { dataService } from '../../services/dataService';

/**
 * Hook для получения категорий ресторана
 */
export function useCategories(restaurantId: string) {
  const categories = useMemo(() => dataService.getCategories(restaurantId), [restaurantId]);

  return {
    categories,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook для получения блюд из категории
 */
export function useCategoryItems(restaurantId: string, categoryId: string) {
  const items = useMemo(
    () => dataService.getCategoryItems(restaurantId, categoryId),
    [restaurantId, categoryId]
  );

  return {
    items,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook для получения одного блюда
 */
export function useMenuItem(restaurantId: string, categoryId: string, itemId: string) {
  const item = useMemo(
    () => dataService.getMenuItem(restaurantId, categoryId, itemId),
    [restaurantId, categoryId, itemId]
  );

  return {
    item,
    isLoading: false,
    error: null,
  };
}
