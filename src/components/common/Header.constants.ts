import type { Language } from '../../types/menu';

export const LANGUAGE_OPTIONS: Language[] = ['en', 'ru', 'tr'];

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  ru: '🇷🇺',
  tr: '🇹🇷',
};

export const languageLabels: Record<Language, string> = {
  en: `${languageFlags.en} English`,
  ru: `${languageFlags.ru} Русский`,
  tr: `${languageFlags.tr} Türkçe`,
};

export const cuisineSectionTitle: Record<Language, string> = {
  en: 'Cuisine',
  ru: 'Кухня',
  tr: 'Mutfak',
};

export const languageSectionTitle: Record<Language, string> = {
  en: 'Language',
  ru: 'Язык',
  tr: 'Dil',
};

export const drawerTitle: Record<Language, string> = {
  en: 'Menu',
  ru: 'Меню',
  tr: 'Menü',
};

export const swipeToCloseHint: Record<Language, string> = {
  en: 'Swipe left to close',
  ru: 'Смахните влево, чтобы закрыть',
  tr: 'Kapatmak icin sola kaydirin',
};

export const DRAWER_CLOSE_THRESHOLD = 90;
export const DRAWER_MAX_TRANSLATE = 260;
export const DRAWER_DRAG_RESISTANCE = 0.95;
