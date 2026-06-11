import { useEffect, useRef } from 'react'
import { Phone } from 'lucide-react'
import { track } from '../lib/analytics'
import type { ClearingTestId } from './tests'

/**
 * Ветка тяжёлого состояния: вместо результата — спокойный экран поддержки.
 * Без апсейла, без жёлтой CTA, без анимаций-праздника. Терапия упоминается
 * мягко, вторичной кнопкой — когда человек будет готов.
 */

const DEFAULT_LEAD =
  'Спасибо за честные ответы. Похоже, сейчас вам действительно тяжело — и с этим не нужно оставаться один на один.'

const RESOURCES = [
  {
    name: 'Экстренная психологическая помощь МЧС России',
    phone: '+7 (495) 989-50-50',
    tel: '+74959895050',
    note: 'круглосуточно, бесплатно',
  },
  {
    name: 'Детский телефон доверия (до 18 лет)',
    phone: '8-800-2000-122',
    tel: '88002000122',
    note: 'круглосуточно, бесплатно, анонимно',
  },
]

export default function SupportScreen({
  testId,
  lead,
  onFindTherapist,
  onRestart,
}: {
  testId: ClearingTestId
  lead?: string
  onFindTherapist: () => void
  onRestart?: () => void
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    track('test_support_branch', { test: testId })
  }, [testId])

  return (
    <div>
      <p className="max-w-xl text-lg font-medium leading-snug">{lead ?? DEFAULT_LEAD}</p>
      <p className="mt-3 max-w-xl text-[15px] text-ink-soft">
        Это не диагноз — только повод позаботиться о себе чуть раньше. Вот куда можно
        обратиться бесплатно, прямо сейчас:
      </p>

      <ul className="mt-5 grid gap-3">
        {RESOURCES.map((resource) => (
          <li key={resource.tel}>
            <a
              href={`tel:${resource.tel}`}
              className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 transition-colors duration-200 hover:bg-mist/50"
            >
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist"
                aria-hidden="true"
              >
                <Phone className="h-4 w-4 text-ink" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold leading-snug">
                  {resource.name}
                </span>
                <span className="mt-0.5 block text-[15px] text-ink">{resource.phone}</span>
                <span className="block text-[13px] text-ink-soft">{resource.note}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 max-w-xl text-[15px] text-ink-soft">
        Если есть мысли причинить себе вред — пожалуйста, позвоните прямо сейчас.
      </p>

      <div className="mt-8 border-t border-line pt-6">
        <p className="text-[15px] text-ink-soft">
          Психотерапия тоже помогает — когда будете готовы.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary" onClick={onFindTherapist}>
            Подобрать психолога
          </button>
          {onRestart && (
            <button
              type="button"
              className="rounded-full px-5 py-3 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:bg-mist hover:text-ink"
              onClick={onRestart}
            >
              Пройти ещё раз
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
