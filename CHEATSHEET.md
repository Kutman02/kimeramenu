# 📋 Шпаргалка Этапа 2 - Быстрый Справочник

## 🎯 Константы (используй везде)

```typescript
// ID ресторана
const RESTAURANT_ID = 'breakfast_place';

// Языки
type Language = 'en' | 'ru' | 'tr';
const CURRENT_LANGUAGE: Language = 'en';

// ID категорий
const CATEGORIES = {
  TURKISH_BREAKFAST: 'turkish_breakfast',
  EGGS: 'eggs',
  PANCAKES: 'pancakes',
  WAFFLES: 'waffles',
} as const;
```

---

## 📦 DataService - Все методы

### Получение данных

```typescript
import { dataService } from '@/services/dataService';

// Ресторан
dataService.getRestaurant('breakfast_place')
dataService.getAllRestaurants()

// Категории
dataService.getCategories('breakfast_place')              // RestaurantConfig[]
dataService.getCategory('breakfast_place', 'eggs')       // MenuCategory | null

// Блюда
dataService.getCategoryItems('breakfast_place', 'eggs')  // MenuItem[]
dataService.getMenuItem('breakfast_place', 'eggs', 'item_scrambled')

// Аллергены
dataService.getAllergens('breakfast_place')              // Allergen[]
dataService.getAllergen('breakfast_place', 'eggs')

// Поиск и фильтры
dataService.searchItems('breakfast_place', 'scrambled', 'en')
dataService.getVegetarianItems('breakfast_place')
dataService.getVeganItems('breakfast_place')
dataService.getItemsByAllergen('breakfast_place', 'eggs')

// Проверки
dataService.isItemAvailable('breakfast_place', 'eggs', 'item_scrambled')
```

---

## ⚛️ React Hooks - Все методы

### useRestaurant

```typescript
const { restaurant } = useRestaurant('breakfast_place');
// → RestaurantConfig | null
```

### useCategories

```typescript
const { categories } = useCategories('breakfast_place');
// → MenuCategory[]
```

### useCategoryItems

```typescript
const { items } = useCategoryItems('breakfast_place', 'eggs');
// → MenuItem[]
```

### useMenuItem

```typescript
const { item } = useMenuItem('breakfast_place', 'eggs', 'item_scrambled');
// → MenuItem | null
```

### useMenuSearch

```typescript
const { query, results, search, clearSearch, hasResults } = useMenuSearch(
  'breakfast_place',
  'en'
);

search('scrambled');      // поиск
clearSearch();            // очистка
// results → MenuItem[]
// hasResults → boolean
```

### useAllergens

```typescript
const { allergens, count } = useAllergens('breakfast_place');
// allergens → Allergen[]
// count → number
```

### useAllergenFilter

```typescript
const { 
  filteredItems,       // MenuItem[] (без выбранных аллергенов)
  selectedAllergens,   // string[] (ID выбранных аллергенов)
  toggleAllergen,      // (id: string) => void
  clearFilters,        // () => void
  hasActiveFilters     // boolean
} = useAllergenFilter('breakfast_place', 'eggs');
```

### useVegetarianItems

```typescript
const { items, count } = useVegetarianItems('breakfast_place');
// items → MenuItem[]
// count → number
```

### useVeganItems

```typescript
const { items, count } = useVeganItems('breakfast_place');
// items → MenuItem[]
// count → number
```

### useSortedItems

```typescript
const sorted = useSortedItems(items, 'price-asc');
// sortBy: 'price-asc' | 'price-desc' | 'name'
// → MenuItem[]
```

---

## 🔧 Типы (TypeScript)

### MenuItem

```typescript
interface MenuItem {
  id: string;
  name: string;                      // Оригинальное имя
  description: FieldTranslations;    // Переводы { en, ru, tr }
  price: number;
  image: string;
  available: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: number;                    // 0-5
  portion?: string;                  // "300g", "2 pieces"
  allergens?: string[];              // IDs
  calories?: number;
}
```

### MenuCategory

```typescript
interface MenuCategory {
  id: string;
  name: string;                      // Оригинальное имя
  displayName: FieldTranslations;    // Переводы
  icon?: string;
  items: MenuItem[];
}
```

### RestaurantConfig

```typescript
interface RestaurantConfig {
  id: string;
  name: string;
  displayName: FieldTranslations;
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
```

