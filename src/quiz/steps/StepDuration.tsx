import type { DurationAnswer } from '../../types'
import { OptionCard, StepHeading, useArrowNav } from '../controls'

const OPTIONS: { value: DurationAnswer; title: string }[] = [
  { value: 'recent', title: 'Недавно' },
  { value: 'months', title: 'Несколько месяцев' },
  { value: 'year', title: 'Больше года' },
  { value: 'always', title: 'Сколько себя помню' },
]

export default function StepDuration({
  value,
  onSelect,
}: {
  value: DurationAnswer | null
  onSelect: (v: DurationAnswer) => void
}) {
  const nav = useArrowNav()

  return (
    <div>
      <StepHeading title="Как давно это состояние?" />
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
