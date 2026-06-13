import type { Language } from '../../../types/menu';

interface LanguageSelectionPromptProps {
  onSelectLanguage: (language: Language) => void;
}

const languageOptions: Array<{ value: Language; label: string }> = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'ru', label: '🇷🇺 Русский' },
  { value: 'tr', label: '🇹🇷 Türkçe' },
];

export function LanguageSelectionPrompt({ onSelectLanguage }: LanguageSelectionPromptProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Choose language</h1>
        <p className="mb-5 text-sm text-slate-600">Пожалуйста, выберите язык меню</p>

        <div className="space-y-2">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectLanguage(option.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
