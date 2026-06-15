import type {
  Language,
  MenuCategory,
  MenuData,
  MenuItem,
  RestaurantConfig,
} from '../../types/menu';

export const getSupportedLanguages = (data: MenuData): Language[] => data.supportedLanguages;

export const getRestaurant = (data: MenuData, restaurantId: string): RestaurantConfig | null =>
  data.restaurants.find((restaurant) => restaurant.id === restaurantId) || null;

export const getAllRestaurants = (data: MenuData): RestaurantConfig[] => data.restaurants;

export const getCategory = (
  data: MenuData,
  restaurantId: string,
  categoryId: string
): MenuCategory | null => {
  const restaurant = getRestaurant(data, restaurantId);
  if (!restaurant) return null;
  return restaurant.categories.find((category) => category.id === categoryId) || null;
};

export const getCategories = (data: MenuData, restaurantId: string): MenuCategory[] => {
  const restaurant = getRestaurant(data, restaurantId);
  return restaurant?.categories || [];
};

export const getMenuItem = (
  data: MenuData,
  restaurantId: string,
  categoryId: string,
  itemId: string
): MenuItem | null => {
  const category = getCategory(data, restaurantId, categoryId);
  if (!category) return null;
  return category.items.find((item) => item.id === itemId) || null;
};

export const getCategoryItems = (
  data: MenuData,
  restaurantId: string,
  categoryId: string
): MenuItem[] => {
  const category = getCategory(data, restaurantId, categoryId);
  return category?.items || [];
};

export const getAllergens = (data: MenuData, restaurantId: string) => {
  const restaurant = getRestaurant(data, restaurantId);
  return restaurant?.allergens || [];
};

export const getAllergen = (
  data: MenuData,
  restaurantId: string,
  allergenId: string
) => {
  const allergens = getAllergens(data, restaurantId);
  return allergens.find((allergen) => allergen.id === allergenId) || null;
};

export const isItemAvailable = (
  data: MenuData,
  restaurantId: string,
  categoryId: string,
  itemId: string
): boolean => {
  const item = getMenuItem(data, restaurantId, categoryId, itemId);
  return item?.available || false;
};

const collectItems = (
  data: MenuData,
  restaurantId: string,
  predicate: (item: MenuItem) => boolean
): MenuItem[] => {
  const restaurant = getRestaurant(data, restaurantId);
  if (!restaurant) return [];

  const items: MenuItem[] = [];
  restaurant.categories.forEach((category) => {
    category.items.forEach((item) => {
      if (predicate(item)) {
        items.push(item);
      }
    });
  });

  return items;
};

export const getItemsByAllergen = (
  data: MenuData,
  restaurantId: string,
  allergenId: string
): MenuItem[] => collectItems(data, restaurantId, (item) => item.allergens?.includes(allergenId) ?? false);

export const getVegetarianItems = (data: MenuData, restaurantId: string): MenuItem[] =>
  collectItems(data, restaurantId, (item) => Boolean(item.vegetarian));

export const getVeganItems = (data: MenuData, restaurantId: string): MenuItem[] =>
  collectItems(data, restaurantId, (item) => Boolean(item.vegan));

export const searchItems = (
  data: MenuData,
  restaurantId: string,
  query: string
): MenuItem[] => {
  const lowerQuery = query.toLowerCase();
  return collectItems(data, restaurantId, (item) => {
    if (item.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    const descriptions = Object.values(item.description).join(' ');
    return descriptions.toLowerCase().includes(lowerQuery);
  });
};
