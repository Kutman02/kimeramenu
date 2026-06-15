import { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import type { RestaurantConfig } from '../../types/menu';

type RestaurantLoadResult = {
  restaurant: RestaurantConfig | null;
  error: string | null;
};

function resolveRestaurant(restaurantId: string): RestaurantLoadResult {
  const requestedRestaurant = dataService.getRestaurant(restaurantId);
  const fallbackRestaurant = dataService.getAllRestaurants()[0] ?? null;
  const nextRestaurant = requestedRestaurant ?? fallbackRestaurant;

  if (!nextRestaurant) {
    return {
      restaurant: null,
      error: 'Menu data is not available',
    };
  }

  if (!requestedRestaurant) {
    return {
      restaurant: nextRestaurant,
      error: `Restaurant "${restaurantId}" not found. Showing fallback restaurant.`,
    };
  }

  return {
    restaurant: nextRestaurant,
    error: null,
  };
}

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
        const result = resolveRestaurant(restaurantId);

        if (isActive) {
          setRestaurant(result.restaurant);
          setError(result.error);
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
