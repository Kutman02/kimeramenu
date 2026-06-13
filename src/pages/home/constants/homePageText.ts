import type { Language } from '../../../types/menu';

export const HOME_PAGE_TEXT = {
  loading: {
    en: 'Loading menu...',
    ru: 'Загружаем меню...',
    tr: 'Menu yukleniyor...',
  },
  searchPlaceholder: {
    en: 'Search by dish name...',
    ru: 'Поиск по названию блюда...',
    tr: 'Urun adina gore ara...',
  },
  filtersTitle: {
    en: 'Filters',
    ru: 'Фильтры',
    tr: 'Filtreler',
  },
  filterAll: {
    en: 'All',
    ru: 'Все',
    tr: 'Tum',
  },
  filterVegetarian: {
    en: 'Vegetarian',
    ru: 'Вегетарианское',
    tr: 'Vejetaryen',
  },
  filterVegan: {
    en: 'Vegan',
    ru: 'Веганское',
    tr: 'Vegan',
  },
  noResultsTitle: {
    en: 'Nothing found',
    ru: 'Ничего не найдено',
    tr: 'Sonuc bulunamadi',
  },
  noResultsBody: {
    en: 'Try another name or disable filters.',
    ru: 'Попробуйте другое название или отключите фильтры.',
    tr: 'Baska isim deneyin veya filtreleri kaldirin.',
  },
  detailsTitle: {
    en: 'Dish details',
    ru: 'Информация о блюде',
    tr: 'Urun bilgisi',
  },
  close: {
    en: 'Close',
    ru: 'Закрыть',
    tr: 'Kapat',
  },
  standardBreakfastTitle: {
    en: 'SERVED TO YOUR TABLE',
    ru: 'ПОДАЕТСЯ К ВАШЕМУ СТОЛУ',
    tr: 'MASANIZA SERVIS EDILIR',
  },
  standardBreakfastSubtitle: {
    en: 'This set is complimentary for every guest.',
    ru: 'Этот набор бесплатный для каждого гостя.',
    tr: 'Bu set her misafir icin ucretsizdir.',
  },
  optionalMenuTitle: {
    en: 'Additional Dishes & Drinks',
    ru: 'Дополнительные блюда и напитки',
    tr: 'Ek Yemekler ve Icecekler',
  },
  yourSelectionsTitle: {
    en: 'YOUR SELECTIONS',
    ru: 'ВАШ ВЫБОР',
    tr: 'SECIMLERINIZ',
  },
  beveragesTitle: {
    en: 'BEVERAGES',
    ru: 'BEVERAGES',
    tr: 'BEVERAGES',
  },
  includedItemsTitle: {
    en: "What's included",
    ru: 'Что входит',
    tr: 'Icerik',
  },
  portion: {
    en: 'Portion',
    ru: 'Порция',
    tr: 'Porsiyon',
  },
  calories: {
    en: 'Calories',
    ru: 'Калории',
    tr: 'Kalori',
  },
  spicy: {
    en: 'Spicy level',
    ru: 'Острота',
    tr: 'Acilik',
  },
  allergens: {
    en: 'Allergens',
    ru: 'Аллергены',
    tr: 'Alerjenler',
  },
} as const satisfies Record<string, Record<Language, string>>;
