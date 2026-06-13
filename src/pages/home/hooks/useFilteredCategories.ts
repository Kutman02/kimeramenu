import { useMemo } from 'react';
import type { Language, MenuCategory, RestaurantConfig } from '../../../types/menu';
import type { DietFilter } from '../types';

interface UseFilteredCategoriesParams {
  restaurant: RestaurantConfig | null;
  searchQuery: string;
  dietFilter: DietFilter;
  currentLanguage: Language;
}

export function useFilteredCategories({
  restaurant,
  searchQuery,
  dietFilter,
  currentLanguage,
}: UseFilteredCategoriesParams) {
  return useMemo<MenuCategory[]>(() => {
    if (!restaurant) return [];

    const query = searchQuery.trim().toLowerCase();

    return restaurant.categories
      .filter((category) => !category.hidden)
      .map((category) => {
        const isServedToTableCategory =
          category.group === 'served_to_table' || Boolean(category.isComplimentary);

        const items = category.items.filter((item) => {
          if (!item.available) return false;

          const nameMatch = item.name.toLowerCase().includes(query);
          const localizedDescription = item.description[currentLanguage] || item.description.en || '';
          const descriptionMatch = localizedDescription.toLowerCase().includes(query);

          if (isServedToTableCategory || item.isComplimentary) {
            if (!query) return true;
            return nameMatch || descriptionMatch;
          }

          if (dietFilter === 'vegetarian' && !item.vegetarian) return false;
          if (dietFilter === 'vegan' && !item.vegan) return false;

          if (!query) return true;
          return nameMatch || descriptionMatch;
        });

        return {
          ...category,
          items,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [restaurant, searchQuery, dietFilter, currentLanguage]);
}
