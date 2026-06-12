# 🏗️ Архитектура Этапа 2 - Визуальная схема

## 📊 Слои архитектуры

```
┌─────────────────────────────────────────────────────┐
│     React Components (Этап 3)                       │
│  - MenuPage, ItemDetail, CategoryList, etc.         │
└────────────────────┬────────────────────────────────┘
                     │ используют
                     ↓
┌─────────────────────────────────────────────────────┐
│     Custom React Hooks (✅ Этап 2)                  │
│  - useRestaurant, useCategoryItems, useSearch       │
│  - useAllergenFilter, useSortedItems, etc.          │
│  - 10 hooks с useMemo оптимизацией                  │
└────────────────────┬────────────────────────────────┘
                     │ вызывают
                     ↓
┌─────────────────────────────────────────────────────┐
│     DataService (✅ Этап 2)                         │
│  - Singleton для доступа к данным                  │
│  - 15+ методов для работы с меню                   │
│  - Чистые функции без побочных эффектов            │
└────────────────────┬────────────────────────────────┘
                     │ читает
                     ↓
┌─────────────────────────────────────────────────────┐
│     JSON Данные (✅ Этап 2)                         │
│  - src/data/menu.json (1 ресторан, 17 блюд)       │
│  - 3 языка (en, ru, tr)                            │
│  - Все переводы встроены                           │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Файловая структура Этапа 2

```
src/
│
├── types/
│   └── menu.ts
│       ├── Language ('en' | 'ru' | 'tr')
│       ├── Allergen
│       ├── MenuItem (name + description translations)
│       ├── MenuCategory
│       ├── RestaurantConfig
│       ├── MenuData
│       └── MenuContextType
│
├── services/
│   └── dataService.ts
│       ├── getRestaurant()
│       ├── getCategories()
│       ├── getCategoryItems()
│       ├── getMenuItem()
│       ├── searchItems()
│       ├── getVegetarianItems()
│       ├── getVeganItems()
│       ├── getAllergens()
│       ├── getItemsByAllergen()
│       └── ... 6+ других методов
│
├── hooks/
│   └── useMenuData.ts
│       ├── useRestaurant()
│       ├── useCategories()
│       ├── useCategoryItems()
│       ├── useMenuItem()
│       ├── useMenuSearch()
│       ├── useVegetarianItems()
│       ├── useVeganItems()
│       ├── useAllergens()
│       ├── useAllergenFilter()
│       └── useSortedItems()
│
└── data/
    └── menu.json
        ├── version: "1.0.0"
        ├── supportedLanguages: ["en", "ru", "tr"]
        └── restaurants: [
              {
                "id": "breakfast_place",
                "name": "Breakfast Palace",
                "displayName": { en: "...", ru: "...", tr: "..." },
                "categories": [
                  {
                    "id": "turkish_breakfast",
                    "name": "Turkish Breakfast",
                    "displayName": { en: "...", ru: "...", tr: "..." },
                    "items": [
                      {
                        "id": "item_menemen",
                        "name": "Menemen",
                        "description": { en: "...", ru: "...", tr: "..." },
                        "price": 8.99,
                        "allergens": ["eggs"],
                        "vegetarian": false
                      },
                      ... (4 блюда в категории)
                    ]
                  },
                  ... (4 категории)
                ],
                "allergens": [
                  { "id": "eggs", "name": "Eggs", "icon": "🥚" },
                  ... (6 аллергенов)
                ]
              }
            ]
```

---

## 🔄 Поток данных

### Пример: Получение блюд категории

```
User Component (React)
        │
        ↓ import & use hook
        │
useCategoryItems('breakfast_place', 'eggs')
        │
        ├─ useMemo(() => {
        │   dataService.getCategoryItems('breakfast_place', 'eggs')
        │ }, [dependencies])
        │
        ↓
DataService.getCategoryItems()
        │
        ├─ найти ресторан по id
        ├─ найти категорию по id
        └─ вернуть items
        │
        ↓
MenuItem[] = [
  {
    id: "item_scrambled",
    name: "Scrambled Eggs",
    description: { en: "...", ru: "...", tr: "..." },
    price: 5.99,
    allergens: ["eggs", "dairy", "gluten"],
    vegetarian: true
  },
  ... (всё из JSON)
]
        │
        ↓
React Component отображает
```

---

## 🎯 Использование в компонентах

### Простой компонент

```typescript
import { useCategoryItems } from '@/hooks/useMenuData';

