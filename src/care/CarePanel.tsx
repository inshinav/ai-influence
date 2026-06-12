import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HeartHandshake } from 'lucide-react'
import { useCalmMotion, useCare, type CareSettings } from './CareContext'
import { softChime } from '../lib/sound'
import { track } from '../lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

type ToggleKey = keyof CareSettings

/**
 * Строка-переключатель: вся строка — одна кнопка role="switch",
 * лейбл и подпись кликабельны целиком.
 */
function ToggleRow({
  label,
  sub,
  checked,
  disabled = false,
  onToggle,
}: {
  label: string
  sub?: string
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onToggle()
      }}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
        disabled ? 'opacity-50' : 'hover:bg-mist/60'
      }`}
    >
      <span className="min-w-0">
        <span className="block text-[14.5px] font-medium leading-snug">{label}</span>
        {sub && (
          <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">{sub}</span>
        )}
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-ink' : 'bg-mist'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-paper shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
    </button>
  )
}

/**
 * «Панель заботы»: доступность как видимая забота. Плавающая кнопка
 * слева внизу, по клику — панель с пятью настройками из CareContext.
 */
export default function CarePanel() {
  const { settings, setSetting } = useCare()
  const calmMotion = useCalmMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback((focusBack: boolean) => {
    setOpen(false)
    if (focusBack) buttonRef.current?.focus()
  }, [])

  // Esc и клик мимо — закрыть, фокус вернуть на кнопку
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close(true)
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close(true)
      }
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open, close])

  const toggle = (key: ToggleKey) => {
    const value = !settings[key]
    setSetting(key, value)
    track('care_toggle', { key, value })
    // Включили звук — даём услышать, как он звучит (no-op, если фактически выключен)
    if (key === 'sound' && value) window.setTimeout(softChime, 120)
  }

  return (
    // На мобайле — выше закреплённой CTA-панели, чтобы не перекрывать её
    <div ref={rootRef} className="fixed bottom-24 left-4 z-[80] md:bottom-4">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Панель заботы"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="care-panel-popover"
        onClick={() => {
          if (open) {
            close(true)
          } else {
            setOpen(true)
            track('care_panel_open')
          }
        }}
        className="peer flex size-12 items-center justify-center rounded-full border border-line bg-paper text-ink shadow-lift transition-colors hover:bg-mist"
      >
        <HeartHandshake size={20} aria-hidden />
      </button>

      {/* Подпись на десктопе при hover/focus кнопки */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-14 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[12.5px] font-medium text-paper opacity-0 transition-opacity duration-200 peer-hover:opacity-100 peer-focus-visible:opacity-100 md:block"
      >
        Забота
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            key="care-popover"
            id="care-panel-popover"
            role="dialog"
            aria-labelledby="care-panel-title"
            initial={calmMotion ? false : { opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              calmMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.18, ease: EASE } }
            }
            transition={{ duration: 0.26, ease: EASE }}
            className="card absolute bottom-full left-0 mb-3 w-[300px] origin-bottom-left p-5"
          >
            <h3 id="care-panel-title" className="text-[16px] font-semibold">
              Панель заботы
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-ink-soft">
              {'Настройте сайт под себя — действует, пока открыта страница'}
            </p>

            <div className="mt-4 flex flex-col gap-1">
              <ToggleRow
                label="Ночная тема"
                sub="мягкое ночное небо — глазам легче в темноте"
                checked={settings.night}
                onToggle={() => toggle('night')}
              />
              <ToggleRow
                label="Тихий режим"
                sub="без движения, звука и вибрации"
                checked={settings.quiet}
                onToggle={() => toggle('quiet')}
              />
              <ToggleRow
                label="Больше контраста"
                checked={settings.contrast}
                onToggle={() => toggle('contrast')}
              />
              <ToggleRow
                label="Крупнее текст"
                checked={settings.largeText}
                onToggle={() => toggle('largeText')}
              />
              <ToggleRow
                label="Меньше анимации"
                sub={settings.quiet ? 'выключено тихим режимом' : undefined}
                checked={settings.lessMotion}
                disabled={settings.quiet}
                onToggle={() => toggle('lessMotion')}
              />
              <ToggleRow
                label="Звук"
                sub={settings.quiet ? 'выключено тихим режимом' : 'мягкие звуковые ориентиры'}
                checked={settings.sound}
                disabled={settings.quiet}
                onToggle={() => toggle('sound')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
