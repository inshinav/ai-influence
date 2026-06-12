import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useCalmMotion } from '../care/CareContext'
import { reveal, revealParent, VIEWPORT_ONCE } from '../lib/motionPresets'

/**
 * Живое доказательство масштаба: не статичные цифры, а ощущение, что
 * прямо сейчас тысячи людей получают помощь. Снимает «я один такой».
 * Без фейк-уведомлений — только обобщённое настоящее время сервиса.
 */

const STATS: { value: number; suffix: string; label: string; main?: boolean }[] = [
  { value: 420_000, suffix: '+', label: 'человек уже выбрали Ясно — вы не один такой', main: true },
  { value: 81, suffix: '%', label: 'чувствуют результат уже после пятой сессии' },
  { value: 4_800, suffix: '', label: 'проверенных специалистов' },
  { value: 7, suffix: ' лет', label: 'средний опыт психолога' },
]

const PULSE_LINES = [
  'сессии идут прямо сейчас — онлайн',
  'из Москвы, Алматы, Берлина — отовсюду',
  'каждый день — сотни первых сессий',
  'половина приходят в терапию впервые',
]

function useCountUp(target: number, run: boolean, durationMs = 1400): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    let start: number | null = null
    const step = (now: number) => {
      if (start === null) start = now
      const t = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [run, target, durationMs])
  return value
}

function format(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function StatCell({ stat, run }: { stat: (typeof STATS)[number]; run: boolean }) {
  const calm = useCalmMotion()
  const counted = useCountUp(stat.value, run && !calm)
  const display = calm ? stat.value : counted

  if (stat.main) {
    return (
      <motion.div variants={reveal} className="relative md:col-span-2 md:row-span-2">
        <div
          aria-hidden
          className="absolute -inset-8 rounded-full bg-sky/15 blur-3xl"
        />
        <p className="relative font-display text-[clamp(56px,8vw,110px)] font-bold leading-none tracking-[-0.04em] text-ink">
          {format(display)}
          <span className="text-sky">+</span>
        </p>
        <p className="relative mt-3 max-w-[300px] text-[17px] leading-snug text-ink-soft">
          {stat.label}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={reveal}>
      <p className="font-display text-[clamp(34px,4vw,46px)] font-semibold leading-none tracking-[-0.02em]">
        {format(display)}
        {stat.suffix}
      </p>
      <p className="mt-2 text-[14.5px] leading-snug text-ink-soft">{stat.label}</p>
    </motion.div>
  )
}

export default function BigStat() {
  const calm = useCalmMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })
  const [line, setLine] = useState(0)

  // Деликатная ротация живой ленты; calm — статичная первая строка
  useEffect(() => {
    if (calm) return
    const id = window.setInterval(() => setLine((l) => (l + 1) % PULSE_LINES.length), 3500)
    return () => window.clearInterval(id)
  }, [calm])

  return (
    <section className="overflow-hidden bg-mist/60 py-20 md:py-24">
      <motion.div
        ref={ref}
        className="container-x"
        variants={revealParent}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT_ONCE}
      >
        <div className="grid items-center gap-x-12 gap-y-10 md:grid-cols-4 md:grid-rows-2">
          <StatCell stat={STATS[0]} run={inView} />
          {STATS.slice(1).map((s) => (
            <StatCell key={s.label} stat={s} run={inView} />
          ))}
        </div>

        {/* Живая лента: ощущение сервиса, который работает прямо сейчас */}
        <motion.div
          variants={reveal}
          className="mt-12 flex items-center gap-2.5 border-t border-line pt-6"
        >
          <span className="relative flex size-2 shrink-0" aria-hidden>
            <span className="relative inline-flex size-2 rounded-full bg-sky" />
          </span>
          <span className="h-[20px] overflow-hidden text-[14px] text-ink-soft" aria-live="off">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={line}
                className="block"
                initial={calm ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={calm ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {PULSE_LINES[line]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        <motion.p variants={reveal} className="mt-4 text-[12.5px] text-ink-soft/80">
          {'По внутренним данным и опросам клиентов Ясно. Как считали — расскажем в FAQ и поддержке.'}
        </motion.p>
      </motion.div>
    </section>
  )
}
