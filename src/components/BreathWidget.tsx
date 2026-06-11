import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Maximize2 } from 'lucide-react'
import { useCalmMotion } from '../care/CareContext'
import { breathCue } from '../lib/sound'
import { haptic } from '../lib/haptics'
import { track } from '../lib/analytics'
import BreathScene from '../breath/BreathScene'

const EASE = [0.22, 1, 0.36, 1] as const

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'done'

const PHASE_SECONDS: Record<Exclude<Phase, 'idle' | 'done'>, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
}

const PHASE_LABEL: Record<Exclude<Phase, 'idle' | 'done'>, string> = {
  inhale: 'Вдох…',
  hold: 'Держим…',
  exhale: 'Выдох…',
}

const CYCLE_SECONDS = 19
const TOTAL_CYCLES = 2

const RING_R = 148
const RING_LEN = 2 * Math.PI * RING_R

export default function BreathWidget({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const calm = useCalmMotion()
  const [phase, setPhase] = useState<Phase>('idle')
  const [cycle, setCycle] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [showScene, setShowScene] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  // Цепочка фаз: вдох 4с → задержка 7с → выдох 8с, два цикла
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return
    const seconds = PHASE_SECONDS[phase]
    setSecondsLeft(seconds)
    breathCue(phase)
    haptic(10)
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000)
    const next = window.setTimeout(() => {
      if (phase === 'inhale') setPhase('hold')
      else if (phase === 'hold') setPhase('exhale')
      else if (cycle + 1 >= TOTAL_CYCLES) {
        track('breath_complete')
        setPhase('done')
      } else {
        setCycle((c) => c + 1)
        setPhase('inhale')
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
    setPhase('inhale')
  }

  const running = phase === 'inhale' || phase === 'hold' || phase === 'exhale'

  /** Прогресс кольца к концу текущей фазы (CSS-transition тянет дугу) */
  const ringProgress = (() => {
    if (!running) return 0
    const passed =
      phase === 'inhale' ? PHASE_SECONDS.inhale : phase === 'hold' ? 11 : CYCLE_SECONDS
    return passed / CYCLE_SECONDS
  })()

  const scale = phase === 'inhale' || phase === 'hold' ? 1.35 : 1
  const scaleDuration = phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.3

  return (
    <section id="breath" className="py-20 md:py-28">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="eyebrow">Попробуйте прямо сейчас</p>
          <h2 className="mt-3 text-4xl md:text-5xl">{'60 секунд спокойствия — прямо здесь'}</h2>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            {'Забота о себе начинается с малого. Это упражнение психологи дают на первых сессиях при тревоге: медленное дыхание 4–7–8 помогает телу выйти из режима «бей или беги» — прямо сейчас, без подготовки.'}
          </p>
        </div>

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
                stroke="var(--sun-deep)"
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

            {/* Свечение при задержке дыхания */}
            {!calm && (
              <motion.div
                className="absolute size-[230px] rounded-full bg-gradient-to-br from-sun/50 via-peach/50 to-sky/50 blur-2xl"
                animate={phase === 'hold' ? { opacity: [0.4, 0.85, 0.4] } : { opacity: 0.35 }}
                transition={phase === 'hold' ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.5 }}
              />
            )}

            {/* Круг */}
            <motion.div
              className="relative flex size-[210px] items-center justify-center rounded-full bg-gradient-to-br from-sun/70 via-peach/70 to-sky/70"
              animate={calm ? { scale: 1 } : { scale: phase === 'done' || phase === 'idle' ? 1 : scale }}
              transition={{ duration: calm ? 0 : scaleDuration, ease: 'easeInOut' }}
            >
              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.button
                    key="start"
                    type="button"
                    className="rounded-full bg-white/90 px-7 py-3 font-semibold shadow-sm transition-transform hover:scale-105"
                    onClick={start}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Начать
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
                  {'Это была 1 минута для себя. Представьте, что даст 50 минут с психологом.'}
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

      {/* Полноэкранный «Момент тишины» */}
      <AnimatePresence>
        {showScene && <BreathScene onClose={() => setShowScene(false)} />}
      </AnimatePresence>
    </section>
  )
}
