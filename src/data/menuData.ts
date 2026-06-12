import supportedLanguages from './supportedLanguages.json';
import breakfastInfo from './restaurants/breakfast/info.json';
import breakfastAllergens from './restaurants/breakfast/allergens.json';
import breakfastCategories from './restaurants/breakfast/categories.json';
import type {
  Allergen,
  Language,
  MenuCategory,
  MenuData,
  RestaurantConfig,
} from '../types/menu';

type RestaurantInfoWithoutCollections = Omit<RestaurantConfig, 'allergens' | 'categories'>;

const assembledMenuData: MenuData = {
  version: '1.0.0',
  supportedLanguages: supportedLanguages as Language[],
  restaurants: [
    {
      ...(breakfastInfo as RestaurantInfoWithoutCollections),
      allergens: breakfastAllergens as Allergen[],
      categories: breakfastCategories as MenuCategory[],
    },
  ],
};

export default assembledMenuData;
