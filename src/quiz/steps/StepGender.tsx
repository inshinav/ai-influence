import type { GenderPref } from '../../types'
import { OptionCard, StepHeading, useArrowNav } from '../controls'

const OPTIONS: { value: GenderPref; title: string }[] = [
  { value: 'any', title: 'Не важно' },
  { value: 'f', title: 'Женщина' },
  { value: 'm', title: 'Мужчина' },
]

export default function StepGender({
  value,
  onSelect,
}: {
  value: GenderPref | null
  onSelect: (v: GenderPref) => void
}) {
  const nav = useArrowNav()

  return (
    <div>
      <StepHeading
        title="Есть предпочтения по психологу?"
        sub="Пол специалиста — некоторым так комфортнее"
      />
      <div ref={nav.ref} onKeyDown={nav.onKeyDown} className="mt-8 flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onSelect(o.value)}
            title={o.title}
          />
        ))}
      </div>
    </div>
  )
}
