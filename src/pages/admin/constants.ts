import type { Language } from '../../types/menu';
import type { AdminSectionMeta } from './types';

export const ALL_LANGUAGES: Language[] = ['en', 'ru', 'tr'];
export const ALL_CATEGORIES_VALUE = '__all_categories__';

export const ADMIN_SECTIONS: AdminSectionMeta[] = [
  { id: 'overview', label: 'Обзор', hint: 'Краткая статистика и быстрые действия' },
  { id: 'profile', label: 'Профиль ресторана', hint: 'Контакты и основные данные' },
  { id: 'categories', label: 'Категории', hint: 'Создание и управление категориями' },
  { id: 'items', label: 'Товары', hint: 'Карточки блюд и редактирование' },
  { id: 'data', label: 'Данные', hint: 'Сохранение, сброс и экспорт JSON' },
];
