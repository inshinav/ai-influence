import { useEffect, useState } from 'react'
import { Menu, Sparkles, X } from 'lucide-react'

const LINKS: Array<[string, string]> = [
  ['Сигналы', '#signals'],
  ['Человек', '#viewer'],
  ['Авторы', '#network'],
  ['Лента', '#feed'],
  ['Консоль', '#console'],
  ['Пилот', '#roadmap'],
  ['Этика', '#ethics'],
]

export function Header() {
  const [open, setOpen] = useState(false)

  // Закрываем мобильное меню по Esc.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`topbar${open ? ' is-open' : ''}`}>
      <div className="topbar-inner">
        <a className="brand" href="#top" aria-label="Я-Ферма" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            Я
          </span>
          <span className="brand-text">
            <strong>Я-Ферма</strong>
            <small>концепт для «Ясно»</small>
          </span>
        </a>

        <nav className="topnav" aria-label="Разделы концепта">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="topbar-actions">
          <a className="btn btn-dark btn-sm topbar-cta" href="#console">
            <Sparkles size={15} />
            <span>Симуляция</span>
          </a>
          <button
            className="menu-toggle"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="topnav-mobile" aria-label="Меню">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
