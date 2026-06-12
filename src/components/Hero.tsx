import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { TopicId } from '../types'
import { useCalmMotion } from '../care/CareContext'
import { useDawnPhase } from '../lib/dawn'
import { heroChips } from '../data/topics'
import { track } from '../lib/analytics'
import { EASE_SOFT, SPRING, SPRING_SNAPPY, reveal, revealParent } from '../lib/motionPresets'
import { ScribbleArrow, ScribbleUnderline } from './Scribble'
import DawnBackdrop from './DawnBackdrop'

const PHRASES = [
  'как справиться с тревогой',
  'что делать с отношениями',
  'куда уходит энергия',
  'как услышать себя',
  'как пережить перемены',
]

/** Чипы боли: лёгкий blur-pop с плотной пружиной */
const chipPop: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING_SNAPPY },
}

const chipRow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

export default function Hero({ onOpenQuiz }: { onOpenQuiz: (topic?: TopicId) => void }) {
  const calm = useCalmMotion()
  const { palette } = useDawnPhase()
  const [phrase, setPhrase] = useState(0)

  useEffect(() => {
    if (calm) return
    const id = window.setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), 2800)
    return () => window.clearInterval(id)
  }, [calm])

  return (
    <section id="hero" className="relative overflow-hidden">
      <DawnBackdrop />
      <motion.div
        variants={revealParent}
        initial={calm ? false : 'hidden'}
        animate="show"
        className="container-x relative z-10 flex min-h-[92svh] flex-col justify-center pb-24 pt-32"
      >
        <motion.p variants={reveal} className="eyebrow">
          Онлайн-психотерапия · 420{' '}000+ клиентов
        </motion.p>

        <motion.h1
          variants={reveal}
          className="mt-5 text-[clamp(40px,7vw,84px)] leading-[1.05] tracking-[-0.02em]"
        >
          Станет ясно,
          {/* Всегда две строки под ротацию: высота блока не «скачет»,
              когда длинная фраза переносится, а короткая — нет */}
          <span className="block min-h-[2.1em]">
            <span className="relative inline-block max-w-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={phrase}
                  className="block [text-wrap:balance]"
                  initial={{ opacity: 0, y: '0.4em', filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: '-0.4em', filter: 'blur(8px)' }}
                  transition={SPRING}
                >
                  {PHRASES[phrase]}
                </motion.span>
              </AnimatePresence>
              {/* Завиток перерисовывается при каждой смене фразы */}
              <ScribbleUnderline
                replayKey={phrase}
                className="absolute -bottom-[0.06em] left-0"
              />
            </span>
          </span>
        </motion.h1>

        <motion.p variants={reveal} className="mt-6 max-w-xl text-lg text-ink-soft md:text-xl">
          Подберём вашего психолога за 2{' '}минуты. Сначала покажем, кто вам
          подходит,{' '}— регистрация потом.
        </motion.p>

        <motion.div variants={reveal} className="mt-9">
          <p className="text-[13px] font-medium text-ink-soft">С чем хотите разобраться?</p>
          <motion.div variants={chipRow} className="mt-3 flex flex-wrap gap-2.5">
            {heroChips.map((c) => (
              <motion.button
                key={c.id}
                variants={chipPop}
                type="button"
                className="chip"
                onClick={() => {
                  track('chip_click', { topic: c.id })
                  onOpenQuiz(c.id)
                }}
              >
                {c.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={reveal} className="mt-10">
          {/* Рукописный акцент: подпись и стрелочка-росчерк к CTA */}
          <div aria-hidden className="mb-2 flex items-center gap-1.5 pl-2">
            <span className="hand text-[22px] leading-none">подберём за 2 минуты</span>
            <ScribbleArrow delay={700} className="w-12 shrink-0 translate-y-2 rotate-[70deg]" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
          </div>
        </motion.div>

        <motion.p variants={reveal} className="mt-10 text-[13.5px] text-ink-soft">
          4{' '}800 проверенных специалистов · 81% чувствуют результат к{' '}5-й сессии ·
          от{' '}3{' '}150{' '}₽
        </motion.p>

        {/* Строка-настроение фазы суток: min-h резервирует место, днём пусто */}
        <motion.p
          key={palette.heroLine ?? 'silent'}
          initial={calm || !palette.heroLine ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_SOFT }}
          className="mt-3 min-h-[22px] text-[13.5px] text-ink-soft/90"
        >
          {palette.heroLine ?? ''}
        </motion.p>
      </motion.div>
    </section>
  )
}
