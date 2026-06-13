import { useEffect, useRef, useState } from 'react'

// Считалка: плавно доводит число от 0 до цели, когда блок появляется в зоне видимости.
// Уважает prefers-reduced-motion — тогда сразу показывает финальное значение.

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCountUp(target: number, active: boolean, durationMs = 1100): number {
  const [value, setValue] = useState(0)
  const frame = useRef(0)
  const started = useRef(false)
  // Считаем один раз за рендер; при reduce-motion значение выводится напрямую (derive),
  // чтобы не дёргать setState синхронно в эффекте.
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (reduced || !active || started.current) return
    started.current = true

    let startTime = 0
    const tick = (now: number) => {
      if (!startTime) startTime = now
      const progress = Math.min(1, (now - startTime) / durationMs)
      // easeOutCubic — быстрый старт, мягкая посадка
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [active, target, durationMs, reduced])

  return reduced ? target : value
}
