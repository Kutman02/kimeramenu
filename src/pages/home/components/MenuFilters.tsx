import type { Language } from '../../../types/menu';
import { HOME_PAGE_TEXT } from '../constants/homePageText';
import type { DietFilter } from '../types';

interface MenuFiltersProps {
  currentLanguage: Language;
  searchQuery: string;
  dietFilter: DietFilter;
  totalVisibleItems: number;
  onSearchChange: (value: string) => void;
  onDietFilterChange: (filter: DietFilter) => void;
}

export function MenuFilters({
  currentLanguage,
  searchQuery,
  dietFilter,
  totalVisibleItems,
  onSearchChange,
  onDietFilterChange,
}: MenuFiltersProps) {
  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={HOME_PAGE_TEXT.searchPlaceholder[currentLanguage]}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDietFilterChange('all')}
            className={`h-11 rounded-xl px-4 text-sm font-medium transition ${
              dietFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {HOME_PAGE_TEXT.filterAll[currentLanguage]}
          </button>
          <button
            type="button"
            onClick={() => onDietFilterChange('vegetarian')}
            className={`h-11 rounded-xl px-4 text-sm font-medium transition ${
              dietFilter === 'vegetarian'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌱 {HOME_PAGE_TEXT.filterVegetarian[currentLanguage]}
          </button>
          <button
            type="button"
            onClick={() => onDietFilterChange('vegan')}
            className={`h-11 rounded-xl px-4 text-sm font-medium transition ${
              dietFilter === 'vegan'
                ? 'bg-emerald-700 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌿 {HOME_PAGE_TEXT.filterVegan[currentLanguage]}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {HOME_PAGE_TEXT.filtersTitle[currentLanguage]}: {totalVisibleItems}
      </p>
    </section>
  );
}
