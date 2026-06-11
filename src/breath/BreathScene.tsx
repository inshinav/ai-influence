import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Volume2, VolumeX, X } from 'lucide-react'
import { useCare } from '../care/CareContext'
import { breathCue } from '../lib/sound'
import { haptic } from '../lib/haptics'
import { track } from '../lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

type ScenePhase = 'inhale' | 'hold' | 'exhale' | 'paused'
type ActivePhase = Exclude<ScenePhase, 'paused'>

const PHASE_SECONDS: Record<ActivePhase, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
}

const PHASE_LABEL: Record<ActivePhase, string> = {
  inhale: 'Вдох…',
  hold: 'Держим…',
  exhale: 'Выдох…',
}

/** Концентрические кольца: расходятся на вдохе, сходятся на выдохе */
const RINGS = [
  { size: 300, scaleOut: 1.22 },
  { size: 372, scaleOut: 1.32 },
  { size: 444, scaleOut: 1.42 },
]

/** Генеративные «споры»: мягкие blur-круги, медленно дрейфующие вокруг центра */
const SPORES = [
  { size: 20, left: '22%', top: '28%', dx: 34, dy: 26, dur: 15, delay: 0, cls: 'bg-sun/40' },
  { size: 14, left: '72%', top: '20%', dx: -28, dy: 22, dur: 18, delay: 1.4, cls: 'bg-peach/45' },
  { size: 26, left: '80%', top: '62%', dx: -38, dy: -30, dur: 20, delay: 0.6, cls: 'bg-sky/50' },
  { size: 16, left: '14%', top: '64%', dx: 30, dy: -24, dur: 13, delay: 2.2, cls: 'bg-sky/45' },
  { size: 22, left: '38%', top: '12%', dx: 26, dy: 20, dur: 17, delay: 1, cls: 'bg-peach/35' },
  { size: 12, left: '60%', top: '82%', dx: -24, dy: -20, dur: 12, delay: 0.3, cls: 'bg-sun/35' },
  { size: 18, left: '88%', top: '38%', dx: -32, dy: 26, dur: 19, delay: 1.8, cls: 'bg-sun-deep/25' },
]

/**
 * «Момент тишины»: полноэкранная практика дыхания 4-7-8.
 * Циклы бесконечны — пока человек сам не решит выйти (Esc, крестик, клик по фону).
 * Скрытая вкладка ставит практику на паузу: таймеры снимаются, CPU свободен.
 */
