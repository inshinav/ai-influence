import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Loader2 } from 'lucide-react'
import type { QuizAnswers, TimePref } from '../types'
import { topicById } from '../data/topics'
import { useCalmMotion } from '../care/CareContext'

const TIME_LABEL: Record<TimePref, string> = {
  morning: 'по утрам',
  day: 'днём',
  evening: 'по вечерам',
  weekend: 'в выходные',
}

/**
 * Кульминация подбора цитирует ответы человека — видно, что секунды
 * ожидания тратятся именно на его запрос, а не на анимацию для всех.
 */
function buildLines(answers: QuizAnswers): string[] {
  const topic = answers.topics[0]
  const time = answers.schedule[0]
  return [
    'Читаем ваши ответы…',
    topic
      ? topic === 'unknown'
        ? 'Ищем тех, кто умеет работать с «просто тяжело»…'
        : `Ищем тех, кто работает с ${topicById(topic).withLabel}…`
      : 'Сверяем ваш запрос с анкетами специалистов…',
    time ? `Оставляем свободных ${TIME_LABEL[time]}…` : 'Сверяем расписание…',
  ]
}

export default function MatchingAnimation({
  answers,
  onDone,
}: {
  answers: QuizAnswers
  onDone: () => void
}) {
  const reduced = useCalmMotion()
  const [lines] = useState(() => buildLines(answers))
  const [visible, setVisible] = useState(reduced ? 3 : 1)
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
          className="absolute size-44 rounded-full bg-sky/40 blur-2xl"
        />
        {reduced ? (
          <div className="relative size-32 rounded-full bg-gradient-to-br from-sky via-azure to-white" />
        ) : (
          <motion.div
            className="relative size-32 rounded-full bg-gradient-to-br from-sky via-azure to-white"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <ul className="mt-12 flex flex-col items-start gap-3" aria-live="polite">
        {lines.slice(0, Math.min(visible, lines.length)).map((line, i) => {
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
