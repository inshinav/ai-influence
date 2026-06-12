import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { clarityVars } from '../lib/clarity'
import { useCalmMotion } from '../care/CareContext'

/**
 * «Запотевшее окно»: декоративная сцена рядом с вопросами. Туман живёт
 * ЗДЕСЬ, а не на вопросах — каждый ответ протирает стекло и проявляет небо.
 * Видимый прогресс + награда: на финале в чистом окне «вспыхивает» солнце.
 */
export default function ClearWindow({
  clarity,
  done,
  className = '',
}: {
  clarity: number
  done: boolean
  className?: string
}) {
  const calm = useCalmMotion()

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{ ...clarityVars(clarity), '--mist': '#f4f7fa', '--paper': '#ffffff' } as CSSProperties}
    >
      {/* Небо за стеклом */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky via-azure to-white" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/4"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 100%, rgba(255,217,168,0.45), transparent 70%)',
        }}
      />

      {/* Солнце — награда, которая проявляется; на финале мягко вспыхивает */}
      <motion.div
        className="absolute left-1/2 top-[34%] size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_36px_14px_rgba(255,255,255,0.75)] md:size-16"
        animate={done && !calm ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Лёгкие облачка в сцене */}
      <div className="absolute left-[12%] top-[55%] h-4 w-16 rounded-full bg-white/70 blur-[2px]" />
      <div className="absolute right-[10%] top-[22%] h-3 w-12 rounded-full bg-white/60 blur-[2px]" />

      {/* Запотевшее стекло: рассеивается с каждым ответом */}
      <div className="fog-veil" />

      {/* Подписи от руки: что это и зачем */}
      {!done && clarity < 0.35 && (
        <p className="hand absolute inset-x-2 top-3 z-10 text-center text-[19px] leading-tight">
          каждый ответ
          <br />
          протирает стекло
        </p>
      )}
      {done && (
        <motion.p
          className="hand absolute inset-x-2 bottom-3 z-10 text-center text-[21px]"
          initial={calm ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          стало яснее
        </motion.p>
      )}
    </div>
  )
}