export default function BreathScene({ onClose }: { onClose: () => void }) {
  const { settings, setSetting, calmMotion } = useCare()
  const [phase, setPhase] = useState<ScenePhase>('inhale')
  const [cycle, setCycle] = useState(1)
  const [secondsLeft, setSecondsLeft] = useState(PHASE_SECONDS.inhale)
  const dialogRef = useRef<HTMLDivElement>(null)
  const cycleRef = useRef(1)

  useEffect(() => {
    cycleRef.current = cycle
  }, [cycle])

  // Открытие: аналитика, блокировка скролла страницы, фокус в диалог
  useEffect(() => {
    track('breath_fullscreen_open')
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      track('breath_fullscreen_close', { cycles: cycleRef.current - 1 })
    }
  }, [])

  // Esc — выход одним нажатием
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Вкладка скрыта → пауза: эффект фаз снимает таймеры, фон не ест CPU
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPhase('paused')
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Машина фаз: вдох 4с → задержка 7с → выдох 8с, циклы без ограничения
  useEffect(() => {
    if (phase === 'paused') return
    const seconds = PHASE_SECONDS[phase]
    setSecondsLeft(seconds)
    breathCue(phase)
    haptic(10)
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000)
    const next = window.setTimeout(() => {
      if (phase === 'inhale') setPhase('hold')
      else if (phase === 'hold') setPhase('exhale')
      else {
        setCycle((c) => c + 1)
        setPhase('inhale')
      }
    }, seconds * 1000)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(next)
    }
  }, [phase])

  const resume = () => setPhase('inhale')

  const paused = phase === 'paused'
  const expanded = phase === 'inhale' || phase === 'hold'
  const phaseDuration =
    phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : phase === 'hold' ? 0.3 : 0.6

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Момент тишины — дыхание 4–7–8"
      tabIndex={-1}
      className="fixed inset-0 z-[70] overflow-hidden outline-none"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: calmMotion ? 0 : 0.45, ease: EASE }}
    >
      {/* Фон: мягкий рассветный градиент от бумаги к небу */}
      <div className="absolute inset-0 bg-paper" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-sky/20 via-transparent to-peach/10" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(58%_42%_at_50%_70%,rgba(255,200,61,0.12),transparent_72%)]"
        aria-hidden
      />

      {/* Споры — только когда движение разрешено */}
      {!calmMotion && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {SPORES.map((s, i) => (
            <motion.span
              key={i}
              className={`absolute rounded-full blur-md ${s.cls}`}
              style={{ width: s.size, height: s.size, left: s.left, top: s.top }}
              animate={{ x: [0, s.dx, 0, -s.dx, 0], y: [0, -s.dy, 0, s.dy, 0] }}
              transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
            />
          ))}
        </div>
      )}

      {/* Верхняя панель: звук слева, выход справа */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5 md:p-7">
        <button
          type="button"
          aria-pressed={settings.sound}
          onClick={(e) => {
            e.stopPropagation()
            setSetting('sound', !settings.sound)
          }}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm font-medium text-ink-soft backdrop-blur-sm transition-colors hover:bg-mist hover:text-ink"
        >
          {settings.sound ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
          Звук
        </button>
        {!calmMotion && (
          <p className="eyebrow hidden sm:block" aria-hidden>
            Момент тишины
          </p>
        )}
        <button
          type="button"
          aria-label="Выйти из режима тишины"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="rounded-full p-3 text-ink-soft transition-colors hover:bg-mist hover:text-ink"
        >
          <X size={28} aria-hidden />
        </button>
      </div>

      {/* Центр сцены */}
      <div className="relative z-[5] flex h-full flex-col items-center justify-center px-5">
        <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          {calmMotion ? (
            /* Спокойный режим: крупный текстовый гайд без движения */
            <div className="max-w-xl text-center">
              <p className="eyebrow">Момент тишины</p>
              <p className="mt-4 font-display text-2xl leading-snug md:text-3xl">
                {'Вдох — 4 · Держим — 7 · Выдох — 8'}
              </p>
              {phase === 'paused' ? (
                <>
                  <p className="mt-8 text-lg text-ink-soft">
                    {'Пауза — вернитесь, когда будете готовы'}
                  </p>
                  <button type="button" className="btn-secondary mt-6" onClick={resume}>
                    Продолжить
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-8 text-lg text-ink-soft" aria-live="polite">
                    {PHASE_LABEL[phase]}
                  </p>
                  <p className="mt-2 font-display text-7xl text-ink/80 tabular-nums" aria-hidden>
                    {secondsLeft}
                  </p>
                  <p className="mt-6 text-[13.5px] text-ink-soft">цикл {cycle}</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="relative flex size-[300px] items-center justify-center md:size-[340px]">
                {/* Кольца: расходятся на вдохе, сходятся на выдохе */}
                {RINGS.map((r, i) => (
                  <motion.div
                    key={r.size}
                    className="absolute rounded-full border border-ink/10"
                    style={{ width: r.size, height: r.size }}
                    aria-hidden
                    animate={{
                      scale: paused ? 1 : expanded ? r.scaleOut : 1,
                      opacity: paused ? 0.35 : expanded ? 0.3 : 0.55,
                    }}
                    transition={{ duration: phaseDuration, ease: 'easeInOut', delay: i * 0.18 }}
                  />
                ))}

                {/* Свечение при задержке дыхания */}
                <motion.div
                  className="absolute size-[260px] rounded-full bg-gradient-to-br from-sun/45 via-peach/45 to-sky/45 blur-3xl"
                  aria-hidden
                  animate={phase === 'hold' ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0.35 }}
                  transition={
                    phase === 'hold'
                      ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.6 }
                  }
                />

                {/* Дышащий круг */}
                <motion.div
                  className="relative flex size-[240px] items-center justify-center rounded-full bg-gradient-to-br from-sun/70 via-peach/70 to-sky/70"
                  animate={{ scale: paused ? 1 : expanded ? 1.3 : 1 }}
                  transition={{ duration: phaseDuration, ease: 'easeInOut' }}
                >
                  <div className="text-center">
                    {phase === 'paused' ? (
                      <p className="text-lg font-medium text-ink/80">Пауза</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-ink/80" aria-live="polite">
                          {PHASE_LABEL[phase]}
                        </p>
                        <p className="mt-1 font-display text-5xl text-ink/75 tabular-nums" aria-hidden>
                          {secondsLeft}
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {phase === 'paused' ? (
                <div className="mt-8 flex flex-col items-center gap-4 text-center">
                  <p className="text-[15px] text-ink-soft">
                    {'Пауза — вернитесь, когда будете готовы'}
                  </p>
                  <button type="button" className="btn-secondary" onClick={resume}>
                    Продолжить
                  </button>
                </div>
              ) : (
                <p className="mt-8 text-[13.5px] text-ink-soft">цикл {cycle}</p>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
