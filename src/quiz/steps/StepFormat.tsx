import { Sprout, User, Users } from 'lucide-react'
import type { TherapyFormat } from '../../types'
import { OptionCard, StepHeading, useArrowNav } from '../controls'

const OPTIONS: { value: TherapyFormat; icon: typeof User; title: string; sub: string }[] = [
  { value: 'individual', icon: User, title: 'Для себя', sub: 'Индивидуальные сессии, 50 минут' },
  { value: 'couple', icon: Users, title: 'Для двоих', sub: 'Партнёр или член семьи — 1,5 часа' },
  { value: 'teen', icon: Sprout, title: 'Для подростка', sub: 'С 16 лет, бережный подход' },
]

export default function StepFormat({
  value,
  onSelect,
}: {
  value: TherapyFormat | null
  onSelect: (v: TherapyFormat) => void
}) {
  const { ref: navRef, onKeyDown: navKeyDown } = useArrowNav()

  return (
    <div>
      <StepHeading title="Для кого подбираем психолога?" />
      <div ref={navRef} onKeyDown={navKeyDown} className="mt-8 flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onSelect(o.value)}
            icon={<o.icon size={22} />}
            title={o.title}
            sub={o.sub}
          />
        ))}
      </div>
    </div>
  )
}
