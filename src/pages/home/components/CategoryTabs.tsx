import type { MutableRefObject } from 'react';
import type { Language, MenuCategory } from '../../../types/menu';

interface CategoryTabsProps {
  categories: MenuCategory[];
  currentLanguage: Language;
  activeCategoryId: string;
  categoryTabRefs: MutableRefObject<Record<string, HTMLButtonElement | null>>;
  categoryTabsContainerRef: MutableRefObject<HTMLDivElement | null>;
  onCategorySelect: (categoryId: string) => void;
}

const getCategoryTabLabel = (category: MenuCategory, currentLanguage: Language) => {
  if (category.id === 'organic_eggs') {
    return 'Organic Eggs';
  }

  return category.displayName[currentLanguage] || category.displayName.en;
};

export function CategoryTabs({
  categories,
  currentLanguage,
  activeCategoryId,
  categoryTabRefs,
  categoryTabsContainerRef,
  onCategorySelect,
}: CategoryTabsProps) {
  return (
    <section className="sticky top-3 z-40 mb-4 ml-12 rounded-2xl bg-white/75 p-1.5 backdrop-blur-[2px] sm:ml-14 sm:mb-6">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-linear-to-l from-emerald-50/95 to-transparent" />
        <div
          ref={categoryTabsContainerRef}
          className="scrollbar-none flex min-h-10 snap-x snap-mandatory items-center gap-1.5 overflow-x-auto px-1 py-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              ref={(el) => {
                categoryTabRefs.current[category.id] = el;
              }}
              type="button"
              onClick={() => onCategorySelect(category.id)}
              className={`h-10 shrink-0 snap-start whitespace-nowrap rounded-full border px-3 text-sm font-medium transition duration-200 ${
                activeCategoryId === category.id
                  ? 'border-emerald-800 bg-linear-to-r from-emerald-900 to-emerald-700 text-emerald-50 shadow-[0_0_0_3px_rgba(6,78,59,0.16)]'
                  : 'border-emerald-100 bg-white text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/70'
              }`}
            >
              {category.icon ? `${category.icon} ` : ''}
              {getCategoryTabLabel(category, currentLanguage)}
              <span className="ml-1 text-xs opacity-80">({category.items.length})</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
