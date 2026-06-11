import { useRef, type KeyboardEvent, type ReactNode } from 'react'

/** Перемещение фокуса стрелками между кнопками-вариантами внутри контейнера */
export function useArrowNav() {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    if (buttons.length === 0) return
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const next = current === -1 ? 0 : (current + (forward ? 1 : -1) + buttons.length) % buttons.length
    buttons[next].focus()
    e.preventDefault()
  }

  return { ref, onKeyDown }
}

type OptionCardProps = {
  selected: boolean
  onClick: () => void
  icon?: ReactNode
  title: string
  sub?: string
  badge?: ReactNode
}

/** Карточка-вариант: при выборе — инверсия в ink (не жёлтый) */
export function OptionCard({ selected, onClick, icon, title, sub, badge }: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
        selected
          ? 'border-ink bg-ink text-paper'
          : 'border-line bg-white hover:border-ink/25 hover:bg-mist/40'
      }`}
    >
      <span className="flex items-center gap-4">
        {icon && (
          <span className={`shrink-0 ${selected ? 'text-paper/80' : 'text-ink-soft'}`} aria-hidden>
            {icon}
          </span>
        )}
        <span className="flex-1">
          <span className="flex items-center gap-2 font-semibold">
            {title}
            {badge}
          </span>
          {sub && (
            <span className={`mt-0.5 block text-[13.5px] ${selected ? 'text-paper/70' : 'text-ink-soft'}`}>
              {sub}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

export function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <header>
      <h2 className="font-display text-[28px] leading-snug tracking-[-0.02em] md:text-4xl">{title}</h2>
      {sub && <p className="mt-2 text-ink-soft">{sub}</p>}
    </header>
  )
}
