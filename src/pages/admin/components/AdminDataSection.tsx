interface AdminDataSectionProps {
  canEdit: boolean;
  isSaving: boolean;
  status: string;
  jsonEditorText: string;
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
  onRefreshJsonEditor: () => void;
  onApplyJsonEditor: () => void;
  onJsonEditorTextChange: (value: string) => void;
}

export function AdminDataSection({
  canEdit,
  isSaving,
  status,
  jsonEditorText,
  onSave,
  onReset,
  onExport,
  onRefreshJsonEditor,
  onApplyJsonEditor,
  onJsonEditorTextChange,
}: AdminDataSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Управление данными</h2>
      <p className="mt-1 text-sm text-slate-500">
        Сохранение изменений, сброс к базовым JSON-файлам и экспорт.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!canEdit || isSaving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? 'Сохраняем...' : 'Сохранить в JSON проекта'}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!canEdit || isSaving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          Сбросить к JSON
        </button>
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Экспорт JSON
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Raw JSON редактор</h3>
            <p className="text-xs text-slate-500">
              Полный контроль над данными. После применения нажмите «Сохранить в JSON проекта».
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefreshJsonEditor}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Обновить из UI
            </button>
            <button
              type="button"
              onClick={onApplyJsonEditor}
              disabled={!canEdit}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Применить JSON
            </button>
          </div>
        </div>
        <textarea
          value={jsonEditorText}
          onChange={(e) => onJsonEditorTextChange(e.target.value)}
          spellCheck={false}
          className="h-80 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-slate-500"
        />
      </div>

      {status && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{status}</p>}
    </section>
  );
}
