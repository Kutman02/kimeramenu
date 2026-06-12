/**
 * Menu system types for Restaurant Menu Application
 */

/**
 * Supported languages
 */
export type Language = 'en' | 'ru' | 'tr';

/**
 * Allergen information
 */
export interface Allergen {
  id: string;
  name: string;
  icon?: string;
}

/**
 * Translation for a specific field
 * Original name is not translated, only descriptions
 */
export interface FieldTranslations {
  en?: string;
  ru?: string;
  tr?: string;
}

/**
 * Menu item with original name and translated descriptions
 */
export interface MenuItem {
  id: string;
  name: string; // Original name (always the same, not translated)
  description: FieldTranslations; // Translated descriptions
  price: number;
  image: string;
  available: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: number; // 0-5 scale
  portion?: string; // e.g., "300g", "2 pieces"
  allergens?: string[]; // allergen IDs
  calories?: number;
}

/**
 * Menu category with translated names
 */
export interface MenuCategory {
  id: string;
  name: string; // Original name
  displayName: FieldTranslations; // Translated display names
  icon?: string;
  items: MenuItem[];
}

/**
 * Restaurant configuration
 */
export interface RestaurantConfig {
  id: string;
  name: string; // Original name
  displayName: FieldTranslations; // Translated display names
  description?: FieldTranslations;
  image?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  cuisineTypes: string[];
  categories: MenuCategory[];
  allergens: Allergen[];
  settings: {
    currency: string;
    defaultLanguage: Language;
  };
}

/**
 * Application data structure
 */
export interface MenuData {
  version: string;
  supportedLanguages: Language[];
  restaurants: RestaurantConfig[];
}

/**
 * Context for current selections
 */
export interface MenuContextType {
  restaurant: RestaurantConfig | null;
  selectedCategory: MenuCategory | null;
  selectedItem: MenuItem | null;
  currentLanguage: Language;
  loading: boolean;
  error: string | null;
}
