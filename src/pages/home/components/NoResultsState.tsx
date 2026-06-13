import type { Language } from '../../../types/menu';
import { HOME_PAGE_TEXT } from '../constants/homePageText';

interface NoResultsStateProps {
  currentLanguage: Language;
}

export function NoResultsState({ currentLanguage }: NoResultsStateProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
      <h3 className="mb-2 text-xl font-bold text-slate-900">
        {HOME_PAGE_TEXT.noResultsTitle[currentLanguage]}
      </h3>
      <p className="text-slate-600">{HOME_PAGE_TEXT.noResultsBody[currentLanguage]}</p>
    </section>
  );
}
