import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { TopicId } from '../types'
import { useCalmMotion } from '../care/CareContext'
import { useDawnPhase } from '../lib/dawn'
import { heroChips } from '../data/topics'
import { track } from '../lib/analytics'
import DawnBackdrop from './DawnBackdrop'

const PHRASES = [
  'как справиться с тревогой',
  'что делать с отношениями',
  'куда уходит энергия',
  'как услышать себя',
  'как пережить перемены',
]

const EASE = [0.22, 1, 0.36, 1] as const

export default function Hero({ onOpenQuiz }: { onOpenQuiz: (topic?: TopicId) => void }) {
  const calm = useCalmMotion()
  const { palette } = useDawnPhase()
  const [phrase, setPhrase] = useState(0)

  useEffect(() => {
    if (calm) return
    const id = window.setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), 2800)
    return () => window.clearInterval(id)
  }, [calm])

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  })

  return (
    <section id="hero" className="relative overflow-hidden">
      <DawnBackdrop />
      <div className="container-x relative z-10 flex min-h-[92svh] flex-col justify-center pb-24 pt-32">
        <motion.p {...reveal(0)} className="eyebrow">
          Онлайн-психотерапия · 420{' '}000+ клиентов
        </motion.p>

        <motion.h1
          {...reveal(0.06)}
          className="mt-5 text-[clamp(40px,7vw,84px)] leading-[1.05] tracking-[-0.02em]"
        >
          Станет ясно,
          <span className="block min-h-[2.1em] overflow-hidden sm:min-h-[1.05em]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={phrase}
                className="block"
                initial={{ y: '0.6em', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-0.6em', opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {PHRASES[phrase]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p {...reveal(0.12)} className="mt-6 max-w-xl text-lg text-ink-soft md:text-xl">
          Подберём психолога под ваш запрос за 2{' '}минуты. Сначала покажем, кто вам
          подходит,{' '}— регистрация потом.
        </motion.p>

        <motion.div {...reveal(0.18)} className="mt-9">
          <p className="text-[13px] font-medium text-ink-soft">С чем хотите разобраться?</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {heroChips.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                onClick={() => {
                  track('chip_click', { topic: c.id })
                  onOpenQuiz(c.id)
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div {...reveal(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              track('cta_click', { section: 'hero' })
              onOpenQuiz()
            }}
          >
            Подобрать психолога{' '}— 2{' '}минуты
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              track('cta_click', { section: 'hero_secondary' })
              document.getElementById('therapists')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Посмотреть психологов
          </button>
        </motion.div>

        <motion.p {...reveal(0.3)} className="mt-10 text-[13.5px] text-ink-soft">
          4{' '}700 проверенных специалистов · 81% чувствуют результат к{' '}5-й сессии ·
          от{' '}3{' '}150{' '}₽
        </motion.p>

        {/* Строка-настроение фазы суток: min-h резервирует место, днём пусто */}
        <motion.p
          key={palette.heroLine ?? 'silent'}
          initial={calm || !palette.heroLine ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-3 min-h-[22px] text-[13.5px] text-ink-soft/90"
        >
          {palette.heroLine ?? ''}
        </motion.p>
      </div>
    </section>
  )
}
