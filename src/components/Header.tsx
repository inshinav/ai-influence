import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useCare, useCalmMotion } from '../care/CareContext'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const { settings, setSetting } = useCare()
  const calm = useCalmMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc закрывает мобильное меню
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled || menuOpen
          ? 'bg-paper/75 backdrop-blur-xl border-b border-line'
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

        <div className="flex items-center gap-1.5">
          {/* Деликатный переключатель ночного неба — забота на виду */}
          <button
            type="button"
            aria-label={settings.night ? 'Включить дневную тему' : 'Включить ночную тему'}
            aria-pressed={settings.night}
            className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-mist hover:text-ink"
            onClick={() => {
              track('night_toggle', { on: !settings.night, source: 'header' })
              setSetting('night', !settings.night)
            }}
          >
            {settings.night ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>
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
          {/* Мобильное меню: без него «Цены» и «FAQ» на телефоне недостижимы из шапки */}
          <button
            type="button"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-mist hover:text-ink md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Основная навигация"
            className="border-t border-line bg-paper/95 backdrop-blur-xl md:hidden"
            initial={calm ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={calm ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: calm ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-x flex flex-col py-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-2 py-3 text-[16px] text-ink transition-colors hover:bg-mist"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
