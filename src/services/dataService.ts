import menuData from '../data/menuData';
import type {
  MenuCategory,
  MenuData,
  MenuItem,
  RestaurantConfig,
  Language,
} from '../types/menu';

const DEV_MENU_SYNC_ENDPOINT = '/__admin/menu-data';

type MenuSyncResponse = {
  ok?: boolean;
  message?: string;
};

export type SaveMenuDataResult = {
  ok: boolean;
  message: string;
};

/**
 * Data Service для работы с меню ресторана
 * Все данные загружаются из menu.json
 * Сервис предоставляет типизированные методы доступа к данным
 */
class DataService {
  private readonly baseData: MenuData;
  private data: MenuData;

  constructor() {
    this.baseData = this.applyStructuralDefaults(this.clone(menuData as MenuData));
    this.data = this.clone(this.baseData);
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private isDevBrowser(): boolean {
    return import.meta.env.DEV && typeof window !== 'undefined';
  }

  private applyStructuralDefaults(source: MenuData): MenuData {
    const next = this.clone(source);

    next.restaurants.forEach((restaurant, restaurantIndex) => {
      const baseRestaurant =
        this.baseData?.restaurants.find((candidate) => candidate.id === restaurant.id) ??
        (this.baseData?.restaurants[restaurantIndex] || null);

      if (!baseRestaurant) return;

      restaurant.categories = restaurant.categories.map((category) => {
        const baseCategory = baseRestaurant.categories.find(
          (candidate) => candidate.id === category.id
        );

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

  /**
   * Получить все поддерживаемые языки
   */
  getSupportedLanguages(): Language[] {
    return this.data.supportedLanguages;
  }

  getRawData(): MenuData {
    return this.clone(this.data);
  }

  getBaseData(): MenuData {
    return this.clone(this.baseData);
  }

  replaceData(nextData: MenuData): void {
    this.data = this.applyStructuralDefaults(this.clone(nextData));
  }

  async saveToProjectFiles(nextData: MenuData): Promise<SaveMenuDataResult> {
    this.replaceData(nextData);

    if (!this.isDevBrowser()) {
      return {
        ok: false,
        message: 'Сохранение в JSON-файлы доступно только в dev-режиме.',
      };
    }

    try {
      const response = await fetch(DEV_MENU_SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.data),
      });

      const payload = (await response.json().catch(() => null)) as MenuSyncResponse | null;
      const fallbackMessage = response.ok
        ? 'Изменения сохранены в JSON-файлы проекта.'
        : 'Не удалось сохранить изменения в JSON-файлы проекта.';
      const message = typeof payload?.message === 'string' ? payload.message : fallbackMessage;

      if (!response.ok) {
        return {
          ok: false,
          message,
        };
      }

      return {
        ok: true,
        message,
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? `Ошибка сохранения JSON: ${error.message}`
            : 'Ошибка сохранения JSON-файлов проекта.',
      };
    }
  }

  resetToBaseData(): void {
    this.data = this.clone(this.baseData);
  }

  /**
   * Получить ресторан по ID
   */
  getRestaurant(restaurantId: string): RestaurantConfig | null {
    return this.data.restaurants.find((r) => r.id === restaurantId) || null;
  }

  /**
   * Получить все рестораны
   */
  getAllRestaurants(): RestaurantConfig[] {
    return this.data.restaurants;
  }

  /**
   * Получить категорию по ID из конкретного ресторана
   */
  getCategory(restaurantId: string, categoryId: string): MenuCategory | null {
    const restaurant = this.getRestaurant(restaurantId);
    if (!restaurant) return null;
    return restaurant.categories.find((c) => c.id === categoryId) || null;
  }

  /**
   * Получить все категории ресторана
   */
  getCategories(restaurantId: string): MenuCategory[] {
    const restaurant = this.getRestaurant(restaurantId);
    return restaurant?.categories || [];
  }

  /**
   * Получить блюдо по ID из категории
   */
  getMenuItem(restaurantId: string, categoryId: string, itemId: string): MenuItem | null {
    const category = this.getCategory(restaurantId, categoryId);
    if (!category) return null;
    return category.items.find((item) => item.id === itemId) || null;
  }

  /**
   * Получить все блюда из категории
   */
  getCategoryItems(restaurantId: string, categoryId: string): MenuItem[] {
    const category = this.getCategory(restaurantId, categoryId);
    return category?.items || [];
  }

  /**
   * Получить список аллергенов ресторана
   */
  getAllergens(restaurantId: string) {
    const restaurant = this.getRestaurant(restaurantId);
    return restaurant?.allergens || [];
  }

  /**
   * Получить информацию об аллергене
   */
  getAllergen(restaurantId: string, allergenId: string) {
    const allergens = this.getAllergens(restaurantId);
    return allergens.find((a) => a.id === allergenId) || null;
  }

  /**
   * Проверить наличие блюда
   */
  isItemAvailable(restaurantId: string, categoryId: string, itemId: string): boolean {
    const item = this.getMenuItem(restaurantId, categoryId, itemId);
    return item?.available || false;
  }

  /**
   * Получить отступание блюд по аллергену
   */
  getItemsByAllergen(restaurantId: string, allergenId: string): MenuItem[] {
    const items: MenuItem[] = [];
    const restaurant = this.getRestaurant(restaurantId);

    if (!restaurant) return items;

    restaurant.categories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.allergens?.includes(allergenId)) {
          items.push(item);
        }
      });
    });

    return items;
  }

  /**
   * Получить вегетарианские блюда
   */
  getVegetarianItems(restaurantId: string): MenuItem[] {
    const items: MenuItem[] = [];
    const restaurant = this.getRestaurant(restaurantId);

    if (!restaurant) return items;

    restaurant.categories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.vegetarian) {
          items.push(item);
        }
      });
    });

    return items;
  }

  /**
   * Получить веганские блюда
   */
  getVeganItems(restaurantId: string): MenuItem[] {
    const items: MenuItem[] = [];
    const restaurant = this.getRestaurant(restaurantId);

    if (!restaurant) return items;

    restaurant.categories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.vegan) {
          items.push(item);
        }
      });
    });

    return items;
  }

  /**
   * Поиск блюд по названию или описанию
   */
  searchItems(
    restaurantId: string,
    query: string
  ): MenuItem[] {
    const lowerQuery = query.toLowerCase();
    const items: MenuItem[] = [];
    const restaurant = this.getRestaurant(restaurantId);

    if (!restaurant) return items;

    restaurant.categories.forEach((category) => {
      category.items.forEach((item) => {
        // Поиск по оригинальному названию
        if (item.name.toLowerCase().includes(lowerQuery)) {
          items.push(item);
          return;
        }

        // Поиск по описанию на всех языках
        const descriptions = Object.values(item.description).join(' ');
        if (descriptions.toLowerCase().includes(lowerQuery)) {
          items.push(item);
        }
      });
    });

    return items;
  }
}

// Singleton instance
const dataService = new DataService();

export { dataService };
export default dataService;
