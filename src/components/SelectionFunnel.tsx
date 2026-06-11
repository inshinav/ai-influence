import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { Check } from 'lucide-react'
import { NBSP } from '../lib/format'
import { useCalmMotion } from '../care/CareContext'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const STAGES = [
  'Образование',
  `Опыт от${NBSP}3${NBSP}лет`,
  'Рекомендации супервизора',
  `Собеседование с${NBSP}разбором практики`,
  'Этический кодекс',
  'Постоянные супервизии',
]

/** Сколько кандидатов выбывает на каждом этапе. Сумма — 91, остаются 9. */
const GROUP_SIZES = [25, 20, 18, 15, 8, 5]

/** Живых после каждого этапа: [100, 75, 55, 37, 22, 14, 9] */
const ALIVE_BY_STAGE = GROUP_SIZES.reduce<number[]>(
  (acc, size) => [...acc, acc[acc.length - 1] - size],
  [100],
)

/**
 * Для каждой точки — номер этапа (1–6), на котором она выбывает.
 * Детерминированно, без случайности: порядок выбывания задан перестановкой
 * (i * 37 + 11) % 100. Выжившие 9 точек получают Infinity.
 */
const ELIMINATION_STAGE: number[] = (() => {
  const order = Array.from({ length: 100 }, (_, i) => i).sort(
    (a, b) => ((a * 37 + 11) % 100) - ((b * 37 + 11) % 100),
  )
  const stages = new Array<number>(100).fill(Number.POSITIVE_INFINITY)
  let cursor = 0
  GROUP_SIZES.forEach((size, stageIndex) => {
    for (const dotIndex of order.slice(cursor, cursor + size)) {
      stages[dotIndex] = stageIndex + 1
    }
    cursor += size
  })
  return stages
})()

export default function SelectionFunnel() {
  const fieldRef = useRef<HTMLDivElement>(null)
  const inView = useInView(fieldRef, { once: true, margin: '-120px' })
  const reducedMotion = useCalmMotion()
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    if (!inView || reducedMotion) return
    let stage = 0
    const id = window.setInterval(() => {
      stage += 1
      setActiveStage(stage)
      if (stage >= STAGES.length) window.clearInterval(id)
    }, 850)
    return () => window.clearInterval(id)
  }, [inView, reducedMotion])

  // При calm-режиме сразу финальное состояние — без таймеров и setState в эффекте
  const effectiveStage = reducedMotion && inView ? STAGES.length : activeStage
  const aliveCount = ALIVE_BY_STAGE[effectiveStage]
  const finished = effectiveStage >= STAGES.length

  return (
    <section id="selection" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="eyebrow">Отбор</p>
          <h2 className="mt-3 text-4xl md:text-5xl">
            В{NBSP}Ясно попадают только 9% психологов
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Каждая заявка проходит шесть этапов проверки. Из{NBSP}100 кандидатов
            до{NBSP}работы с{NBSP}клиентами доходят девять.
          </p>
        </motion.div>

        <div
          ref={fieldRef}
          className="mt-12 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]"
        >
          {/* Поле из 100 точек */}
          <div>
            <p className="font-display text-3xl tabular-nums">
              {aliveCount}
              {NBSP}из{NBSP}100
            </p>
            <p
              className={`mt-1 min-h-6 text-[15px] text-ink-soft transition-opacity duration-500 ${
                finished ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!finished}
            >
              Остаются 9{NBSP}— они и{NBSP}работают с{NBSP}вами
            </p>
            <div className="mt-6 grid grid-cols-10 gap-2.5" aria-hidden="true">
              {ELIMINATION_STAGE.map((stage, i) => (
                <span
                  key={i}
                  className={`size-3 rounded-full transition-colors duration-500 md:size-3.5 ${
                    stage <= effectiveStage ? 'bg-mist' : 'bg-sun'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Этапы отбора */}
          <ol className="space-y-4">
            {STAGES.map((label, i) => {
              const stageNumber = i + 1
              const passed = stageNumber < effectiveStage
              const current = stageNumber === effectiveStage
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-300 ${
                      passed
                        ? 'bg-ok/10 text-ok'
                        : current
                          ? 'bg-ink text-paper'
                          : 'bg-mist text-ink-soft'
                    }`}
                  >
                    {passed ? <Check className="size-4" strokeWidth={2.5} /> : stageNumber}
                  </span>
                  <span
                    className={`text-[16px] transition-colors duration-300 ${
                      current ? 'font-semibold text-ink' : passed ? 'text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {label}
                  </span>
                  {current && (
                    <span className="size-2 shrink-0 rounded-full bg-sun" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
