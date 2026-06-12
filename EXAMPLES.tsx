/**
 * EXAMPLES: Быстрые примеры использования DataService и Hooks
 * Скопируй и используй в своих компонентах
 */

// ============================================
// EXAMPLE 1: Простое отображение блюд
// ============================================

import { useCategoryItems } from '@/hooks/useMenuData';

export function SimpleMenuList() {
  const { items } = useCategoryItems('breakfast_place', 'eggs');

  return (
    <div className="menu">
      {items.map((item) => (
        <div key={item.id} className="menu-item">
          <h3>{item.name}</h3>
          <p>{item.price}$</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 2: Ресторан с категориями
// ============================================

import { useState } from 'react';
import { useRestaurant, useCategoryItems } from '@/hooks/useMenuData';

export function RestaurantWithCategories() {
  const [categoryId, setCategoryId] = useState('eggs');
  const { restaurant } = useRestaurant('breakfast_place');
  const { items } = useCategoryItems('breakfast_place', categoryId);

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div>
      <h1>{restaurant.name}</h1>
      
      {/* Категории */}
      <nav className="categories">
        {restaurant.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={categoryId === cat.id ? 'active' : ''}
          >
            {cat.icon} {cat.displayName.en}
          </button>
        ))}
      </nav>

      {/* Блюда */}
      <div className="items">
        {items.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <img src={item.image} alt={item.name} />
            <p>{item.description.en}</p>
            <p>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Фильтр по аллергенам
// ============================================

import { useAllergenFilter, useAllergens } from '@/hooks/useMenuData';

export function MenuWithAllergyFilter() {
  const { filteredItems, selectedAllergens, toggleAllergen, clearFilters } = 
    useAllergenFilter('breakfast_place', 'eggs');
  
  const { allergens } = useAllergens('breakfast_place');

  return (
    <div>
      <h2>Filter by Allergens</h2>
      
      {/* Чекбоксы для аллергенов */}
      <div className="allergen-filters">
        {allergens.map((allergen) => (
          <label key={allergen.id}>
            <input
              type="checkbox"
              checked={selectedAllergens.includes(allergen.id)}
              onChange={() => toggleAllergen(allergen.id)}
            />
            {allergen.icon} {allergen.name}
          </label>
        ))}
        {selectedAllergens.length > 0 && (
          <button onClick={clearFilters}>Clear Filters</button>
        )}
      </div>

      {/* Результаты */}
      <div className="results">
        <p>Showing {filteredItems.length} items</p>
        {filteredItems.map((item) => (
          <div key={item.id}>
            <h4>{item.name}</h4>
            <p>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Поиск блюд
// ============================================

import { useMenuSearch } from '@/hooks/useMenuData';
import { useCallback } from 'react';

export function SearchMenu() {
  const { query, results, search, clearSearch, hasResults } = useMenuSearch(
    'breakfast_place',
    'en'
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      search(e.target.value);
    },
    [search]
  );

  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search dishes..."
        value={query}
        onChange={handleInputChange}
      />

      {query && (
        <button onClick={clearSearch}>Clear</button>
      )}

      {hasResults && (
        <ul className="results">
          {results.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> - ${item.price}
            </li>
          ))}
        </ul>
      )}

      {query && !hasResults && (
        <p>No dishes found for "{query}"</p>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Сортировка блюд
// ============================================

import { useCategoryItems, useSortedItems } from '@/hooks/useMenuData';
import { useState } from 'react';

export function MenuWithSorting() {
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const { items } = useCategoryItems('breakfast_place', 'pancakes');
  const sorted = useSortedItems(items, sortBy);

  return (
    <div>
      <label>
        Sort by:
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="name">Name</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </label>

      <div className="items">
        {sorted.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Одно блюдо с полной информацией
// ============================================

import { useMenuItem } from '@/hooks/useMenuData';

export function DishDetail() {
  const { item } = useMenuItem('breakfast_place', 'turkish_breakfast', 'item_menemen');

  if (!item) return <p>Dish not found</p>;

  return (
    <div className="dish-detail">
      <img src={item.image} alt={item.name} />
      <h1>{item.name}</h1>
      
      <div className="description">
        <p>{item.description.en}</p>
      </div>

      <div className="details">
        <p><strong>Price:</strong> ${item.price}</p>
        {item.portion && <p><strong>Portion:</strong> {item.portion}</p>}
        {item.calories && <p><strong>Calories:</strong> {item.calories}</p>}
        {item.vegetarian && <p>🌱 Vegetarian</p>}
        {item.spicy && <p>🌶️ Spicy: {item.spicy}/5</p>}
      </div>

      {item.allergens && item.allergens.length > 0 && (
        <div className="allergens">
          <h3>Contains Allergens:</h3>
          <ul>
            {item.allergens.map((allergenId) => (
              <li key={allergenId}>{allergenId}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 7: Вегетарианское меню
// ============================================

import { useVegetarianItems } from '@/hooks/useMenuData';

export function VegetarianMenu() {
  const { items, count } = useVegetarianItems('breakfast_place');

  return (
    <div>
      <h2>Vegetarian Dishes ({count})</h2>
      {items.map((item) => (
        <div key={item.id}>
          <h3>🌱 {item.name}</h3>
          <p>{item.description.en}</p>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 8: Статистика аллергенов
// ============================================

import { useAllergens } from '@/hooks/useMenuData';

export function AllergenStats() {
  const { allergens, count } = useAllergens('breakfast_place');

  return (
    <div>
      <h2>Allergens in Menu ({count})</h2>
      <ul>
        {allergens.map((allergen) => (
          <li key={allergen.id}>
            {allergen.icon} {allergen.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EXAMPLE 9: Полная страница ресторана
// ============================================

import React, { useState } from 'react';
import { 
  useRestaurant,
  useCategoryItems,
  useAllergenFilter,
  useAllergens,
  useSortedItems 
} from '@/hooks/useMenuData';

export function FullRestaurantPage() {
  const restaurantId = 'breakfast_place';
  const [categoryId, setCategoryId] = useState('eggs');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');

  const { restaurant } = useRestaurant(restaurantId);
  const { items } = useCategoryItems(restaurantId, categoryId);
  const { allergens } = useAllergens(restaurantId);
  const { filteredItems, selectedAllergens, toggleAllergen } = useAllergenFilter(
    restaurantId,
    categoryId
  );
  const sorted = useSortedItems(filteredItems, sortBy);

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="restaurant-page">
      {/* Header */}
      <header>
        <h1>{restaurant.displayName.en}</h1>
        <p>{restaurant.cuisineTypes.join(', ')}</p>
      </header>

      {/* Category Navigation */}
      <nav className="categories">
        {restaurant.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={categoryId === cat.id ? 'active' : ''}
          >
            {cat.icon} {cat.displayName.en}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <aside className="filters">
        <h3>Filter by Allergens</h3>
        {allergens.map((allergen) => (
          <label key={allergen.id}>
            <input
              type="checkbox"
              checked={selectedAllergens.includes(allergen.id)}
              onChange={() => toggleAllergen(allergen.id)}
            />
            {allergen.icon} {allergen.name}
          </label>
        ))}
      </aside>

      {/* Sorting */}
      <div className="sorting">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="name">Name</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Menu Items */}
      <main className="menu-items">
        {sorted.map((item) => (
          <div key={item.id} className="menu-item-card">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="description">{item.description.en}</p>
            
            <div className="meta">
              {item.portion && <span className="portion">📏 {item.portion}</span>}
              {item.calories && <span className="calories">🔥 {item.calories}kcal</span>}
              {item.vegetarian && <span className="vegetarian">🌱 Vegetarian</span>}
              {item.spicy && <span className="spicy">🌶️ {item.spicy}/5</span>}
            </div>

            <div className="price">
              <strong>${item.price}</strong>
            </div>

            {item.allergens && item.allergens.length > 0 && (
              <div className="allergens-info">
                {item.allergens.map((id) => {
                  const allergen = allergens.find((a) => a.id === id);
                  return allergen ? (
                    <span key={id} className="allergen-badge">
                      {allergen.icon}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

// ============================================
// EXAMPLE 10: Использование DataService напрямую
// ============================================

import { dataService } from '@/services/dataService';

export function DirectServiceUsage() {
  // Все методы DataService доступны
  const restaurant = dataService.getRestaurant('breakfast_place');
  const categories = dataService.getCategories('breakfast_place');
  const items = dataService.getCategoryItems('breakfast_place', 'eggs');
  const searchResults = dataService.searchItems('breakfast_place', 'scrambled', 'en');
  const vegetarianItems = dataService.getVegetarianItems('breakfast_place');
  const allergens = dataService.getAllergens('breakfast_place');

  return (
    <div>
      <p>Restaurant: {restaurant?.name}</p>
      <p>Categories: {categories.length}</p>
      <p>Items: {items.length}</p>
      <p>Search results: {searchResults.length}</p>
      <p>Vegetarian items: {vegetarianItems.length}</p>
      <p>Allergens: {allergens.length}</p>
    </div>
  );
}