export function MenuList() {
  const { items } = useCategoryItems('breakfast_place', 'eggs');
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Сложный компонент с фильтрами

```typescript
import { 
  useCategoryItems, 
  useAllergenFilter, 
  useSortedItems,
  useAllergens 
} from '@/hooks/useMenuData';

export function AdvancedMenu() {
  const { items } = useCategoryItems('breakfast_place', 'eggs');
  const { allergens } = useAllergens('breakfast_place');
  const { filteredItems, toggleAllergen } = useAllergenFilter('breakfast_place', 'eggs');
  const sorted = useSortedItems(filteredItems, 'price-asc');
  
  return (
    <div>
      {/* Аллергены для фильтрации */}
      {allergens.map(a => (
        <label key={a.id}>
          <input
            type="checkbox"
            onChange={() => toggleAllergen(a.id)}
          />
          {a.icon} {a.name}
        </label>
      ))}
      
      {/* Отфильтрованные и отсортированные блюда */}
      {sorted.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Данные JSON - Структура

### Ресторан

```json
{
  "id": "breakfast_place",
  "name": "Breakfast Palace",
  "displayName": {
    "en": "Breakfast Palace",
    "ru": "Дворец Завтраков",
    "tr": "Kahvaltı Sarayı"
  },
  "description": {
    "en": "The finest breakfast experience in the city",
    "ru": "Лучший завтрак в городе",
    "tr": "Şehirdeki en iyi kahvaltı deneyimi"
  },
  "cuisineTypes": ["Turkish", "Mediterranean", "International"],
  "categories": [ ... ],
  "allergens": [ ... ]
}
```

### Категория

```json
{
  "id": "eggs",
  "name": "Eggs",
  "displayName": {
    "en": "Eggs",
    "ru": "Яйца",
    "tr": "Yumurtalar"
  },
  "icon": "🥚",
  "items": [ ... ]
}
```

### Блюдо

```json
{
  "id": "item_scrambled",
  "name": "Scrambled Eggs",
  "description": {
    "en": "Fluffy scrambled eggs with butter and toast",
    "ru": "Пушистая яичница со сливочным маслом и тостами",
    "tr": "Tereyağ ve tost ile doldurulmuş yumurta"
  },
  "price": 5.99,
  "image": "/images/dishes/scrambled_eggs.jpg",
  "available": true,
  "vegetarian": true,
  "spicy": 0,
  "portion": "2 eggs",
  "allergens": ["eggs", "dairy", "gluten"],
  "calories": 280
}
```

---

## 🔗 Связи между компонентами

```
                    Restaurant
                        │
            ┌───────────┼───────────┐
            │           │           │
        Category1   Category2   Category3
            │           │           │
        ┌───┴─┐     ┌───┴─┐     ┌──┴───┐
        │     │     │     │     │      │
       Item Item Item Item Item Item
```

---

## 🎓 Поток разработки

### Компонент нужен список блюд

```
1. Импортирует hook
   import { useCategoryItems } from '@/hooks/useMenuData';

2. Вызывает hook
   const { items } = useCategoryItems('breakfast_place', 'eggs');

3. Hook использует DataService
   dataService.getCategoryItems('breakfast_place', 'eggs');

4. DataService читает JSON
   return restaurant.categories[eggs].items

5. Возвращает в компонент
   return items (массив MenuItem)

6. Компонент отображает
   items.map(item => <MenuCard item={item} />)
```

---

## 💾 Размеры файлов

| Файл | Размер | Строк |
|------|--------|-------|
| menu.json | ~12 KB | 400 |
| dataService.ts | ~8 KB | 250 |
| useMenuData.ts | ~6 KB | 200 |
| menu.ts (types) | ~3 KB | 80 |
| **Итого кода** | ~27 KB | 930 |
| **Документация** | ~150 KB | 1700+ |

---

## ✨ Ключевые достижения

✅ **Полная типизация** - 7 интерфейсов для TypeScript  
✅ **Чистые данные** - JSON в 1 файле  
✅ **Модульный доступ** - 15+ методов в DataService  
✅ **React интеграция** - 10 hooks с оптимизацией  
✅ **Масштабируемость** - легко добавить рестораны  
✅ **Документация** - 1700+ строк с примерами  
✅ **Best practices** - Singleton, useMemo, custom hooks  
✅ **Многоязычность** - 3 языка встроено  

---

## 🚀 Готово к Этапу 3

Все основные компоненты системы готовы:

- ✅ Типизация (TypeScript)
- ✅ Данные (JSON)
- ✅ Логика (DataService)
- ✅ React интеграция (Hooks)

**Дальше нужно создать:**

- React компоненты (UI)
- Страницы (Pages)
- Маршруты (React Router)
- Стили (Tailwind CSS)
- Переводы (i18n)

**Этап 2 завершен! 🎉**
