import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useCalmMotion } from '../care/CareContext'

/**
 * Фирменный рукописный элемент Ясно: синяя линия-завиток, нарисованная
 * одним росчерком. При появлении прорисовывается слева направо
 * (stroke-dashoffset), будто кто-то пишет от руки.
 */

type StrokeProps = {
  /** Перезапуск прорисовки при смене значения (например, ротация фраз) */
  replayKey?: string | number
  /** Задержка старта прорисовки, мс */
  delay?: number
  className?: string
}

function useDrawn(replayKey: StrokeProps['replayKey'], delay: number) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: false, margin: '-40px' })
  const calm = useCalmMotion()
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (calm) {
      const id = window.setTimeout(() => setDrawn(true), 0)
      return () => window.clearTimeout(id)
    }
    // Сброс и прорисовка — оба отложены, чтобы не дёргать состояние в эффекте
    const reset = window.setTimeout(() => setDrawn(false), 0)
    const draw = window.setTimeout(() => setDrawn(true), delay + 40)
    return () => {
      window.clearTimeout(reset)
      window.clearTimeout(draw)
    }
  }, [inView, calm, delay, replayKey])

  return { ref, drawn, calm }
}

const strokeStyle = (drawn: boolean, calm: boolean, duration: number) => ({
  strokeDasharray: 1,
  strokeDashoffset: drawn ? 0 : 1,
  transition: calm ? 'none' : `stroke-dashoffset ${duration}s cubic-bezier(0.45, 0, 0.2, 1)`,
})

/** Подчёркивание-завиток под ключевым словом: лёгкая волна с росчерком */
export function ScribbleUnderline({ replayKey, delay = 250, className = '' }: StrokeProps) {
  const { ref, drawn, calm } = useDrawn(replayKey, delay)
  return (
    <svg
      ref={ref}
      viewBox="0 0 220 14"
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
      className={`pointer-events-none block h-[0.18em] w-full ${className}`}
    >
      <path
        d="M4 9.5C40 4.5 76 4 110 6.5c30 2.2 56 3.5 82-1.5 8-1.5 16-2.5 20-2"
        stroke="var(--sky)"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
        style={strokeStyle(drawn, calm, 0.7)}
      />
    </svg>
  )
}

/** Рукописная стрелка-связка между блоками (вниз-вправо с петлёй) */
export function ScribbleArrow({ replayKey, delay = 150, className = '' }: StrokeProps) {
  const { ref, drawn, calm } = useDrawn(replayKey, delay)
  return (
    <svg
      ref={ref}
      viewBox="0 0 90 56"
      fill="none"
      aria-hidden
      className={`pointer-events-none ${className}`}
    >
      <path
        d="M6 8c22 3 38 10 44 22 4 8 2 14-4 16-5 2-10-2-8-8 3-9 18-14 32-12 6 1 10 3 13 6m0 0-9-2m9 2-4 8"
        stroke="var(--sky)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={strokeStyle(drawn, calm, 0.9)}
      />
    </svg>
  )
}

/** Маленький росчерк-звёздочка (фирменная «искра» возле акцентов) */
export function ScribbleSpark({ replayKey, delay = 100, className = '' }: StrokeProps) {
  const { ref, drawn, calm } = useDrawn(replayKey, delay)
  return (
    <svg ref={ref} viewBox="0 0 28 28" fill="none" aria-hidden className={`pointer-events-none ${className}`}>
      <path
        d="M14 3v8M14 17v8M3 14h8M17 14h8"
        stroke="var(--sky)"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        style={strokeStyle(drawn, calm, 0.5)}
      />
    </svg>
  )
}
