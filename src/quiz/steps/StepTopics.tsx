import { Lock } from 'lucide-react'
import type { TopicId } from '../../types'
import { topics } from '../../data/topics'
import { StepHeading, useArrowNav } from '../controls'

const MAX = 3

export default function StepTopics({
  value,
  onChange,
  onNext,
}: {
  value: TopicId[]
  onChange: (v: TopicId[]) => void
  onNext: () => void
}) {
  const { ref: navRef, onKeyDown: navKeyDown } = useArrowNav()
  const full = value.length >= MAX

  const toggle = (id: TopicId) => {
    if (value.includes(id)) onChange(value.filter((t) => t !== id))
    else if (!full) onChange([...value, id])
  }

  return (
    <div>
      <StepHeading title="Что беспокоит?" sub="Выберите до трёх вариантов" />
      <div ref={navRef} onKeyDown={navKeyDown} className="mt-8 flex flex-wrap gap-2.5">
        {topics.map((t) => {
          const selected = value.includes(t.id)
          const blocked = full && !selected
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={selected}
              className={`chip ${selected ? 'chip-active' : ''} ${blocked ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => toggle(t.id)}
            >
              <t.icon size={16} aria-hidden />
              {t.label}
            </button>
          )
        })}
      </div>
      {full && (
        <p className="mt-4 text-[13.5px] text-ink-soft" aria-live="polite">
          {'Выбрано 3 из 3 — этого достаточно'}
        </p>
      )}
      {/* Момент раскрытия самого чувствительного — безопасность говорим здесь, не в FAQ */}
      <p className="mt-6 flex max-w-md items-start gap-2 text-[13px] leading-snug text-ink-soft">
        <Lock size={14} className="mt-0.5 shrink-0 text-sky" aria-hidden />
        {'Ответы видит только алгоритм подбора. Психолог узнает тему — рассказывать подробности или нет, решаете вы.'}
      </p>
      <button
        type="button"
        className={`btn-primary mt-8 ${value.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
        disabled={value.length === 0}
        onClick={onNext}
      >
        Дальше
      </button>
    </div>
  )
}
