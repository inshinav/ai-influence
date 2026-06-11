import type { SlotSelection, Therapist } from '../types'

/** Генерирует .ics на лету и скачивает его — «Добавить в календарь» без бэкенда */
export function downloadIcs(therapist: Therapist, slot: SlotSelection): void {
  const [hours, minutes] = slot.time.split(':').map(Number)
  const start = new Date(`${slot.isoDate}T00:00:00`)
  start.setHours(hours, minutes, 0, 0)
  const end = new Date(start.getTime() + 50 * 60 * 1000)

  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//yasno-concept//RU',
    'BEGIN:VEVENT',
    `UID:${slot.isoDate}-${slot.time.replace(':', '')}@yasno-concept`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Сессия с психологом — ${therapist.name}`,
    'DESCRIPTION:Видеосессия в личном кабинете Ясно. Ссылка придёт на почту.',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Сессия через час',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'yasno-session.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
