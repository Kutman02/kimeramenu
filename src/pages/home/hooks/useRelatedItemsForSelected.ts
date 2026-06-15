import { useMemo } from 'react';
import type { Language, MenuItem, RestaurantConfig } from '../../../types/menu';

interface UseRelatedItemsForSelectedParams {
  selectedItem: MenuItem | null;
  restaurant: RestaurantConfig | null;
  currentLanguage: Language;
}

export function useRelatedItemsForSelected({
  selectedItem,
  restaurant,
  currentLanguage,
}: UseRelatedItemsForSelectedParams) {
  const allItemsById = useMemo(() => {
    const map = new Map<string, MenuItem>();
    restaurant?.categories.forEach((category) => {
      category.items.forEach((item) => {
        map.set(item.id, item);
      });
    });
    return map;
  }, [restaurant]);

  return useMemo<MenuItem[]>(() => {
    if (!selectedItem) return [];

    const includedItemIds = selectedItem.includedItemIds ?? [];
    if (includedItemIds.length) {
      const linkedItems = includedItemIds
        .map((itemId) => allItemsById.get(itemId))
        .filter((item): item is MenuItem => Boolean(item));

      if (linkedItems.length) {
        return linkedItems;
      }
    }

    const includedItems = selectedItem.includedItems ?? [];
    if (!includedItems.length) return [];

    return includedItems.map((includedItem, index) => {
      const localizedText =
        includedItem[currentLanguage] || includedItem.en || includedItem.ru || includedItem.tr || '';

      return {
        id: `${selectedItem.id}_included_${index}`,
        name: localizedText,
        description: {
          en: includedItem.en || localizedText,
          ru: includedItem.ru || includedItem.en || localizedText,
          tr: includedItem.tr || includedItem.en || localizedText,
        },
        price: 0,
        image: selectedItem.image,
        available: true,
        isComplimentary: true,
      };
    });
  }, [selectedItem, allItemsById, currentLanguage]);
}