---

## 💻 Быстрые примеры

### Пример 1: Список всех блюд в категории

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

### Пример 2: Поиск блюд

```typescript
import { useMenuSearch } from '@/hooks/useMenuData';

export function Search() {
  const { query, results, search } = useMenuSearch('breakfast_place', 'en');
  
  return (
    <div>
      <input
        onChange={(e) => search(e.target.value)}
        placeholder="Search..."
      />
      {results.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

### Пример 3: Фильтр по аллергенам

```typescript
import { useAllergenFilter, useAllergens } from '@/hooks/useMenuData';

export function AllergyFilter() {
  const { filteredItems, toggleAllergen, selectedAllergens } = 
    useAllergenFilter('breakfast_place', 'eggs');
  const { allergens } = useAllergens('breakfast_place');
  
  return (
    <div>
      {allergens.map(a => (
        <label key={a.id}>
          <input
            type="checkbox"
            checked={selectedAllergens.includes(a.id)}
            onChange={() => toggleAllergen(a.id)}
          />
          {a.name}
        </label>
      ))}
      {filteredItems.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

### Пример 4: Сортировка

```typescript
import { useCategoryItems, useSortedItems } from '@/hooks/useMenuData';
import { useState } from 'react';

export function SortMenu() {
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const { items } = useCategoryItems('breakfast_place', 'pancakes');
  const sorted = useSortedItems(items, sortBy);
  
  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="name">By Name</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
      </select>
      {sorted.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

---

## 🌍 Языки

```typescript
type Language = 'en' | 'ru' | 'tr';

// Используется в hooks
useMenuSearch('breakfast_place', 'en');
useMenuSearch('breakfast_place', 'ru');
useMenuSearch('breakfast_place', 'tr');

// Все описания доступны
const description_en = item.description.en;
const description_ru = item.description.ru;
const description_tr = item.description.tr;
```

---

## 📊 JSON структура быстро

```json
{
  "restaurants": [
    {
      "id": "breakfast_place",
      "name": "Breakfast Palace",
      "displayName": { "en": "...", "ru": "...", "tr": "..." },
      "categories": [
        {
          "id": "eggs",
          "name": "Eggs",
          "displayName": { "en": "...", "ru": "...", "tr": "..." },
          "items": [
            {
              "id": "item_scrambled",
              "name": "Scrambled Eggs",
              "description": { "en": "...", "ru": "...", "tr": "..." },
              "price": 5.99,
              "allergens": ["eggs", "dairy"],
              "vegetarian": true
            }
          ]
        }
      ],
      "allergens": [
        { "id": "eggs", "name": "Eggs", "icon": "🥚" }
      ]
    }
  ]
}
```

---

## 🎨 Tailwind классы (для Этапа 3)

```tsx
// Card для блюда
<div className="rounded-lg shadow-md p-4 hover:shadow-lg transition">
  <img src={item.image} alt={item.name} className="w-full rounded" />
  <h3 className="text-xl font-bold mt-2">{item.name}</h3>
  <p className="text-gray-600">${item.price}</p>
</div>

// Button
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Order
</button>

// Filter label
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" />
  <span>{allergen.icon} {allergen.name}</span>
</label>
```

---

## 🔍 Отладка

```typescript
// Проверить что есть в ресторане
console.log(dataService.getRestaurant('breakfast_place'));

// Все категории
console.log(dataService.getCategories('breakfast_place'));

// Все блюда в категории
console.log(dataService.getCategoryItems('breakfast_place', 'eggs'));

// Все аллергены
console.log(dataService.getAllergens('breakfast_place'));

// Вегетарианские блюда
console.log(dataService.getVegetarianItems('breakfast_place'));

// Поиск
console.log(dataService.searchItems('breakfast_place', 'scrambled', 'en'));
```

---

## ✅ Чек-лист для начала Этапа 3

- [ ] Импортирую нужный hook в компонент
- [ ] Вызваю hook с правильными параметрами
- [ ] Проверяю TypeScript подсказки
- [ ] Использую .map() для отображения array'ев
- [ ] Добавляю key={item.id} для lists
- [ ] Применяю Tailwind классы для стилизации
- [ ] Проверяю что всё отображается корректно

---

**Шпаргалка готова! Используй её при разработке Этапа 3! 🚀**
