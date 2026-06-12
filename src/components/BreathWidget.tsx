import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Maximize2 } from 'lucide-react'
import { useCalmMotion } from '../care/CareContext'
import { breathCue } from '../lib/sound'
import { haptic } from '../lib/haptics'
import { track } from '../lib/analytics'
import { NBSP } from '../lib/format'
import { reveal, VIEWPORT_ONCE } from '../lib/motionPresets'
import { ScribbleUnderline } from './Scribble'

const BreathScene = lazy(() => import('../breath/BreathScene'))

const EASE = [0.22, 1, 0.36, 1] as const

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'done'

const PHASE_SECONDS: Record<Exclude<Phase, 'idle' | 'done'>, number> = {
  inhale: 4,
  hold: 4,
  exhale: 6,
}

const PHASE_LABEL: Record<Exclude<Phase, 'idle' | 'done'>, string> = {
  inhale: 'Вдох…',
  hold: 'Держим…',
  exhale: 'Выдох…',
}

/* Честная минута: «60 секунд ясности» — это 4 цикла по 14 с (56 с), а не 28 */
const CYCLE_SECONDS = 14
const TOTAL_CYCLES = 4

const RING_R = 148
const RING_LEN = 2 * Math.PI * RING_R

/**
 * «60 секунд ясности»: сфера света дышит вместе с человеком.
 * Вдох 4 — расширение, задержка 4 — свечение, выдох 6 — отпускание.
 * На время практики экран мягко «фокусируется» на сфере виньеткой.
 */
