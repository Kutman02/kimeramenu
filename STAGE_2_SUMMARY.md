# Stage 2 Complete: Система хранения данных

## 📋 Что создано на Этапе 2

### 1. TypeScript типизация (`src/types/menu.ts`)

```
┌─ Language = 'en' | 'ru' | 'tr'
├─ FieldTranslations = { en?: string, ru?: string, tr?: string }
├─ MenuItem (с оригинальным именем и переводами описания)
├─ MenuCategory (с переводами displayName)
├─ RestaurantConfig (конфигурация ресторана)
├─ Allergen (информация об аллергене)
└─ MenuData (главная структура приложения)
```

### 2. JSON структура данных (`src/data/menu.json`)

```
Breakfast Palace ресторан:
├── Turkish Breakfast (4 блюда)
│   ├── Menemen
│   ├── Cheese Borek
│   ├── Sucuk & Cheese Plate
│   └── Muhammara
├── Eggs (4 блюда)
│   ├── Scrambled Eggs
│   ├── Fried Eggs
│   ├── Vegetable Omelette
│   └── Spanish Omelette
├── Pancakes (4 блюда)
│   ├── Classic Pancakes
│   ├── Berry Pancakes
│   ├── Nutella Pancakes
│   └── Chocolate Chip Pancakes
└── Waffles (5 блюд)
    ├── Classic Waffle
    ├── Strawberry Waffle
    ├── Ice Cream Waffle
    ├── Nutella Waffle
    └── Savory Waffle

Языки: en (английский), ru (русский), tr (турецкий)
Все названия блюд на оригинальном языке (английском)
Описания переведены на все 3 языка
```

### 3. DataService (`src/services/dataService.ts`)

```
dataService.getRestaurant(id)           → RestaurantConfig
dataService.getCategories(id)           → MenuCategory[]
dataService.getCategoryItems(id, catId) → MenuItem[]
dataService.getMenuItem(id, catId, itemId) → MenuItem
dataService.searchItems(id, query, lang) → MenuItem[]
dataService.getVegetarianItems(id)      → MenuItem[]
dataService.getVeganItems(id)           → MenuItem[]
dataService.getAllergens(id)            → Allergen[]
dataService.getItemsByAllergen(id, allergenId) → MenuItem[]
```

### 4. Custom React Hooks (`src/hooks/useMenuData.ts`)

```
useRestaurant(id)              → { restaurant, isLoading, error }
useCategories(id)              → { categories, isLoading, error }
useCategoryItems(id, catId)    → { items, isLoading, error }
useMenuItem(id, catId, itemId) → { item, isLoading, error }
useMenuSearch(id, lang)        → { query, results, search, clearSearch }
useVegetarianItems(id)         → { items, count }
useVeganItems(id)              → { items, count }
useAllergens(id)               → { allergens, count }
useAllergenFilter(id, catId)   → { filteredItems, selectedAllergens, toggleAllergen }
useSortedItems(items, sortBy)  → MenuItem[]
```

---

## 📁 Файловая структура Этапа 2

```
src/
├── types/
│   └── menu.ts                    ✅ TypeScript типы
│
├── services/
│   └── dataService.ts             ✅ Сервис для доступа к данным
│
├── hooks/
│   └── useMenuData.ts             ✅ Custom React hooks
│
├── data/
│   └── menu.json                  ✅ JSON с меню (17 блюд, 3 языка)
│
├── components/                    (будет на Этапе 3)
├── pages/                         (будет на Этапе 3)
├── i18n/                          (будет на Этапе 3)
└── ...

Документация:
├── STAGE_2_GUIDE.md               ✅ Подробное руководство
├── EXAMPLES.tsx                   ✅ 10 примеров использования
└── ARCHITECTURE.md                (обновлено)
```

---

## 🎯 Ключевые особенности

### ✨ Оригинальные названия, переводы описаний

```json
{
  "name": "Menemen",  // ← Всегда одно и то же
  "description": {
    "en": "Traditional Turkish scrambled eggs...",
    "ru": "Традиционная турецкая яичница...",
    "tr": "Domates, biber ve soğanla..."
  }
}
```

### 🏗️ Слоистая архитектура

```
JSON файл (data)
      ↓
DataService (синглтон)
      ↓
Custom Hooks (React)
      ↓
React компоненты
```

### 🔄 Полная типизация

- TypeScript знает структуру каждого объекта
- Автодополнение в IDE
- Ошибки выявляются на этапе разработки

### ⚡ Оптимизация

- `useMemo` для предотвращения ненужных пересчетов
- `useCallback` для стабильных функций
- Синглтон DataService без повторного создания

---

## 📊 Пример использования

### Простое отображение блюд:

```typescript
import { useCategoryItems } from '@/hooks/useMenuData';

export function MenuPage() {
  const { items } = useCategoryItems('breakfast_place', 'eggs');
  
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### С фильтром и сортировкой:

```typescript
import { 
  useCategoryItems, 
  useAllergenFilter, 
  useSortedItems 
} from '@/hooks/useMenuData';

export function AdvancedMenu() {
  const { items } = useCategoryItems('breakfast_place', 'eggs');
  const { filteredItems, toggleAllergen } = useAllergenFilter('breakfast_place', 'eggs');
  const sorted = useSortedItems(filteredItems, 'price-asc');
  
  return <div>{/* render sorted && filtered items */}</div>;
}
```

---

## 🚀 Что дальше (Этап 3)

- Создать React компоненты (MenuCard, CategoryList, ItemDetail)
- Настроить React Router
- Интегрировать стилизацию Tailwind CSS
- Создать страницы приложения
- Добавить i18n переводы

---

## 📚 Документация

- **STAGE_2_GUIDE.md** - полное руководство с best practices (300+ строк)
- **EXAMPLES.tsx** - 10 готовых примеров кода для копирования
- **ARCHITECTURE.md** - общая архитектура проекта
- **src/types/menu.ts** - комментарии к каждому типу
- **src/services/dataService.ts** - комментарии к каждому методу
- **src/hooks/useMenuData.ts** - комментарии к каждому hook

---

## ✅ Чек-лист Этапа 2

- [x] Типизация TypeScript
- [x] JSON структура с меню
- [x] 1 ресторан (Breakfast Palace)
- [x] 4 категории (Turkish, Eggs, Pancakes, Waffles)
- [x] 17 блюд
- [x] 3 языка (en, ru, tr)
- [x] Оригинальные названия + переводы описаний
- [x] DataService с 15+ методами
- [x] 10 custom hooks для React
- [x] Примеры использования
- [x] Best practices документация

---

## 💡 Интересные особенности

1. **Оригинальные названия** - блюдо всегда на оригинальном языке (английском)
2. **Модульные переводы** - легко добавить новый язык (просто добавить ключ)
3. **Отсутствие БД** - все в JSON файле, статический контент
4. **Типобезопасность** - TypeScript проверяет все типы
5. **Производительность** - Hooks используют useMemo для оптимизации
6. **DRY принцип** - одна инстанция DataService на всё приложение

---

**Этап 2 завершен! 🎉**

Готовая система хранения данных с полной типизацией, DataService и hooks.
Готово к Этапу 3: Реализация компонентов и страниц.
