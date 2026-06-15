import { MenuCard } from '../../../components/menu/MenuCard';
import { HOME_PAGE_TEXT } from '../constants/homePageText';
import type { Language, MenuItem } from '../../../types/menu';

interface ServedToTableSectionProps {
  items: MenuItem[];
  language: Language;
  onItemClick: (item: MenuItem) => void;
}

export function ServedToTableSection({ items, language, onItemClick }: ServedToTableSectionProps) {
  if (!items.length) return null;

  return (
    <section className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm sm:p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
        {HOME_PAGE_TEXT.standardBreakfastTitle[language]}
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} language={language} onClick={onItemClick} />
        ))}
      </div>
    </section>
  );
}
