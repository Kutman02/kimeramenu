import type { Language, RestaurantConfig } from '../../../types/menu';

interface HomeFooterProps {
  restaurant: RestaurantConfig;
  currentLanguage: Language;
}

const FOOTER_TEXT = {
  menuLabel: {
    en: 'Menu',
    ru: 'Меню',
    tr: 'Menu',
  },
  contactLabel: {
    en: 'Contact details',
    ru: 'Контакты',
    tr: 'Iletisim bilgileri',
  },
  address: {
    en: 'Address',
    ru: 'Адрес',
    tr: 'Adres',
  },
  phone: {
    en: 'Phone',
    ru: 'Телефон',
    tr: 'Telefon',
  },
  email: {
    en: 'Email',
    ru: 'Email',
    tr: 'E-posta',
  },
  website: {
    en: 'Website',
    ru: 'Сайт',
    tr: 'Web sitesi',
  },
  rights: {
    en: 'All rights reserved',
    ru: 'Все права защищены',
    tr: 'Tum haklari saklidir',
  },
} as const satisfies Record<string, Record<Language, string>>;

export function HomeFooter({ restaurant, currentLanguage }: HomeFooterProps) {
  const contactRows = [
    {
      key: 'address',
      label: FOOTER_TEXT.address[currentLanguage],
      value: restaurant.address,
      href: undefined,
    },
    {
      key: 'phone',
      label: FOOTER_TEXT.phone[currentLanguage],
      value: restaurant.phone,
      href: restaurant.phone ? `tel:${restaurant.phone}` : undefined,
    },
    {
      key: 'email',
      label: FOOTER_TEXT.email[currentLanguage],
      value: restaurant.email,
      href: restaurant.email ? `mailto:${restaurant.email}` : undefined,
    },
    {
      key: 'website',
      label: FOOTER_TEXT.website[currentLanguage],
      value: restaurant.website,
      href: restaurant.website,
    },
  ].reduce<Array<{ key: string; label: string; value: string; href?: string }>>((acc, row) => {
    const value = row.value?.trim();
    if (!value) return acc;

    acc.push({
      key: row.key,
      label: row.label,
      value,
      href: row.href,
    });
    return acc;
  }, []);

  return (
    <footer className="mt-12 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-linear-to-b from-white via-emerald-50/65 to-amber-50/40 text-slate-800 shadow-[0_22px_60px_rgba(2,44,34,0.28)]">
          <div className="p-4 sm:p-6">
            <div className="mb-4 rounded-2xl border border-emerald-100/90 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700/85">
                {FOOTER_TEXT.menuLabel[currentLanguage]}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
                {restaurant.displayName[currentLanguage]}
              </h3>
              {restaurant.description && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {restaurant.description[currentLanguage]}
                </p>
              )}
            </div>

            {!!contactRows.length && (
              <section className="mb-4 rounded-2xl border border-emerald-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm">
                  {FOOTER_TEXT.contactLabel[currentLanguage]}
                </p>
                <ul className="space-y-2.5">
                  {contactRows.map((row) => (
                    <li key={row.key}>
                      {row.href ? (
                        <a
                          href={row.href}
                          target={row.key === 'website' ? '_blank' : undefined}
                          rel={row.key === 'website' ? 'noreferrer' : undefined}
                          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100/90 bg-white/80 px-4 py-3 text-sm text-emerald-900 transition hover:border-emerald-200 hover:bg-emerald-50/70"
                        >
                          <span className="font-medium text-emerald-700">{row.label}</span>
                          <span className="truncate text-right">{row.value}</span>
                        </a>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100/90 bg-white/80 px-4 py-3 text-sm text-emerald-900">
                          <span className="font-medium text-emerald-700">{row.label}</span>
                          <span className="truncate text-right">{row.value}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80">
              © {new Date().getFullYear()} {restaurant.displayName[currentLanguage]} ·{' '}
              {FOOTER_TEXT.rights[currentLanguage]}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
