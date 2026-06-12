# React Menu System - Best Practices & Implementation Guide

## Этап 2: Система хранения данных

### 📋 Типизация (TypeScript)

#### Основные типы из `src/types/menu.ts`:

```typescript
// Поддерживаемые языки
type Language = 'en' | 'ru' | 'tr';

// Блюдо с оригинальным названием и переводами описания
interface MenuItem {
  id: string;
  name: string;                 // Оригинальное название (не переводится!)
  description: FieldTranslations; // Переводы описания
  price: number;
  image: string;
  available: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: number;              // 0-5 scale
  portion?: string;            // "300g", "2 pieces"
  allergens?: string[];        // IDs аллергенов
  calories?: number;
}

// Категория меню
interface MenuCategory {
  id: string;
  name: string;                // Оригинальное название
  displayName: FieldTranslations; // Переводы для отображения
  items: MenuItem[];
}

// Конфигурация ресторана
interface RestaurantConfig {
  id: string;
  name: string;
  displayName: FieldTranslations;
  categories: MenuCategory[];
  allergens: Allergen[];
  settings: {
    currency: string;
    defaultLanguage: Language;
  };
}
```

---

## 📊 Структура JSON (menu.json)

```json
{
  "version": "1.0.0",
  "supportedLanguages": ["en", "ru", "tr"],
  "restaurants": [
    {
      "id": "breakfast_place",
      "name": "Breakfast Palace",
      "displayName": {
        "en": "Breakfast Palace",
        "ru": "Дворец Завтраков",
        "tr": "Kahvaltı Sarayı"
      },
      "categories": [
        {
          "id": "turkish_breakfast",
          "name": "Turkish Breakfast",
          "displayName": {
            "en": "Turkish Breakfast",
            "ru": "Турецкий Завтрак",
            "tr": "Türk Kahvaltısı"
          },
          "items": [
            {
              "id": "item_menemen",
              "name": "Menemen",
              "description": {
                "en": "Traditional Turkish scrambled eggs...",
                "ru": "Традиционная турецкая яичница...",
                "tr": "Domates, biber ve soğanla..."
              },
              "price": 8.99,
              "allergens": ["eggs"],
              "vegetarian": false
            }
          ]
        }
      ]
    }
  ]
}
```

### ✨ Ключевые особенности JSON:

1. **Оригинальные названия** - Название блюда (`name`) всегда одно и то же
2. **Переводы описаний** - Переводятся описания, не названия
3. **i18n структура** - `FieldTranslations` содержит перевод для каждого языка
4. **Модульность** - Легко добавить новый язык (просто добавить ключ в объект)

---

## 🛠️ Сервис для получения данных (DataService)

### Основной файл: `src/services/dataService.ts`

#### Примеры использования:

```typescript
import { dataService } from '@/services/dataService';

// Получить ресторан
const restaurant = dataService.getRestaurant('breakfast_place');

// Получить категории
const categories = dataService.getCategories('breakfast_place');

// Получить одно блюдо
const item = dataService.getMenuItem(
  'breakfast_place',
  'turkish_breakfast',
  'item_menemen'
);

// Получить все блюда из категории
const items = dataService.getCategoryItems('breakfast_place', 'eggs');

// Поиск блюд
const results = dataService.searchItems('breakfast_place', 'scrambled', 'en');

// Получить вегетарианские блюда
const vegItems = dataService.getVegetarianItems('breakfast_place');

// Получить блюда с определенным аллергеном
const itemsWithNuts = dataService.getItemsByAllergen('breakfast_place', 'nuts');
```

### 📌 Почему это хорошо:

✅ **Singleton pattern** - Одна единственная инстанция сервиса
✅ **Типизированный** - TypeScript подскажет все методы
✅ **Функциональный** - Чистые функции, без побочных эффектов
✅ **Масштабируемый** - Легко добавить новые методы
✅ **Слабо связан** - Компоненты не знают о структуре JSON

---

## ⚛️ React Best Practices

### 1️⃣ Использование Custom Hooks

#### ❌ ПЛОХО: Прямой доступ к данным в компоненте

