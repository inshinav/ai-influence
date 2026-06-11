import type { MethodPref } from '../../types'
import { OptionCard, StepHeading, useArrowNav } from '../controls'

const OPTIONS: { value: MethodPref; title: string; hint: string; recommended?: boolean }[] = [
  {
    value: 'any',
    title: 'Доверюсь подбору',
    hint: 'Сопоставим метод с вашим запросом — это наш профиль',
    recommended: true,
  },
  { value: 'КПТ', title: 'КПТ', hint: 'Работа с мыслями и поведением, ближе к практике' },
  { value: 'Психоанализ', title: 'Психоанализ', hint: 'Глубокая работа с причинами, а не симптомами' },
  { value: 'Гештальт', title: 'Гештальт', hint: 'Чувства и опыт «здесь и сейчас»' },
  {
    value: 'Системная',
    title: 'Системная терапия',
    hint: 'Смотрит на отношения целиком, подходит для семейных запросов',
  },
]

export default function StepMethod({
  value,
  onSelect,
}: {
  value: MethodPref
  onSelect: (v: MethodPref) => void
}) {
  const nav = useArrowNav()

  return (
    <div>
      <StepHeading
        title="Какой подход ближе?"
        sub="Если не уверены — доверьтесь подбору, это работает лучше всего"
      />
      <div ref={nav.ref} onKeyDown={nav.onKeyDown} className="mt-8 flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onSelect(o.value)}
            title={o.title}
            sub={o.hint}
            badge={
              o.recommended ? (
                <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-semibold text-ink">
                  Рекомендуем
                </span>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
