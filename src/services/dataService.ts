import menuData from '../data/menuData';
import type {
  Language,
  MenuCategory,
  MenuData,
  MenuItem,
  RestaurantConfig,
} from '../types/menu';
import { applyStructuralDefaults } from './data/defaults';
import { clone } from './data/runtime';
import { saveMenuDataToProjectFiles } from './data/save';
import {
  getAllergen,
  getAllergens,
  getAllRestaurants,
  getCategories,
  getCategory,
  getCategoryItems,
  getItemsByAllergen,
  getMenuItem,
  getRestaurant,
  getSupportedLanguages,
  getVeganItems,
  getVegetarianItems,
  isItemAvailable,
  searchItems,
} from './data/selectors';
import type { SaveMenuDataResult } from './data/types';

/**
 * Data Service для работы с меню ресторана
 * Все данные загружаются из menu.json
 * Сервис предоставляет типизированные методы доступа к данным
 */
class DataService {
  private readonly baseData: MenuData;
  private data: MenuData;

  constructor() {
    this.baseData = applyStructuralDefaults(clone(menuData as MenuData));
    this.data = clone(this.baseData);
  }

  /**
   * Получить все поддерживаемые языки
   */
  getSupportedLanguages(): Language[] {
    return getSupportedLanguages(this.data);
  }

  getRawData(): MenuData {
    return clone(this.data);
  }

  getBaseData(): MenuData {
    return clone(this.baseData);
  }

  replaceData(nextData: MenuData): void {
    this.data = applyStructuralDefaults(clone(nextData), this.baseData);
  }

  async saveToProjectFiles(nextData: MenuData): Promise<SaveMenuDataResult> {
    this.replaceData(nextData);
    return saveMenuDataToProjectFiles(this.data);
  }

  resetToBaseData(): void {
    this.data = clone(this.baseData);
  }

  /**
   * Получить ресторан по ID
   */
  getRestaurant(restaurantId: string): RestaurantConfig | null {
    return getRestaurant(this.data, restaurantId);
  }

  /**
   * Получить все рестораны
   */
  getAllRestaurants(): RestaurantConfig[] {
    return getAllRestaurants(this.data);
  }

  /**
   * Получить категорию по ID из конкретного ресторана
   */
  getCategory(restaurantId: string, categoryId: string): MenuCategory | null {
    return getCategory(this.data, restaurantId, categoryId);
  }

  /**
   * Получить все категории ресторана
   */
  getCategories(restaurantId: string): MenuCategory[] {
    return getCategories(this.data, restaurantId);
  }

  /**
   * Получить блюдо по ID из категории
   */
  getMenuItem(restaurantId: string, categoryId: string, itemId: string): MenuItem | null {
    return getMenuItem(this.data, restaurantId, categoryId, itemId);
  }

  /**
   * Получить все блюда из категории
   */
  getCategoryItems(restaurantId: string, categoryId: string): MenuItem[] {
    return getCategoryItems(this.data, restaurantId, categoryId);
  }

  /**
   * Получить список аллергенов ресторана
   */
  getAllergens(restaurantId: string) {
    return getAllergens(this.data, restaurantId);
  }

  /**
   * Получить информацию об аллергене
   */
  getAllergen(restaurantId: string, allergenId: string) {
    return getAllergen(this.data, restaurantId, allergenId);
  }

  /**
   * Проверить наличие блюда
   */
  isItemAvailable(restaurantId: string, categoryId: string, itemId: string): boolean {
    return isItemAvailable(this.data, restaurantId, categoryId, itemId);
  }

  /**
   * Получить отступание блюд по аллергену
   */
  getItemsByAllergen(restaurantId: string, allergenId: string): MenuItem[] {
    return getItemsByAllergen(this.data, restaurantId, allergenId);
  }

  /**
   * Получить вегетарианские блюда
   */
  getVegetarianItems(restaurantId: string): MenuItem[] {
    return getVegetarianItems(this.data, restaurantId);
  }

  /**
   * Получить веганские блюда
   */
  getVeganItems(restaurantId: string): MenuItem[] {
    return getVeganItems(this.data, restaurantId);
  }

  /**
   * Поиск блюд по названию или описанию
   */
  searchItems(restaurantId: string, query: string): MenuItem[] {
    return searchItems(this.data, restaurantId, query);
  }
}

// Singleton instance
const dataService = new DataService();

export type { SaveMenuDataResult };
export { dataService };
export default dataService;
