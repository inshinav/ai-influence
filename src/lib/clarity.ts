import type { CSSProperties } from 'react'

/**
 * «Станет ясно» как механика: --clarity 0 → 1 управляет туманом.
 * Контейнер получает clarityVars(c), внутри — слой .fog-veil из index.css,
 * который рассеивается по мере роста ясности.
 */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function clarityVars(clarity: number): CSSProperties {
  return { '--clarity': String(clamp01(clarity)) } as CSSProperties
}

/** Ясность по прогрессу «answered из total» с мягким стартом (не с нуля) */
export function clarityForProgress(answered: number, total: number): number {
  if (total <= 0) return 1
  return clamp01(0.12 + (answered / total) * 0.88)
}
