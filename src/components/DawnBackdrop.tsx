import { motion, useReducedMotion } from 'motion/react'

type Blob = {
  className: string
  background: string
  duration: number
  drift: { x: number[]; y: number[]; scale: number[] }
}

const blobs: Blob[] = [
  {
    className: 'left-[-10%] top-[-15%] h-[55vw] w-[55vw] opacity-55',
    background: 'radial-gradient(circle at 50% 50%, rgba(255,200,61,0.85), transparent 65%)',
    duration: 24,
    drift: { x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.12, 1] },
  },
  {
    className: 'right-[-12%] top-[-5%] h-[48vw] w-[48vw] opacity-50',
    background: 'radial-gradient(circle at 50% 50%, rgba(191,217,255,0.9), transparent 65%)',
    duration: 30,
    drift: { x: [0, -40, 0], y: [0, 35, 0], scale: [1, 1.1, 1] },
  },
  {
    className: 'left-[25%] top-[30%] h-[42vw] w-[42vw] opacity-45',
    background: 'radial-gradient(circle at 50% 50%, rgba(255,179,155,0.8), transparent 65%)',
    duration: 27,
    drift: { x: [0, 35, 0], y: [0, -30, 0], scale: [1, 1.15, 1] },
  },
]

/** Анимированный mesh-градиент рассвета — фирменный фон hero */
export default function DawnBackdrop() {
  const reduced = useReducedMotion()

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {blobs.map((b, i) =>
        reduced ? (
          <div
            key={i}
            className={`absolute rounded-full ${b.className}`}
            style={{ background: b.background, filter: 'blur(100px)' }}
          />
        ) : (
          <motion.div
            key={i}
            className={`absolute rounded-full will-change-transform ${b.className}`}
            style={{ background: b.background, filter: 'blur(100px)' }}
            animate={{ x: b.drift.x, y: b.drift.y, scale: b.drift.scale }}
            transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ),
      )}
      <div className="grain absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper" />
    </div>
  )
}
