import type { MenuData } from '../../types/menu';
import { clone } from './runtime';

export function applyStructuralDefaults(source: MenuData, baseData?: MenuData): MenuData {
  const next = clone(source);

  next.restaurants.forEach((restaurant, restaurantIndex) => {
    const baseRestaurant =
      baseData?.restaurants.find((candidate) => candidate.id === restaurant.id) ??
      (baseData?.restaurants[restaurantIndex] || null);

    if (!baseRestaurant) return;

    restaurant.categories = restaurant.categories.map((category) => {
      const baseCategory = baseRestaurant.categories.find((candidate) => candidate.id === category.id);

      if (!baseCategory) return category;

      return {
        ...category,
        group: category.group ?? baseCategory.group,
        hidden: category.hidden ?? baseCategory.hidden,
        isComplimentary: category.isComplimentary ?? baseCategory.isComplimentary,
        items: category.items.map((item) => {
          const baseItem = baseCategory.items.find((candidate) => candidate.id === item.id);
          if (!baseItem) return item;

          return {
            ...item,
            description: item.description ?? baseItem.description,
            isComplimentary: item.isComplimentary ?? baseItem.isComplimentary,
            includedItems: item.includedItems ?? baseItem.includedItems,
            includedItemIds: item.includedItemIds ?? baseItem.includedItemIds,
          };
        }),
      };
    });
  });

  return next;
}
