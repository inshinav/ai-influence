import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { useCalmMotion } from '../care/CareContext'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Строка-отражение: мягкая реплика сервиса в ответ на ответ человека.
 * Появляется после выбора и держится дыхательную паузу (~1,6 с) —
 * таймингом управляет родитель, здесь только проявление.
 */
export default function Reflection({ text }: { text: string }) {
  const calm = useCalmMotion()

  return (
    <motion.p
      aria-live="polite"
      initial={{ opacity: 0, y: calm ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: calm ? 0 : -6 }}
      transition={{ duration: calm ? 0 : 0.45, ease: EASE }}
      className="flex items-start gap-2.5"
    >
      <Sparkles className="mt-1 h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
      <span className="text-[15px] leading-relaxed text-ink-soft">{text}</span>
    </motion.p>
  )
}
