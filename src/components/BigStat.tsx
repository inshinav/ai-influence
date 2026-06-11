import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { track } from '../lib/analytics'
import { useCalmMotion } from '../care/CareContext'

export default function BigStat({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const reduced = useCalmMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    const duration = 1200
    let raf = 0
    let startTime: number | null = null
    const step = (now: number) => {
      if (startTime === null) startTime = now
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * 81))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced])

  return (
    <section className="relative overflow-hidden py-24 text-center md:py-32">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[110px]"
        style={{
          background:
            'radial-gradient(circle at 35% 40%, var(--sun), transparent 60%), radial-gradient(circle at 70% 60%, var(--peach), transparent 60%)',
        }}
      />
      <div ref={ref} className="container-x relative">
        <p className="font-display text-[clamp(96px,18vw,200px)] leading-none tracking-tight">
          {reduced ? 81 : value}%
        </p>
        <p className="mx-auto mt-4 max-w-md text-xl text-ink-soft md:text-2xl">
          клиентов чувствуют результат уже после пятой сессии
        </p>
        <button
          type="button"
          className="btn-primary mt-9"
          onClick={() => {
            track('cta_click', { section: 'big_stat' })
            onOpenQuiz()
          }}
        >
          Начать сейчас
        </button>
      </div>
    </section>
  )
}
