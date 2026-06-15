import { useMemo } from 'react';
import type { MenuItem } from '../../types/menu';

export type MenuSortBy = 'price-asc' | 'price-desc' | 'name';

function sortItems(items: MenuItem[], sortBy: MenuSortBy): MenuItem[] {
  const itemsCopy = [...items];

  switch (sortBy) {
    case 'price-asc':
      return itemsCopy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return itemsCopy.sort((a, b) => b.price - a.price);
    case 'name':
      return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return itemsCopy;
  }
}

/**
 * Hook для сортировки блюд
 */
export function useSortedItems(items: MenuItem[], sortBy: MenuSortBy) {
  return useMemo(() => sortItems(items, sortBy), [items, sortBy]);
}
