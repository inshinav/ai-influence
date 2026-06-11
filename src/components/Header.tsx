import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'

const NAV_LINKS = [
  { href: '#how', label: 'Как это работает' },
  { href: '#therapists', label: 'Психологи' },
  { href: '#tests', label: 'Тесты' },
  { href: '#pricing', label: 'Цены' },
  { href: '#faq', label: 'FAQ' },
] as const

export default function Header({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/75 backdrop-blur-xl border-b border-line'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-[72px]">
        <a
          href="#hero"
          className="font-display text-[20px] font-extrabold uppercase tracking-[-0.01em]"
          aria-label="Ясно — к началу страницы"
        >
          ЯСНО
          {/* Точка-солнце: чуть крупнее и приподнята оптически */}
          <span className="ml-px align-[0.04em] text-[22px] leading-none text-sky">•</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="btn-primary !px-5 !py-2.5 text-[15px]"
          onClick={() => {
            track('cta_click', { section: 'header' })
            onOpenQuiz()
          }}
        >
          Подобрать психолога
        </button>
      </div>
    </header>
  )
}
