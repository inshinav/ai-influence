import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Loader2 } from 'lucide-react'
import { useCalmMotion } from '../care/CareContext'

const LINES = ['Анализируем 4 700 анкет…', 'Сверяем расписание…', 'Считаем совместимость…']

export default function MatchingAnimation({ onDone }: { onDone: () => void }) {
  const reduced = useCalmMotion()
  const [visible, setVisible] = useState(reduced ? LINES.length : 1)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  // Таймеры запускаются один раз — onDone в ref, чтобы смена identity их не перезапускала
  useEffect(() => {
    const timers: number[] = []
    if (reduced) {
      timers.push(window.setTimeout(() => doneRef.current(), 600))
    } else {
      timers.push(window.setTimeout(() => setVisible(2), 700))
      timers.push(window.setTimeout(() => setVisible(3), 1400))
      timers.push(window.setTimeout(() => setVisible(4), 2000))
      timers.push(window.setTimeout(() => doneRef.current(), 2100))
    }
    return () => timers.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-44 rounded-full bg-gradient-to-br from-sun via-peach to-sky opacity-50 blur-2xl"
        />
        {reduced ? (
          <div className="relative size-32 rounded-full bg-gradient-to-br from-sun via-peach to-sky" />
        ) : (
          <motion.div
            className="relative size-32 rounded-full bg-gradient-to-br from-sun via-peach to-sky"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <ul className="mt-12 flex flex-col items-start gap-3" aria-live="polite">
        {LINES.slice(0, Math.min(visible, LINES.length)).map((line, i) => {
          const passed = reduced || visible > i + 1
          return (
            <motion.li
              key={line}
              className="flex items-center gap-2.5 text-[15.5px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {passed ? (
                <Check size={17} className="shrink-0 text-ok" aria-hidden />
              ) : (
                <Loader2 size={17} className="shrink-0 animate-spin text-ink-soft" aria-hidden />
              )}
              {line}
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
