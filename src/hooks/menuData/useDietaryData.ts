import { useMemo } from 'react';
import { dataService } from '../../services/dataService';

/**
 * Hook для получения вегетарианских блюд
 */
export function useVegetarianItems(restaurantId: string) {
  const items = useMemo(() => dataService.getVegetarianItems(restaurantId), [restaurantId]);

  return {
    items,
    count: items.length,
  };
}

/**
 * Hook для получения веганских блюд
 */
export function useVeganItems(restaurantId: string) {
  const items = useMemo(() => dataService.getVeganItems(restaurantId), [restaurantId]);

  return {
    items,
    count: items.length,
  };
}

/**
 * Hook для получения аллергенов
 */
export function useAllergens(restaurantId: string) {
  const allergens = useMemo(() => dataService.getAllergens(restaurantId), [restaurantId]);

  return {
    allergens,
    count: allergens.length,
  };
}
