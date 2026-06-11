import { useEffect, useState } from 'react'

/**
 * Adaptive Dawn: фаза суток управляет температурой амбиентного света.
 * Это сигнатура бренда — «мы рядом в любое время».
 */
export type DawnPhase = 'predawn' | 'morning' | 'day' | 'sunset' | 'night'

export type DawnPalette = {
  /** Подпись фазы — для QA-страницы и отладки */
  label: string
  /** Три цвета пятен mesh-градиента (радиальные центры, rgba) */
  blobs: [string, string, string]
  /** Очень прозрачная температурная вуаль поверх бумаги */
  veil: string
  /** Необязательная строка-настроение для hero (ночь/раннее утро) */
  heroLine?: string
}

export const DAWN: Record<DawnPhase, DawnPalette> = {
  predawn: {
    label: 'Предрассветная (5–7)',
    blobs: ['rgba(110, 122, 170, 0.45)', 'rgba(255, 179, 155, 0.32)', 'rgba(191, 217, 255, 0.45)'],
    veil: 'rgba(99, 112, 165, 0.045)',
    heroLine: 'Раннее утро — тоже время для себя.',
  },
  morning: {
    label: 'Утренняя (7–11)',
    blobs: ['rgba(255, 200, 61, 0.50)', 'rgba(255, 179, 155, 0.45)', 'rgba(191, 217, 255, 0.50)'],
    veil: 'rgba(255, 200, 61, 0.025)',
  },
  day: {
    label: 'Дневная (11–17)',
    blobs: ['rgba(255, 214, 110, 0.38)', 'rgba(255, 236, 200, 0.42)', 'rgba(191, 217, 255, 0.45)'],
    veil: 'rgba(255, 255, 255, 0)',
  },
  sunset: {
    label: 'Закатная (17–22)',
    blobs: ['rgba(245, 166, 35, 0.42)', 'rgba(255, 160, 130, 0.42)', 'rgba(206, 180, 255, 0.30)'],
    veil: 'rgba(245, 166, 35, 0.035)',
  },
  night: {
    label: 'Ночная (22–5)',
    blobs: ['rgba(86, 100, 155, 0.42)', 'rgba(125, 115, 175, 0.32)', 'rgba(191, 217, 255, 0.34)'],
    veil: 'rgba(40, 50, 90, 0.05)',
    heroLine: 'Не спится? Мы рядом — и в 4 утра.',
  },
}

export function phaseForHour(hour: number): DawnPhase {
  if (hour >= 22 || hour < 5) return 'night'
  if (hour < 7) return 'predawn'
  if (hour < 11) return 'morning'
  if (hour < 17) return 'day'
  return 'sunset'
}

/** Час с возможностью форсирования через ?hour=0–23 (для QA всех фаз) */
export function resolveHour(): number {
  try {
    const forced = new URLSearchParams(window.location.search).get('hour')
    if (forced !== null) {
      const h = parseInt(forced, 10)
      if (Number.isFinite(h) && h >= 0 && h <= 23) return h
    }
  } catch {
    /* SSR/тесты — падаем на текущий час */
  }
  return new Date().getHours()
}

/** Текущая фаза суток; пересматривается раз в минуту (фаза меняется редко) */
export function useDawnPhase(): { phase: DawnPhase; palette: DawnPalette; hour: number } {
  const [hour, setHour] = useState(resolveHour)

  useEffect(() => {
    const id = window.setInterval(() => setHour(resolveHour()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const phase = phaseForHour(hour)
  return { phase, palette: DAWN[phase], hour }
}
