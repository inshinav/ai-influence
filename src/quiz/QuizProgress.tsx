import { AnimatePresence, motion } from 'motion/react'
import { plural } from '../lib/format'
import { useCalmMotion } from '../care/CareContext'

/**
 * Прогресс + живой счётчик: каждый ответ на глазах сужает круг специалистов.
 * Подбор перестаёт быть чёрным ящиком — видно, что ответы реально работают.
 */
export default function QuizProgress({
  step,
  total,
  matched,
}: {
  step: number
  total: number
  matched?: number
}) {
  const calm = useCalmMotion()

  return (
    <p className="flex items-baseline gap-2 text-[13.5px] font-medium text-ink-soft" aria-live="polite">
      <span className="whitespace-nowrap">
        Шаг {step} из {total}
      </span>
      {matched !== undefined && (
        <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
          {matched === 0 ? (
            '· покажем ближайших'
          ) : (
            <>
              {`· ${plural(matched, ['подходит', 'подходят', 'подходят'])}`}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={matched}
                  className="inline-block font-semibold tabular-nums text-sky-deep"
                  initial={calm ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={calm ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {matched}
                </motion.span>
              </AnimatePresence>
            </>
          )}
        </span>
      )}
    </p>
  )
}
