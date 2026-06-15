import type { Language, MenuCategory } from '../../../types/menu';
import type { CategoryEditorState } from '../types';

interface CategoryEditorModalProps {
  editor: CategoryEditorState;
  canEdit: boolean;
  supportedLanguages: Language[];
  onClose: () => void;
  onPatchDraft: (patch: Partial<MenuCategory>) => void;
  onSetCategoryTranslation: (lang: Language, value: string) => void;
  onSave: () => void;
}

export function CategoryEditorModal({
  editor,
  canEdit,
  supportedLanguages,
  onClose,
  onPatchDraft,
  onSetCategoryTranslation,
  onSave,
}: CategoryEditorModalProps) {
  if (!editor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close category editor"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editor.mode === 'create' ? 'Создание категории' : 'Редактирование категории'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Отдельное окно для управления структурой категории и переводами.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Закрыть
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">ID категории</span>
              <input
                value={editor.draft.id}
                disabled={!canEdit}
                onChange={(e) => onPatchDraft({ id: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Оригинальное имя</span>
              <input
                value={editor.draft.name}
                disabled={!canEdit}
                onChange={(e) => onPatchDraft({ name: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Иконка</span>
              <input
                value={editor.draft.icon ?? ''}
                disabled={!canEdit}
                onChange={(e) => onPatchDraft({ icon: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Группа</span>
              <select
                value={editor.draft.group ?? 'your_selections'}
                disabled={!canEdit}
                onChange={(e) =>
                  onPatchDraft({
                    group: e.target.value as MenuCategory['group'],
                  })
                }
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              >
                <option value="served_to_table">served_to_table</option>
                <option value="your_selections">your_selections</option>
                <option value="beverages">beverages</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(editor.draft.hidden)}
                disabled={!canEdit}
                onChange={(e) => onPatchDraft({ hidden: e.target.checked })}
              />
              Скрыть категорию
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(editor.draft.isComplimentary)}
                disabled={!canEdit}
                onChange={(e) =>
                  onPatchDraft({
                    isComplimentary: e.target.checked,
                  })
                }
              />
              Комплимент для гостя
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {supportedLanguages.map((lang) => (
              <label key={lang} className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Название {lang.toUpperCase()}</span>
                <input
                  value={editor.draft.displayName[lang] ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => onSetCategoryTranslation(lang, e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!canEdit}
            onClick={onSave}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {editor.mode === 'create' ? 'Создать категорию' : 'Сохранить категорию'}
          </button>
        </div>
      </div>
    </div>
  );
}
