import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useCalmMotion } from '../care/CareContext'
import { DAWN, useDawnPhase, type DawnPhase } from '../lib/dawn'

type BlobGeometry = {
  className: string
  duration: number
  drift: { x: number[]; y: number[]; scale: number[] }
  /** Коэффициент курсор-параллакса: «ближние» пятна откликаются сильнее */
  parallax: number
}

/** Геометрия и дрейф трёх пятен постоянны; цвет приходит из палитры фазы суток */
const BLOBS: BlobGeometry[] = [
  {
    className: 'left-[-10%] top-[-15%] h-[55vw] w-[55vw] opacity-55',
    duration: 24,
    drift: { x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.12, 1] },
    parallax: 0.04,
  },
  {
    className: 'right-[-12%] top-[-5%] h-[48vw] w-[48vw] opacity-50',
    duration: 30,
    drift: { x: [0, -40, 0], y: [0, 35, 0], scale: [1, 1.1, 1] },
    parallax: 0.022,
  },
  {
    className: 'left-[25%] top-[30%] h-[42vw] w-[42vw] opacity-45',
    duration: 27,
    drift: { x: [0, 35, 0], y: [0, -30, 0], scale: [1, 1.15, 1] },
    parallax: 0.032,
  },
]

/** Пружина параллакса: медленное «инертное» следование за курсором */
const PARALLAX_SPRING = { stiffness: 50, damping: 20 }

function blobBackground(color: string): string {
  return `radial-gradient(circle at 50% 50%, ${color}, transparent 65%)`
}

/**
 * Одно пятно: внешний слой — параллакс за курсором (useSpring),
 * внутренний — медленное дыхание-дрейф. calm отвязывает параллакс полностью.
 */
