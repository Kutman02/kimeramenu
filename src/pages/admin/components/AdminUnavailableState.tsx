export function AdminUnavailableState() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Админ-панель недоступна</h1>
        <p className="mt-2 text-sm text-slate-600">В JSON нет данных о ресторане для редактирования.</p>
        <a
          href="/"
          className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Вернуться в меню
        </a>
      </div>
    </div>
  );
}
