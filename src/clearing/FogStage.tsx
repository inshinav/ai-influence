import type { ReactNode } from 'react'
import { clarityVars } from '../lib/clarity'

/**
 * Сцена «расчистки»: relative-контейнер с --clarity и слоем тумана поверх.
 * Туман (.fog-veil из index.css) рассеивается по мере роста clarity 0 → 1.
 * При calmMotion переход глушится CSS-ом сам — туман просто оказывается
 * в финальном состоянии, функциональность не зависит от анимации.
 */
export default function FogStage({
  clarity,
  className,
  children,
}: {
  clarity: number
  className?: string
  children: ReactNode
}) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')} style={clarityVars(clarity)}>
      {children}
      <div className="fog-veil" style={{ borderRadius: 'inherit' }} aria-hidden="true" />
    </div>
  )
}
