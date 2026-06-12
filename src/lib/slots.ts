import type { Therapist, TimePref } from '../types'

/**
 * Единый источник правды о слотах. Карточка психолога, результаты подбора
 * и слот-пикер показывают ОДНО И ТО ЖЕ расписание — обещание «сегодня, 19:00»
 * на карточке всегда сходится с реальной сеткой выбора времени.
 */

const DAYPART_TIMES: Record<Exclude<TimePref, 'weekend'>, string[]> = {
  morning: ['9:00', '10:00', '11:00'],
  day: ['12:00', '14:00', '16:00'],
  evening: ['18:00', '19:00', '20:00'],
}

export type Day = {
  index: number
  tabLabel: string
  dateLabel: string
  isoDate: string
  isWeekend: boolean
  isToday: boolean
}

export function buildDays(): Day[] {
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
export function timesForDay(
  therapist: Therapist,
  day: Day,
  opts: { ignoreCutoff?: boolean } = {},
): string[] {
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
  // Сегодня нельзя записаться «впритык»: психологу нужно время подготовиться
  if (day.isToday && !opts.ignoreCutoff) {
    const cutoff = new Date().getHours() + 2
    times = times.filter((t) => parseInt(t, 10) > cutoff)
  }
  return times
}

/** «сегодня, 19:00» / «завтра, 10:00» / «в субботу, 10:00» — из реальной сетки */
export function nextSlotLabel(therapist: Therapist, days: Day[] = buildDays()): string {
  for (const day of days) {
    const times = timesForDay(therapist, day)
    if (times.length === 0) continue
    if (day.index === 0) return `сегодня, ${times[0]}`
    if (day.index === 1) return `завтра, ${times[0]}`
    return `в ${day.dateLabel.split(',')[0]}, ${times[0]}`
  }
  return 'на следующей неделе'
}