export default function BreathWidget({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const calm = useCalmMotion()
  const [phase, setPhase] = useState<Phase>('idle')
  const [cycle, setCycle] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [showScene, setShowScene] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  /** Переход в фазу: секунды выставляются в момент перехода, не в эффекте */
  const goPhase = (p: Exclude<Phase, 'idle' | 'done'>) => {
    setSecondsLeft(PHASE_SECONDS[p])
    setPhase(p)
  }

  // Цепочка фаз: вдох 4с → задержка 4с → выдох 6с, два цикла
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return
    const seconds = PHASE_SECONDS[phase]
    breathCue(phase)
    haptic(10)
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000)
    const next = window.setTimeout(() => {
      if (phase === 'inhale') goPhase('hold')
      else if (phase === 'hold') goPhase('exhale')
      else if (cycle + 1 >= TOTAL_CYCLES) {
        track('breath_complete')
        setPhase('done')
      } else {
        setCycle((c) => c + 1)
        goPhase('inhale')
      }
    }, seconds * 1000)
    timers.current.push(next)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(next)
    }
  }, [phase, cycle])

  const start = () => {
    track('breath_start')
    setCycle(0)
    goPhase('inhale')
  }

  const running = phase === 'inhale' || phase === 'hold' || phase === 'exhale'

  /** Прогресс кольца к концу текущей фазы (CSS-transition тянет дугу) */
  const ringProgress = (() => {
    if (!running) return 0
    const passed =
      phase === 'inhale'
        ? PHASE_SECONDS.inhale
        : phase === 'hold'
          ? PHASE_SECONDS.inhale + PHASE_SECONDS.hold
          : CYCLE_SECONDS
    return passed / CYCLE_SECONDS
  })()

  const scale = phase === 'inhale' || phase === 'hold' ? 1.35 : 1
  const scaleDuration = phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0.3

  return (
    <section id="breath" className="relative py-20 md:py-28">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={VIEWPORT_ONCE}>
          {/* На время практики текст уходит в тень — внимание остаётся на сфере */}
          <div
            className={`transition-opacity duration-1000 ${
              running && !calm ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <p className="eyebrow">Попробуйте прямо сейчас</p>
            <h2 className="mt-3 text-4xl md:text-5xl">
              {'60 секунд '}
              <span className="relative inline-block">
                ясности
                <ScribbleUnderline className="absolute inset-x-0 -bottom-1" />
              </span>
              {`${NBSP}— прямо здесь`}
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              {`Минута тишины${NBSP}— уже забота о${NBSP}себе. Медленное дыхание 4–4–6 помогает телу успокоиться, а${NBSP}мыслям${NBSP}— проясниться.`}
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col items-center">
          <div className="relative flex size-[320px] items-center justify-center">
            {/* Кольцо-прогресс цикла */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 320 320" aria-hidden>
              <circle cx="160" cy="160" r={RING_R} fill="none" stroke="var(--mist)" strokeWidth="2" />
              <circle
                cx="160"
                cy="160"
                r={RING_R}
                fill="none"
                stroke="var(--sky)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={RING_LEN}
                strokeDashoffset={RING_LEN * (1 - ringProgress)}
                style={{
                  transition: running
                    ? `stroke-dashoffset ${PHASE_SECONDS[phase as 'inhale' | 'hold' | 'exhale']}s linear`
                    : 'none',
                }}
              />
            </svg>

            {/* Свечение вокруг сферы: на задержке дыхания пульсирует */}
            {!calm && (
              <motion.div
                className="absolute size-[230px] rounded-full bg-sky/40 blur-3xl"
                aria-hidden
                animate={phase === 'hold' ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0.4 }}
                transition={
                  phase === 'hold'
                    ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.5 }
                }
              />
            )}

            {/* Сфера света */}
            <motion.div
              className="relative flex size-[210px] items-center justify-center rounded-full bg-gradient-to-br from-sky via-azure to-white"
              animate={calm ? { scale: 1 } : { scale: phase === 'done' || phase === 'idle' ? 1 : scale }}
              transition={{ duration: calm ? 0 : scaleDuration, ease: 'easeInOut' }}
            >
              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.button
                    key="start"
                    type="button"
                    className="rounded-full bg-white/90 px-7 py-3 font-semibold text-[#16181d] shadow-sm transition-transform hover:scale-105"
                    onClick={start}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Сделать вдох
                  </motion.button>
                )}
                {running && (
                  <motion.div
                    key={phase}
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-lg font-medium text-ink/80">
                      {PHASE_LABEL[phase as 'inhale' | 'hold' | 'exhale']}
                    </p>
                    {calm && <p className="mt-1 text-3xl font-semibold text-ink/70">{secondsLeft}</p>}
                  </motion.div>
                )}
                {phase === 'done' && (
                  <motion.p
                    key="done"
                    className="px-8 text-center text-[15px] font-medium text-ink/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Минута для себя — есть
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {phase === 'idle' && (
            <button
              type="button"
              className="btn-secondary mt-5"
              onClick={() => setShowScene(true)}
            >
              <Maximize2 size={16} aria-hidden />
              Полный экран
            </button>
          )}

          {running && (
            <p className="mt-4 text-[13.5px] text-ink-soft" aria-live="polite">
              Цикл {cycle + 1} из {TOTAL_CYCLES}
            </p>
          )}

          <AnimatePresence>
            {phase === 'done' && (
              <motion.div
                className="mt-6 flex max-w-sm flex-col items-center gap-4 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <p className="text-[16px]">
                  {`Это была минута для${NBSP}себя. Представьте, что даст час с${NBSP}психологом.`}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    track('cta_click', { section: 'breath' })
                    onOpenQuiz()
                  }}
                >
                  Подобрать психолога
                </button>
                <button
                  type="button"
                  className="text-[13.5px] text-ink-soft underline underline-offset-4 hover:text-ink"
                  onClick={() => setPhase('idle')}
                >
                  Повторить
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Фокусировка: мягкая виньетка приглушает края экрана на время практики */}
      <AnimatePresence>
        {running && !calm && (
          <motion.div
            key="focus"
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(70% 70% at 50% 50%, rgba(22,24,29,0) 45%, rgba(22,24,29,0.06) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: EASE }}
          />
        )}
      </AnimatePresence>

      {/* Полноэкранный «Момент тишины» */}
      <AnimatePresence>
        {showScene && (
          <Suspense fallback={null}>
            <BreathScene onClose={() => setShowScene(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </section>
  )
}
