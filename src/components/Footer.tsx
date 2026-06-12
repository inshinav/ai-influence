type FooterLink = { href: string; label: string; external?: boolean }

/** Ни одной мёртвой ссылки: либо живой якорь, либо реальный адрес экосистемы Ясно */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Сервис',
    links: [
      { href: '#how', label: 'Как это работает' },
      { href: '#therapists', label: 'Психологи' },
      { href: '#tests', label: 'Тесты' },
      { href: '#pricing', label: 'Цены' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Помощь',
    links: [
      { href: 'mailto:care@yasno.example', label: 'Поддержка 24/7' },
      { href: '#faq', label: 'Частые вопросы' },
      { href: 'tel:+74959895050', label: 'Экстренная помощь — МЧС' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { href: 'https://yasno.live', label: 'Настоящее Ясно', external: true },
      { href: 'https://work.yasno.live', label: 'Стать психологом Ясно', external: true },
      { href: 'https://yasno.live/blog', label: 'Блог', external: true },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-14">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div>
            <a href="#hero" className="font-display text-[20px] font-extrabold uppercase tracking-[-0.01em]" aria-label="Ясно — к началу страницы">
              ЯСНО<span className="text-sky">•</span>
            </a>
            <p className="mt-3 max-w-[260px] text-[15px] text-ink-soft">
              Онлайн-психотерапия, которой можно доверять
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-[14px] font-semibold">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="text-[15px] text-ink-soft transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p className="mt-10 text-[15px] text-ink-soft">
          <a href="mailto:care@yasno.example" className="transition-colors hover:text-ink">
            care@yasno.example
          </a>
          {' · '}ежедневно, круглосуточно
        </p>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="rounded-xl bg-mist px-4 py-3 text-[13px] text-ink-soft">
            Концепт-прототип для демонстрации продуктовых гипотез. Не{' '}является официальным
            сайтом Ясно. Факты о{' '}сервисе сверены по{' '}открытым страницам{' '}
            <a
              href="https://yasno.live"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-ink"
            >
              yasno.live
            </a>
            , анкеты, слоты и{' '}контакты — демонстрационные, без отправки данных.
          </p>
          <p className="shrink-0 text-[13px] text-ink-soft">©{' '}2026</p>
        </div>
      </div>
    </footer>
  )
}
