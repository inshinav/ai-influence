import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useCalmMotion } from '../care/CareContext'
import { DAWN, useDawnPhase, type DawnPhase } from '../lib/dawn'

type BlobGeometry = {
  className: string
  duration: number
  drift: { x: number[]; y: number[]; scale: number[] }
}

/** Геометрия и дрейф трёх пятен постоянны; цвет приходит из палитры фазы суток */
const BLOBS: BlobGeometry[] = [
  {
    className: 'left-[-10%] top-[-15%] h-[55vw] w-[55vw] opacity-55',
    duration: 24,
    drift: { x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.12, 1] },
  },
  {
    className: 'right-[-12%] top-[-5%] h-[48vw] w-[48vw] opacity-50',
    duration: 30,
    drift: { x: [0, -40, 0], y: [0, 35, 0], scale: [1, 1.1, 1] },
  },
  {
    className: 'left-[25%] top-[30%] h-[42vw] w-[42vw] opacity-45',
    duration: 27,
    drift: { x: [0, 35, 0], y: [0, -30, 0], scale: [1, 1.15, 1] },
  },
]

function blobBackground(color: string): string {
  return `radial-gradient(circle at 50% 50%, ${color}, transparent 65%)`
}

/** Слой из трёх пятен одной фазы. animated=false — статичные финальные состояния */
function BlobLayer({ phase, animated }: { phase: DawnPhase; animated: boolean }) {
  const colors = DAWN[phase].blobs
  return (
    <div aria-hidden className="absolute inset-0">
      {BLOBS.map((b, i) =>
        animated ? (
          <motion.div
            key={i}
            className={`absolute rounded-full will-change-transform ${b.className}`}
            style={{ background: blobBackground(colors[i]), filter: 'blur(100px)' }}
            animate={{ x: b.drift.x, y: b.drift.y, scale: b.drift.scale }}
            transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <div
            key={i}
            className={`absolute rounded-full ${b.className}`}
            style={{ background: blobBackground(colors[i]), filter: 'blur(100px)' }}
          />
        ),
      )}
    </div>
  )
}

/**
 * Adaptive Dawn: анимированный mesh-градиент, температура которого
 * следует за временем суток. Смена фазы — медленный кроссфейд двух слоёв.
 */
export default function DawnBackdrop() {
  const { phase, palette } = useDawnPhase()
  const calmMotion = useCalmMotion()
  const [prevPhase, setPrevPhase] = useState<DawnPhase | null>(null)
  const lastPhaseRef = useRef<DawnPhase>(phase)

  // Смена фазы: старый слой проявляется поверх и медленно гаснет
  useEffect(() => {
    if (lastPhaseRef.current === phase) return
    const previous = lastPhaseRef.current
    lastPhaseRef.current = phase
    if (calmMotion) return // мгновенная смена палитры, без кроссфейда
    const show = window.setTimeout(() => setPrevPhase(previous), 0)
    const hide = window.setTimeout(() => setPrevPhase(null), 4500)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [phase, calmMotion])

  // calm включили посреди кроссфейда — старый слой убираем сразу
  useEffect(() => {
    if (!calmMotion) return
    const id = window.setTimeout(() => setPrevPhase(null), 0)
    return () => window.clearTimeout(id)
  }, [calmMotion])

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Текущая фаза — всегда видима */}
      <BlobLayer phase={phase} animated={!calmMotion} />

      {/* Предыдущая фаза: медленно гаснет поверх текущей */}
      {prevPhase !== null && !calmMotion && (
        <motion.div
          key={prevPhase}
          aria-hidden
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 4, ease: 'linear' }}
        >
          <BlobLayer phase={prevPhase} animated={false} />
        </motion.div>
      )}

      {/* Температурная вуаль фазы — поверх пятен, под зерном */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: palette.veil,
          transition: calmMotion ? undefined : 'background-color 4s linear',
        }}
      />

      <div className="grain absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper" />
    </div>
  )
}
