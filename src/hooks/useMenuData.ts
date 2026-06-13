import { useState, useCallback, useMemo, useEffect } from 'react';
import { dataService } from '../services/dataService';
import type { MenuItem, RestaurantConfig } from '../types/menu';

/**
 * Hook для получения ресторана
 */
export function useRestaurant(restaurantId: string) {
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadTimer = setTimeout(() => {
      try {
        const requestedRestaurant = dataService.getRestaurant(restaurantId);
        const fallbackRestaurant = dataService.getAllRestaurants()[0] ?? null;
        const nextRestaurant = requestedRestaurant ?? fallbackRestaurant;

        if (isActive) {
          setRestaurant(nextRestaurant);

          if (!nextRestaurant) {
            setError('Menu data is not available');
          } else if (!requestedRestaurant) {
            setError(`Restaurant "${restaurantId}" not found. Showing fallback restaurant.`);
          } else {
            setError(null);
          }
        }
      } catch (loadError) {
        console.error('Failed to load restaurant:', loadError);
        if (isActive) {
          setRestaurant(null);
          setError('Failed to load restaurant data');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(loadTimer);
    };
  }, [restaurantId]);

  return {
    restaurant,
    isLoading,
    error,
  };
}

/**
 * Hook для получения категорий ресторана
 */
export function useCategories(restaurantId: string) {
  const categories = useMemo(
    () => dataService.getCategories(restaurantId),
    [restaurantId]
  );

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
export function useMenuItem(
  restaurantId: string,
  categoryId: string,
  itemId: string
) {
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

/**
 * Hook для поиска блюд
 */
export function useMenuSearch(restaurantId: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MenuItem[]>([]);

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      if (searchQuery.trim() === '') {
        setResults([]);
      } else {
        const foundItems = dataService.searchItems(restaurantId, searchQuery);
        setResults(foundItems);
      }
    },
    [restaurantId]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    search,
    clearSearch,
    hasResults: results.length > 0,
  };
}

/**
 * Hook для получения вегетарианских блюд
 */
export function useVegetarianItems(restaurantId: string) {
  const items = useMemo(
    () => dataService.getVegetarianItems(restaurantId),
    [restaurantId]
  );

  return {
    items,
    count: items.length,
  };
}

/**
 * Hook для получения веганских блюд
 */
export function useVeganItems(restaurantId: string) {
  const items = useMemo(
    () => dataService.getVeganItems(restaurantId),
    [restaurantId]
  );

  return {
    items,
    count: items.length,
  };
}

/**
 * Hook для получения аллергенов
 */
export function useAllergens(restaurantId: string) {
  const allergens = useMemo(
    () => dataService.getAllergens(restaurantId),
    [restaurantId]
  );

  return {
    allergens,
    count: allergens.length,
  };
}

/**
 * Hook для фильтрации по аллергенам (исключить содержащие аллерген)
 */
export function useAllergenFilter(restaurantId: string, categoryId: string) {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const allItems = dataService.getCategoryItems(restaurantId, categoryId);

    if (selectedAllergens.length === 0) {
      return allItems;
    }

    return allItems.filter((item) => {
      const itemAllergens = item.allergens || [];
      return !selectedAllergens.some((allergen) =>
        itemAllergens.includes(allergen)
      );
    });
  }, [restaurantId, categoryId, selectedAllergens]);

  const toggleAllergen = useCallback((allergenId: string) => {
    setSelectedAllergens((prev) => {
      if (prev.includes(allergenId)) {
        return prev.filter((a) => a !== allergenId);
      }
      return [...prev, allergenId];
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

/**
 * Hook для сортировки блюд
 */
export function useSortedItems(items: MenuItem[], sortBy: 'price-asc' | 'price-desc' | 'name') {
  const sorted = useMemo(() => {
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
  }, [items, sortBy]);

  return sorted;
}