```typescript
import React from 'react';
import { dataService } from '@/services/dataService';

export function MenuList() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    const items = dataService.getCategoryItems('breakfast_place', 'eggs');
    setItems(items);
  }, []);

  return <div>{/* ... */}</div>;
}
```

#### ✅ ХОРОШО: Использовать hook

```typescript
import React from 'react';
import { useCategoryItems } from '@/hooks/useMenuData';

export function MenuList() {
  const { items } = useCategoryItems('breakfast_place', 'eggs');

  return <div>{/* ... */}</div>;
}
```

### 2️⃣ Композиция Hooks

```typescript
export function MenuFilter() {
  // Несколько hooks вместе
  const { categories } = useCategories('breakfast_place');
  const { allergens } = useAllergens('breakfast_place');
  const { selectedAllergens, filteredItems, toggleAllergen } = useAllergenFilter(
    'breakfast_place',
    'eggs'
  );

  return (
    <div>
      {/* Отображение аллергенов для фильтрации */}
      {allergens.map((allergen) => (
        <button
          key={allergen.id}
          onClick={() => toggleAllergen(allergen.id)}
          className={selectedAllergens.includes(allergen.id) ? 'active' : ''}
        >
          {allergen.name} {allergen.icon}
        </button>
      ))}
      
      {/* Отображение отфильтрованных блюд */}
      {filteredItems.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### 3️⃣ Memoization для производительности

```typescript
import { useMemo } from 'react';

export function ExpensiveComponent({ restaurantId, categoryId }) {
  // useMemo предотвращает ненужные пересчеты
  const items = useMemo(
    () => dataService.getCategoryItems(restaurantId, categoryId),
    [restaurantId, categoryId] // Пересчитать только если эти зависимости изменились
  );

  return <div>{/* ... */}</div>;
}
```

### 4️⃣ Поиск с debouncing

```typescript
import { useMenuSearch } from '@/hooks/useMenuData';
import { useCallback } from 'react';

