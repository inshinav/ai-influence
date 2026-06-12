import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import type { SlotSelection, Therapist } from '../types'
import { buildDays, timesForDay } from '../lib/slots'
import { experienceLabel, formatPrice } from '../lib/format'
import { track } from '../lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

export default function SlotPicker({
  therapist,
  onConfirm,
  onBack,
}: {
  therapist: Therapist
  onConfirm: (slot: SlotSelection) => void
  onBack: (() => void) | null
}) {
  const days = useMemo(() => buildDays(), [])
  // Стартуем с первого дня, где реально есть слоты: ночью «сегодня» уже пуст,
  // и человек не должен встречать запись с экрана «всё занято»
  const [dayIndex, setDayIndex] = useState(() => {
    const first = days.findIndex((d) => timesForDay(therapist, d).length > 0)
    return first === -1 ? 0 : first
  })
  const [time, setTime] = useState<string | null>(null)
  const confirmRef = useRef<HTMLDivElement>(null)

  const day = days[dayIndex]
  const times = timesForDay(therapist, day)
  const nextFreeDay =
    times.length === 0
      ? days.find((d) => d.index !== dayIndex && timesForDay(therapist, d).length > 0)
      : undefined
  /** Сегодня пусто из-за «впритык не записываем», а не из-за занятости */
  const emptyByCutoff =
    times.length === 0 && day.isToday && timesForDay(therapist, day, { ignoreCutoff: true }).length > 0

  const pickTime = (t: string) => {
    setTime(t)
    // На коротких экранах бар подтверждения монтируется ниже фолда — доводим до него
    window.setTimeout(() => {
      confirmRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 60)
  }

  const initials = therapist.name
    .split(' ')
    .map((w) => w[0])
    .join('')

  return (
    <div>
      {onBack && (
        <button
          type="button"
          className="mb-6 inline-flex items-center gap-1.5 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
          onClick={onBack}
        >
          <ArrowLeft size={16} aria-hidden />
          К подборке
        </button>
      )}

      <div className="flex items-center gap-3">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky/25 via-azure/25 to-dawn/40">
          <span className="font-display" aria-hidden>
            {initials}
          </span>
          <img
            src={therapist.photo}
            alt={therapist.name}
            width={56}
            height={56}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </span>
        <div>
          <p className="font-semibold">{therapist.name}</p>
          <p className="text-[13.5px] text-ink-soft">
            {therapist.method} · {experienceLabel(therapist.experienceYears)}
          </p>
        </div>
      </div>

      <h2 className="mt-7 font-display text-3xl">Выберите время</h2>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="День сессии">
        {days.map((d) => (
          <button
            key={d.isoDate}
            type="button"
            role="tab"
            aria-selected={d.index === dayIndex}
            className={`chip whitespace-nowrap ${d.index === dayIndex ? 'chip-active' : ''}`}
            onClick={() => {
              setDayIndex(d.index)
              setTime(null)
            }}
          >
            {d.tabLabel}
          </button>
        ))}
      </div>

      {times.length === 0 ? (
        <div className="mt-6">
          <p className="text-[14.5px] text-ink-soft">
            {emptyByCutoff
              ? 'На сегодня запись уже закрыта — психологу нужно время подготовиться к встрече.'
              : 'В этот день всё занято — психолог уже с клиентами.'}
          </p>
          {nextFreeDay && (
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() => {
                setDayIndex(nextFreeDay.index)
                setTime(null)
              }}
            >
              {`Ближайшее свободное — ${
                nextFreeDay.index <= 1 ? nextFreeDay.tabLabel.toLowerCase() : nextFreeDay.tabLabel
              }`}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {times.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={time === t}
              className={`rounded-xl border py-2.5 text-[15px] font-medium transition-all duration-200 ${
                time === t
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-paper hover:border-ink/30'
              }`}
              onClick={() => pickTime(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {time && (
        <motion.div
          ref={confirmRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-7 rounded-2xl bg-mist px-5 py-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px]">
              <span className="font-medium">
                {therapist.name} · {day.dateLabel} · {time}
              </span>
              <span className="ml-2 text-ink-soft">{formatPrice(therapist.price)}</span>
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                track('slot_selected', { therapist: therapist.id })
                onConfirm({ dateLabel: day.dateLabel, isoDate: day.isoDate, time })
              }}
            >
              Закрепить время
            </button>
          </div>
          {/* Цена рядом с кнопкой — и сразу честное «когда платить» */}
          <p className="mt-2.5 text-[13px] text-ink-soft">
            {'Сейчас ничего не списываем: оплата — после знакомства, в личном кабинете.'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
