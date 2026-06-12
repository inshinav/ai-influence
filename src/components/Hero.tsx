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
  const { palette, phase } = useDawnPhase()
  const [phrase, setPhrase] = useState(0)

  // Ротация даёт дочитать (5,6 с) и останавливается после двух кругов
  // на первой — самой сильной — фразе: заголовок перестаёт отвлекать от решения
  useEffect(() => {
    if (calm) return
    let ticks = 0
    const id = window.setInterval(() => {
      ticks += 1
      setPhrase(ticks % PHRASES.length)
      if (ticks >= PHRASES.length * 2) window.clearInterval(id)
    }, 5600)
    return () => window.clearInterval(id)
  }, [calm])

  /** Ночью строка-настроение становится действием — мостом к минуте тишины */
  const nightLine = (phase === 'night' || phase === 'predawn') && palette.heroLine

  return (
    <section id="hero" className="relative overflow-hidden">
      <DawnBackdrop />
      <motion.div
        variants={revealParent}
        initial={calm ? false : 'hidden'}
        animate="show"
        className="container-x relative z-10 flex min-h-[92svh] flex-col justify-center pb-24 pt-24 md:pt-32"
      >
        <motion.p variants={reveal} className="eyebrow">
          Онлайн-психотерапия · 420{' '}000+ клиентов
        </motion.p>

        <motion.h1
          variants={reveal}
          className="mt-5 text-[clamp(40px,7vw,84px)] leading-[1.05]"
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
          подходит,{' '}— <span className="font-semibold text-ink">регистрация потом</span>.
        </motion.p>

        {/* Решение — первым: CTA выше чипов, со снятием обязательств у кнопки */}
        <motion.div variants={reveal} className="mt-7 md:mt-8" id="hero-cta">
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
          <p className="mt-2.5 text-[13px] text-ink-soft">
            Бесплатно · без{' '}регистрации · ни{' '}к{' '}чему не{' '}обязывает
          </p>
        </motion.div>

        {/* Эмоциональный вход «это про меня» — после решения, не вместо него */}
        <motion.div variants={reveal} className="mt-8">
          <div aria-hidden className="flex items-center gap-1.5">
            <span className="hand text-[21px] leading-none">или начните с того, что откликается</span>
            <ScribbleArrow delay={700} className="w-10 shrink-0 translate-y-1.5 rotate-[70deg]" />
          </div>
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

        <motion.p variants={reveal} className="mt-9 text-[13.5px] text-ink-soft">
          4{' '}800 проверенных специалистов · от{' '}3{' '}150{' '}₽ ·
          не{' '}подойдёт{' '}— бесплатно заменим
        </motion.p>

        {/* Строка-настроение фазы суток; ночью — действие, мост к минуте тишины */}
        {nightLine ? (
          <motion.button
            key={palette.heroLine}
            type="button"
            initial={calm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_SOFT }}
            className="mt-3 min-h-[22px] w-fit text-left text-[13.5px] text-sky underline decoration-dotted underline-offset-4 transition-colors hover:text-azure"
            onClick={() => {
              track('cta_click', { section: 'hero_night_line' })
              document.getElementById('breath')?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' })
            }}
          >
            {`${palette.heroLine} Попробуйте минуту тишины →`}
          </motion.button>
        ) : (
          <motion.p
            key={palette.heroLine ?? 'silent'}
            initial={calm || !palette.heroLine ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_SOFT }}
            className="mt-3 min-h-[22px] text-[13.5px] text-ink-soft/90"
          >
            {palette.heroLine ?? ''}
          </motion.p>
        )}
      </motion.div>
    </section>
  )
}
