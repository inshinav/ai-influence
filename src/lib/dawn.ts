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

/* «Ясное небо 2.0»: голубой доминирует, тёплый --dawn — только тонкий край рассвета */
export const DAWN: Record<DawnPhase, DawnPalette> = {
  predawn: {
    label: 'Предрассветная (5–7)',
    blobs: ['rgba(54, 90, 140, 0.34)', 'rgba(255, 217, 168, 0.30)', 'rgba(95, 194, 240, 0.30)'],
    veil: 'rgba(40, 70, 120, 0.035)',
    heroLine: 'Раннее утро — тоже время для себя.',
  },
  morning: {
    label: 'Утренняя (7–11)',
    blobs: ['rgba(95, 194, 240, 0.42)', 'rgba(255, 217, 168, 0.32)', 'rgba(39, 155, 224, 0.26)'],
    veil: 'rgba(95, 194, 240, 0.03)',
    heroLine: 'Доброе утро. День можно начать с заботы о себе.',
  },
  day: {
    label: 'Дневная (11–17)',
    blobs: ['rgba(39, 155, 224, 0.30)', 'rgba(95, 194, 240, 0.36)', 'rgba(214, 236, 251, 0.55)'],
    veil: 'rgba(255, 255, 255, 0)',
  },
  sunset: {
    label: 'Закатная (17–22)',
    blobs: ['rgba(95, 194, 240, 0.34)', 'rgba(255, 217, 168, 0.42)', 'rgba(39, 155, 224, 0.24)'],
    veil: 'rgba(255, 217, 168, 0.05)',
    heroLine: 'Вечер — хорошее время разобрать прожитый день.',
  },
  night: {
    label: 'Ночная (22–5)',
    blobs: ['rgba(36, 64, 110, 0.36)', 'rgba(60, 110, 165, 0.28)', 'rgba(95, 194, 240, 0.22)'],
    veil: 'rgba(25, 45, 85, 0.05)',
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
