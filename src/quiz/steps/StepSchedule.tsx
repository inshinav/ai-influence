import { CalendarDays, Sun, Sunrise, Sunset } from 'lucide-react'
import type { TimePref } from '../../types'
import { OptionCard, StepHeading, useArrowNav } from '../controls'

const OPTIONS: { value: TimePref; icon: typeof Sun; title: string; sub: string }[] = [
  { value: 'morning', icon: Sunrise, title: 'Утро', sub: 'до 12:00' },
  { value: 'day', icon: Sun, title: 'День', sub: '12:00–18:00' },
  { value: 'evening', icon: Sunset, title: 'Вечер', sub: 'после 18:00' },
  { value: 'weekend', icon: CalendarDays, title: 'Выходные', sub: 'суббота и воскресенье' },
]

export default function StepSchedule({
  value,
  onChange,
  onNext,
}: {
  value: TimePref[]
  onChange: (v: TimePref[]) => void
  onNext: () => void
}) {
  const { ref: navRef, onKeyDown: navKeyDown } = useArrowNav()

  const toggle = (v: TimePref) => {
    onChange(value.includes(v) ? value.filter((t) => t !== v) : [...value, v])
  }

  return (
    <div>
      <StepHeading title="Когда удобно встречаться?" sub="Можно выбрать несколько" />
      <div ref={navRef} onKeyDown={navKeyDown} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value.includes(o.value)}
            onClick={() => toggle(o.value)}
            icon={<o.icon size={22} />}
            title={o.title}
            sub={o.sub}
          />
        ))}
      </div>
      <button
        type="button"
        className={`btn-primary mt-8 ${value.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
        disabled={value.length === 0}
        onClick={onNext}
      >
        Показать психологов
      </button>
    </div>
  )
}
