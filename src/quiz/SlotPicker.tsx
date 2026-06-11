import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import type { SlotSelection, Therapist, TimePref } from '../types'
import { experienceLabel, formatPrice } from '../lib/format'
import { track } from '../lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

const DAYPART_TIMES: Record<Exclude<TimePref, 'weekend'>, string[]> = {
  morning: ['9:00', '10:00', '11:00'],
  day: ['12:00', '14:00', '16:00'],
  evening: ['18:00', '19:00', '20:00'],
}

type Day = {
  index: number
  tabLabel: string
  dateLabel: string
  isoDate: string
  isWeekend: boolean
  isToday: boolean
}

function buildDays(): Day[] {
  const fmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })
  const now = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    const label = fmt.format(d)
    const dow = d.getDay()
    return {
      index: i,
      tabLabel: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : label[0].toUpperCase() + label.slice(1),
      dateLabel: label,
      isoDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      isWeekend: dow === 0 || dow === 6,
      isToday: i === 0,
    }
  })
}

/** Честные и детерминированные слоты из расписания психолога — без фейкового дефицита */
function timesForDay(therapist: Therapist, day: Day): string[] {
  let times: string[] = []
  if (day.isWeekend) {
    if (!therapist.schedule.includes('weekend')) return []
    times = ['10:00', '12:00', '15:00', '17:00']
    if (therapist.schedule.includes('evening')) times = [...times, ...DAYPART_TIMES.evening]
  } else {
    for (const part of ['morning', 'day', 'evening'] as const) {
      if (therapist.schedule.includes(part)) times = [...times, ...DAYPART_TIMES[part]]
    }
  }
  // Лёгкое прореживание занятыми слотами
  times = times.filter((t) => (day.index + parseInt(t, 10)) % 4 !== 0)
  if (day.isToday) {
    const cutoff = new Date().getHours() + 2
    times = times.filter((t) => parseInt(t, 10) > cutoff)
  }
  return times
}

export default function SlotPicker({
  therapist,
  onConfirm,
  onBack,
}: {
  therapist: Therapist
  onConfirm: (slot: SlotSelection) => void
  onBack: (() => void) | null
}) {
  const days = useMemo(buildDays, [])
  const [dayIndex, setDayIndex] = useState(0)
  const [time, setTime] = useState<string | null>(null)

  const day = days[dayIndex]
  const times = useMemo(() => timesForDay(therapist, day), [therapist, day])

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
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sun/60 via-peach/60 to-sky/60">
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

      <h2 className="mt-7 font-display text-3xl tracking-[-0.02em]">Выберите время</h2>

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
        <p className="mt-6 text-[14.5px] text-ink-soft">В этот день всё занято</p>
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
                  : 'border-line bg-white hover:border-ink/30'
              }`}
              onClick={() => setTime(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {time && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-5 py-4"
        >
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
        </motion.div>
      )}
    </div>
  )
}
