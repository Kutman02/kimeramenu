import { useCallback, useMemo, useState } from 'react';
import { dataService } from '../../services/dataService';
import type { MenuItem } from '../../types/menu';

function filterItemsByExcludedAllergens(
  items: MenuItem[],
  excludedAllergens: string[]
): MenuItem[] {
  if (excludedAllergens.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const itemAllergens = item.allergens || [];
    return !excludedAllergens.some((allergen) => itemAllergens.includes(allergen));
  });
}

/**
 * Hook для фильтрации по аллергенам (исключить содержащие аллерген)
 */
export function useAllergenFilter(restaurantId: string, categoryId: string) {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const allItems = dataService.getCategoryItems(restaurantId, categoryId);
    return filterItemsByExcludedAllergens(allItems, selectedAllergens);
  }, [restaurantId, categoryId, selectedAllergens]);

  const toggleAllergen = useCallback((allergenId: string) => {
    setSelectedAllergens((previousAllergens) => {
      if (previousAllergens.includes(allergenId)) {
        return previousAllergens.filter((allergen) => allergen !== allergenId);
      }
      return [...previousAllergens, allergenId];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedAllergens([]);
  }, []);

  return {
    selectedAllergens,
    filteredItems,
    toggleAllergen,
    clearFilters,
    hasActiveFilters: selectedAllergens.length > 0,
  };
}