export function SearchComponent() {
  const { query, results, search, clearSearch } = useMenuSearch(
    'breakfast_place',
    'en'
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
  }, [search]);

  return (
    <div>
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder="Поиск блюда..."
      />
      
      {results.length > 0 && (
        <ul>
          {results.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5️⃣ Фильтрация по аллергенам

```typescript
export function MenuWithAllergyFilter() {
  const { filteredItems, selectedAllergens, toggleAllergen, hasActiveFilters } = 
    useAllergenFilter('breakfast_place', 'eggs');
  
  const { allergens } = useAllergens('breakfast_place');

  return (
    <div>
      {/* Отображение фильтров */}
      <div className="filters">
        {allergens.map((allergen) => (
          <label key={allergen.id}>
            <input
              type="checkbox"
              checked={selectedAllergens.includes(allergen.id)}
              onChange={() => toggleAllergen(allergen.id)}
            />
            Exclude {allergen.name}
          </label>
        ))}
      </div>

      {/* Показать активные фильтры */}
      {hasActiveFilters && (
        <p>Showing items without: {selectedAllergens.join(', ')}</p>
      )}

      {/* Список блюд */}
      <div className="items">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 6️⃣ Сортировка

```typescript
export function SortedMenu() {
  const { items } = useCategoryItems('breakfast_place', 'pancakes');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  
  const sorted = useSortedItems(items, sortBy);

  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">By Name</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>

      {sorted.map((item) => (
        <div key={item.id}>
          {item.name} - ${item.price}
        </div>
      ))}
    </div>
  );
}
```

---

## 🏗️ Архитектурные паттерны

### Паттерн: Custom Hook для глубокой логики

```typescript
// ❌ Не делай так - логика в компоненте
function ComponentWithLogic() {
  const [filtered, setFiltered] = useState([]);
  const [sorted, setSorted] = useState([]);
  // ... много логики ...
}

// ✅ Создай отдельный hook
export function useMenuWithFiltersAndSort(restaurantId: string, categoryId: string) {
  const { items } = useCategoryItems(restaurantId, categoryId);
  const { filteredItems, toggleAllergen } = useAllergenFilter(restaurantId, categoryId);
  const sorted = useSortedItems(filteredItems, 'price-asc');
  
  return { sorted, toggleAllergen };
}

// Потом используй в компоненте
function MenuComponent() {
  const { sorted, toggleAllergen } = useMenuWithFiltersAndSort('breakfast_place', 'eggs');
  // Чистая логика отображения
}
```

---

## 🎯 Правила использования DataService и Hooks

### ✅ DO

```typescript
// 1. Использовать hooks в функциональных компонентах
export function MenuPage() {
  const { items } = useCategoryItems(restaurantId, categoryId);
  return <div>{/* ... */}</div>;
}

// 2. Использовать useMemo для оптимизации
const memoizedItems = useMemo(() => items.filter(...), [items]);

// 3. Использовать useCallback для стабильных функций
const handleClick = useCallback(() => { /* ... */ }, []);

// 4. Группировать связанные hooks
const { items } = useCategoryItems(...);
const { allergens } = useAllergens(...);

// 5. Кэшировать результаты при частом использовании
const expensive = useMemo(() => dataService.expensiveOperation(), [deps]);
```

### ❌ DON'T

```typescript
// 1. Не вызывать hooks внутри условий
if (condition) {
  const { items } = useCategoryItems(...); // ❌
}

// 2. Не вызывать dataService напрямую в компоненте много раз
const item1 = dataService.getMenuItem(...);
const item2 = dataService.getMenuItem(...); // ❌

// 3. Не менять порядок вызовов hooks
const [x, setX] = useState(); // ❌ Может быть условно выше

// 4. Не создавать новые объекты в renderе без useMemo
const filtered = items.filter(...); // ❌ Пересоздается каждый раз

// 5. Не игнорировать зависимости в useMemo/useCallback
useMemo(() => items.filter(i => i.id === id), []); // ❌ id не в deps
```

---

## 📱 Пример полной страницы

```typescript
import React, { useState } from 'react';
import { 
  useRestaurant, 
  useCategoryItems, 
  useAllergenFilter,
  useSortedItems 
} from '@/hooks/useMenuData';

export function RestaurantPage({ restaurantId = 'breakfast_place' }) {
  const [selectedCategory, setSelectedCategory] = useState('eggs');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');

  // Получить информацию о ресторане
  const { restaurant } = useRestaurant(restaurantId);

  // Получить блюда из выбранной категории
  const { items } = useCategoryItems(restaurantId, selectedCategory);

  // Фильтр по аллергенам
  const { filteredItems, toggleAllergen, selectedAllergens } = 
    useAllergenFilter(restaurantId, selectedCategory);

  // Сортировка
  const sorted = useSortedItems(filteredItems, sortBy);

  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div>
      <h1>{restaurant.displayName.en}</h1>

      {/* Категории */}
      <nav>
        {restaurant.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? 'active' : ''}
          >
            {cat.icon} {cat.displayName.en}
          </button>
        ))}
      </nav>

      {/* Фильтры */}
      <div className="filters">
        {restaurant.allergens.map((allergen) => (
          <label key={allergen.id}>
            <input
              type="checkbox"
              checked={selectedAllergens.includes(allergen.id)}
              onChange={() => toggleAllergen(allergen.id)}
            />
            {allergen.icon} {allergen.name}
          </label>
        ))}
      </div>

      {/* Сортировка */}
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="name">By Name</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>

      {/* Меню */}
      <div className="menu-items">
        {sorted.map((item) => (
          <div key={item.id} className="menu-item">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>{item.description.en}</p>
            <div className="price">${item.price}</div>
            {item.vegetarian && <span>🌱 Vegetarian</span>}
            {item.allergens?.length > 0 && (
              <div className="allergens">
                {item.allergens.map((id) => {
                  const allergen = restaurant.allergens.find(a => a.id === id);
                  return <span key={id}>{allergen?.icon} {allergen?.name}</span>;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 Выводы

1. **DataService** - синглтон для доступа к данным
2. **Custom Hooks** - обертки над DataService для React компонентов
3. **useMemo & useCallback** - оптимизация производительности
4. **Типизация** - полная поддержка TypeScript
5. **Масштабируемость** - легко добавлять новые функции

Готово к Этапу 3: Реализация страниц и компонентов! 🎉