function ParallaxBlob({
  geometry,
  color,
  animated,
  calm,
  mx,
  my,
}: {
  geometry: BlobGeometry
  color: string
  animated: boolean
  calm: boolean
  mx: MotionValue<number>
  my: MotionValue<number>
}) {
  const px = useSpring(
    useTransform(mx, (v) => v * geometry.parallax),
    PARALLAX_SPRING,
  )
  const py = useSpring(
    useTransform(my, (v) => v * geometry.parallax),
    PARALLAX_SPRING,
  )

  return (
    <motion.div
      className={`absolute will-change-transform ${geometry.className}`}
      style={calm ? undefined : { x: px, y: py }}
    >
      {animated ? (
        <motion.div
          className="h-full w-full rounded-full will-change-transform"
          style={{ background: blobBackground(color), filter: 'blur(100px)' }}
          animate={{ x: geometry.drift.x, y: geometry.drift.y, scale: geometry.drift.scale }}
          transition={{ duration: geometry.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <div
          className="h-full w-full rounded-full"
          style={{ background: blobBackground(color), filter: 'blur(100px)' }}
        />
      )}
    </motion.div>
  )
}

/** Слой из трёх пятен одной фазы. animated=false — статичные финальные состояния */
function BlobLayer({
  phase,
  animated,
  calm,
  mx,
  my,
}: {
  phase: DawnPhase
  animated: boolean
  calm: boolean
  mx: MotionValue<number>
  my: MotionValue<number>
}) {
  const colors = DAWN[phase].blobs
  return (
    <div aria-hidden className="absolute inset-0">
      {BLOBS.map((b, i) => (
        <ParallaxBlob
          key={i}
          geometry={b}
          color={colors[i]}
          animated={animated}
          calm={calm}
          mx={mx}
          my={my}
        />
      ))}
    </div>
  )
}

type DustMote = {
  left: string
  top: string
  /** px, 3–6 */
  size: number
  /** Длительность цикла, с (16–30) */
  duration: number
  /** Сдвиг старта цикла, с — рассинхронизация пылинок */
  delay: number
  /** Подъём за цикл, px (30–60) */
  rise: number
  /** Лёгкий боковой снос, px */
  sway: number
  tone: 'white' | 'azure'
}

/** «Пыль в солнечном луче»: 16 детерминированных пылинок, никакого рандома в рендере */
const DUST: DustMote[] = [
  { left: '8%', top: '22%', size: 4, duration: 21, delay: 0, rise: 44, sway: 10, tone: 'white' },
  { left: '14%', top: '58%', size: 3, duration: 26, delay: 2.4, rise: 56, sway: -8, tone: 'azure' },
  { left: '21%', top: '34%', size: 5, duration: 18, delay: 1.1, rise: 38, sway: 12, tone: 'white' },
  { left: '27%', top: '72%', size: 3, duration: 29, delay: 4.2, rise: 60, sway: -10, tone: 'white' },
  { left: '33%', top: '18%', size: 4, duration: 23, delay: 0.8, rise: 48, sway: 8, tone: 'azure' },
  { left: '39%', top: '52%', size: 6, duration: 17, delay: 3, rise: 34, sway: 14, tone: 'white' },
  { left: '46%', top: '28%', size: 3, duration: 27, delay: 1.8, rise: 52, sway: -12, tone: 'white' },
  { left: '52%', top: '66%', size: 4, duration: 20, delay: 5, rise: 42, sway: 9, tone: 'azure' },
  { left: '58%', top: '14%', size: 5, duration: 25, delay: 2, rise: 50, sway: -9, tone: 'white' },
  { left: '64%', top: '46%', size: 3, duration: 30, delay: 0.4, rise: 58, sway: 11, tone: 'white' },
  { left: '70%', top: '76%', size: 4, duration: 19, delay: 3.6, rise: 36, sway: -14, tone: 'azure' },
  { left: '76%', top: '30%', size: 6, duration: 22, delay: 1.4, rise: 46, sway: 10, tone: 'white' },
  { left: '82%', top: '60%', size: 3, duration: 28, delay: 4.6, rise: 54, sway: -8, tone: 'white' },
  { left: '88%', top: '24%', size: 4, duration: 16, delay: 2.8, rise: 32, sway: 12, tone: 'azure' },
  { left: '93%', top: '48%', size: 3, duration: 24, delay: 0.6, rise: 49, sway: -11, tone: 'white' },
  { left: '47%', top: '84%', size: 5, duration: 26, delay: 3.2, rise: 57, sway: 8, tone: 'white' },
]

/** Слой пылинок: медленный дрейф вверх с пульсом прозрачности; calm — статика */
function DustLayer({ calm }: { calm: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0">
      {DUST.map((d, i) => {
        const className = `absolute rounded-full blur-[1px] ${
          d.tone === 'azure' ? 'bg-azure/40' : 'bg-white/60'
        }`
        const position = { left: d.left, top: d.top, width: d.size, height: d.size }
        return calm ? (
          <div key={i} className={className} style={{ ...position, opacity: 0.3 }} />
        ) : (
          <motion.div
            key={i}
            className={className}
            style={{ ...position, opacity: 0.2 }}
            animate={{ y: [0, -d.rise, 0], x: [0, d.sway, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        )
      })}
    </div>
  )
}

/**
 * Adaptive Dawn: анимированный mesh-градиент, температура которого
 * следует за временем суток. Смена фазы — медленный кроссфейд двух слоёв.
 * Поверх — курсор-параллакс пятен (только pointer: fine) и пыль в луче света.
 */
export default function DawnBackdrop() {
  const { phase, palette } = useDawnPhase()
  const calmMotion = useCalmMotion()
  const [prevPhase, setPrevPhase] = useState<DawnPhase | null>(null)
  const lastPhaseRef = useRef<DawnPhase>(phase)

  // Курсор-параллакс: сырые смещения от центра окна; пружины — в каждом пятне
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  useEffect(() => {
    if (calmMotion) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX - window.innerWidth / 2)
      my.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      mx.jump(0)
      my.jump(0)
    }
  }, [calmMotion, mx, my])

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
      <BlobLayer phase={phase} animated={!calmMotion} calm={calmMotion} mx={mx} my={my} />

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
          <BlobLayer phase={prevPhase} animated={false} calm={calmMotion} mx={mx} my={my} />
        </motion.div>
      )}

      {/* Пыль в солнечном луче — между пятнами и вуалью */}
      <DustLayer calm={calmMotion} />

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
