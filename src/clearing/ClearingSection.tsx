import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Cloud, Download, Lock, Sun, Wind } from 'lucide-react'
import type { TopicId } from '../types'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { softChime, transitionTick } from '../lib/sound'
import { clarityForProgress } from '../lib/clarity'
import { useCalmMotion } from '../care/CareContext'
import {
  CLEARING_TESTS,
  bandFor,
  isHeavy,
  type ClearingTest,
  type ClearingTestId,
  type FreeTool,
} from './tests'
import ClearWindow from './ClearWindow'
import Reflection from './Reflection'
import IntensitySlider from './IntensitySlider'
import SupportScreen from './SupportScreen'
import { downloadResultCard } from './ResultCard'

const EASE = [0.22, 1, 0.36, 1] as const

/** Дыхательная пауза: отражение держится, прежде чем придёт следующий вопрос */
const REFLECTION_PAUSE = 1600

/** Свой аналог стрелочной навигации квиза — без зависимостей между секциями */
function useArrowFocus() {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    // Слайдеру стрелки нужны самому — не перехватываем
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    if (buttons.length === 0) return
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
    const next = current === -1 ? 0 : (current + (forward ? 1 : -1) + buttons.length) % buttons.length
    buttons[next].focus()
    e.preventDefault()
  }

  return { ref, onKeyDown }
}

/** Небо проясняется: облачка отвеченных вопросов становятся солнцем */
function SkyProgress({
  answered,
  step,
  total,
  calm,
}: {
  answered: number
  step: number
  total: number
  calm: boolean
}) {
  return (
    <div
      role="img"
      aria-label={`Вопрос ${Math.min(step + 1, total)} из ${total}`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) =>
        i < answered ? (
          <motion.span
            key={i}
            initial={calm ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex"
          >
            <Sun className="h-4 w-4 text-sky" aria-hidden="true" />
          </motion.span>
        ) : (
          <span key={i} className="inline-flex">
            <Cloud
              className={`h-4 w-4 ${i === step ? 'text-ink-soft' : 'text-ink-soft/40'}`}
              aria-hidden="true"
            />
          </span>
        ),
      )}
    </div>
  )
}

/** Бесплатный инструмент в результате — отдаём пользу до любых CTA */
function ToolBlock({ tool, calm }: { tool: FreeTool; calm: boolean }) {
  return (
    <div className="mt-6 rounded-2xl bg-mist p-5">
      <p className="eyebrow">Бесплатный инструмент</p>
      <h4 className="mt-2 text-[17px]">{tool.title}</h4>

      {tool.kind === 'breath' && (
        <>
          <p className="mt-1.5 text-[15px] text-ink-soft">{tool.text}</p>
          <button
            type="button"
            className="btn-secondary mt-4 bg-white"
            onClick={() => {
              document
                .querySelector(tool.target)
                ?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
            }}
          >
            <Wind className="h-4 w-4" aria-hidden="true" />
            {tool.cta}
          </button>
        </>
      )}

      {tool.kind === 'steps' && (
        <>
          <p className="mt-1.5 text-[15px] text-ink-soft">{tool.text}</p>
          <ol className="mt-3.5 grid gap-2.5">
            {tool.steps.map((stepText, i) => (
              <li key={stepText} className="flex items-start gap-3 text-[15px] leading-snug">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12.5px] font-semibold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span>{stepText}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {tool.kind === 'weekly-question' && (
        <>
          <p className="mt-2.5 font-display text-xl leading-snug">«{tool.question}»</p>
          <p className="mt-2 text-[15px] text-ink-soft">{tool.text}</p>
        </>
      )}
    </div>
  )
}

/** Один тест: вопросы → отражения → результат (или ветка поддержки) */
function TestFlow({
  test,
  onOpenQuiz,
}: {
  test: ClearingTest
  onOpenQuiz: (topic: TopicId) => void
}) {
  const calm = useCalmMotion()
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [reflection, setReflection] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState(5)
  const [saving, setSaving] = useState(false)

  const pauseTimer = useRef<number | null>(null)
  const keyboardAnswer = useRef(false)
  const chimed = useRef(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const { ref: optionsRef, onKeyDown: onOptionsKeyDown } = useArrowFocus()

  const total = test.questions.length
  const done = step >= total
  const question = done ? null : test.questions[step]
  const sum = scores.reduce((a, b) => a + b, 0)
  const heavy = done && isHeavy(test, scores)
  const result = sum >= test.threshold ? test.elevated : test.ok
  const clarity = done ? 1 : clarityForProgress(scores.length, total)
  /** Подсказка-приглашение: видна, пока человек не сделал первый ответ */
  const showNudge = step === 0 && scores.length === 0 && picked === null

  useEffect(
    () => () => {
      if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current)
    },
    [],
  )

  // Тёплое подтверждение результата; тяжёлая ветка — без «праздника»
  useEffect(() => {
    if (done && !heavy && !chimed.current) {
      chimed.current = true
      softChime()
    }
    if (!done) chimed.current = false
  }, [done, heavy])

  // Клавиатурный сценарий: после смены вопроса фокус — на первый вариант,
  // после завершения — на блок результата (ждём конца перехода mode="wait")
  useEffect(() => {
    if (step === 0 || done || !keyboardAnswer.current) return
    const id = window.setTimeout(
      () => optionsRef.current?.querySelector<HTMLButtonElement>('button')?.focus(),
      calm ? 30 : 380,
    )
    return () => window.clearTimeout(id)
  }, [step, done, calm, optionsRef])

  useEffect(() => {
    if (!done || !keyboardAnswer.current) return
    const id = window.setTimeout(() => resultRef.current?.focus(), calm ? 30 : 380)
    return () => window.clearTimeout(id)
  }, [done, calm])

  const answer = (score: number, reflectionText: string, optionIdx: number, viaKeyboard: boolean) => {
    if (picked !== null || done) return
    if (scores.length === 0) track('test_start', { test: test.id })
    haptic(8)
    transitionTick()
    keyboardAnswer.current = viaKeyboard

    const nextScores = [...scores, score]
    setScores(nextScores)
    setPicked(optionIdx)
    setReflection(reflectionText)

    if (nextScores.length === total) {
      const nextSum = nextScores.reduce((a, b) => a + b, 0)
      track('test_complete', {
        test: test.id,
        result: nextSum >= test.threshold ? 'elevated' : 'ok',
      })
    }

    pauseTimer.current = window.setTimeout(() => {
      setPicked(null)
      setReflection(null)
      setSliderValue(5)
      setStep((s) => s + 1)
    }, REFLECTION_PAUSE)
  }

  const restart = () => {
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current)
    setScores([])
    setStep(0)
    setPicked(null)
    setReflection(null)
    setSliderValue(5)
  }

  const saveCard = async () => {
    if (saving) return
    setSaving(true)
    try {
      await downloadResultCard({
        testName: test.tab,
        title: result.title,
        text: result.text,
        fileName: `yasno-${test.id}`,
      })
      track('test_card_saved', { test: test.id })
    } finally {
      setSaving(false)
    }
  }

  const slide = {
    initial: { opacity: 0, x: calm ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: calm ? 0 : -24 },
    transition: { duration: calm ? 0 : 0.3, ease: EASE },
  }

  return (
    <div className="card max-w-3xl overflow-hidden">
      <div className="grid md:grid-cols-[1fr_220px]">
      <div className="p-6 md:p-8">
      <div className="min-h-[380px]">
        <AnimatePresence mode="wait" initial={false}>
          {done && heavy ? (
            <motion.div key="support" {...slide}>
              <div ref={resultRef} tabIndex={-1} className="outline-none">
                <SupportScreen
                  testId={test.id}
                  lead={test.heavy?.lead}
                  onFindTherapist={() => onOpenQuiz(test.topic)}
                  onRestart={restart}
                />
              </div>
            </motion.div>
          ) : done ? (
            <motion.div key="result" {...slide}>
              <div ref={resultRef} tabIndex={-1} className="outline-none">
              {/* Награда: окно расчищено */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1.5 text-[12.5px] font-semibold text-ink">
                <Sun className="h-3.5 w-3.5 text-sky" aria-hidden="true" />
                Небо расчищено
              </span>
              <h3 className="mt-4 font-display text-2xl md:text-[28px]">{result.title}</h3>
              <p className="mt-2 max-w-xl text-ink-soft">{result.text}</p>
              <p className="mt-3 text-[12.5px] text-ink-soft/80">
                Экспресс-скрининг для саморефлексии, не диагноз
              </p>

              <ToolBlock tool={test.tool} calm={calm} />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => {
                    void saveCard()
                  }}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {saving ? 'Сохраняем…' : 'Сохранить карточку'}
                </button>
                <button
                  type="button"
                  className="rounded-full px-5 py-3 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:bg-mist hover:text-ink"
                  onClick={restart}
                >
                  Пройти ещё раз
                </button>
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <p className="max-w-xl text-[15px] text-ink-soft">
                  Если захотите разобраться глубже — рядом будет человек, который умеет
                  с этим работать.
                </p>
                <button
                  type="button"
                  className="btn-primary mt-4"
                  onClick={() => {
                    track('cta_click', { section: 'test_result', test: test.id })
                    onOpenQuiz(test.topic)
                  }}
                >
                  Подобрать психолога, который работает с этим
                </button>
              </div>
              </div>
            </motion.div>
          ) : question ? (
            <motion.div key={step} {...slide}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[13px] text-ink-soft">{test.note ?? test.tab}</p>
                <SkyProgress answered={scores.length} step={step} total={total} calm={calm} />
              </div>

              {test.intro && <p className="mt-6 text-[15px] text-ink-soft">{test.intro}</p>}
              <p
                id={`clearing-q-${test.id}`}
                className={`${test.intro ? 'mt-2' : 'mt-6'} text-lg font-medium leading-snug`}
              >
                {question.text}
              </p>

              {question.kind === 'choice' ? (
                <>
                  {showNudge && (
                    <p className="hand mt-4 text-[19px]" aria-hidden>
                      выберите честный ответ ↓
                    </p>
                  )}
                  <div
                    ref={optionsRef}
                    onKeyDown={onOptionsKeyDown}
                    role="group"
                    aria-labelledby={`clearing-q-${test.id}`}
                    className={`${showNudge ? 'mt-2' : 'mt-5'} grid gap-2`}
                  >
                    {question.options.map((option, i) => {
                      const isPicked = picked === i
                      const dimmed = picked !== null && !isPicked
                      return (
                        <button
                          key={option.label}
                          type="button"
                          aria-pressed={isPicked}
                          onClick={(e) => answer(option.score, option.reflection, i, e.detail === 0)}
                          className={`relative w-full rounded-xl border p-4 text-left text-[15px] transition-all duration-200 ${
                            isPicked
                              ? 'border-ink bg-ink text-white'
                              : dimmed
                                ? 'border-line bg-white opacity-50'
                                : 'border-line bg-white hover:-translate-y-px hover:border-sky/40 hover:bg-sky-soft/30'
                          }`}
                        >
                          {/* Мягкий пульс на первом варианте — «сюда можно нажать» */}
                          {i === 0 && showNudge && !calm && (
                            <motion.span
                              aria-hidden
                              className="pointer-events-none absolute -inset-px rounded-xl ring-2 ring-sky/60"
                              animate={{ opacity: [0.8, 0, 0.8] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          )}
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div ref={optionsRef} onKeyDown={onOptionsKeyDown} className="mt-7">
                  <IntensitySlider
                    value={sliderValue}
                    onChange={setSliderValue}
                    minLabel={question.minLabel}
                    maxLabel={question.maxLabel}
                    label={question.text}
                  />
                  <button
                    type="button"
                    className={`btn-secondary mt-6 ${picked !== null ? 'pointer-events-none opacity-60' : ''}`}
                    onClick={(e) => {
                      const band = bandFor(question, sliderValue)
                      answer(band.score, band.reflection, 0, e.detail === 0)
                    }}
                  >
                    Дальше
                  </button>
                </div>
              )}

              <div className="mt-5 min-h-[52px]">
                <AnimatePresence>
                  {reflection && <Reflection key={`reflection-${step}`} text={reflection} />}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      </div>

      {/* Запотевшее окно: туман живёт здесь, ответы протирают стекло */}
      <ClearWindow
        clarity={clarity}
        done={done}
        className="order-first h-28 border-b border-line md:order-none md:h-auto md:border-b-0 md:border-l"
      />
      </div>
    </div>
  )
}

/**
 * «Расчистка»: мини-тесты как отдающий разговор. Drop-in замена MiniTests —
 * та же секция #tests и тот же проп-контракт.
 */
export default function ClearingSection({
  onOpenQuiz,
}: {
  onOpenQuiz: (topic: TopicId) => void
}) {
  const calm = useCalmMotion()
  const [activeId, setActiveId] = useState<ClearingTestId>(CLEARING_TESTS[0].id)
  const active = CLEARING_TESTS.find((t) => t.id === activeId) ?? CLEARING_TESTS[0]
  const { ref: tabsRef, onKeyDown: onTabsKeyDown } = useArrowFocus()

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: calm ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.3, ease: EASE, delay: calm ? 0 : delay },
  })

  return (
    <section id="tests" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div {...reveal(0)}>
          <p className="eyebrow">Расчистка</p>
          <h2 className="mt-3 max-w-2xl text-4xl md:text-5xl">
            Не уверены, с чего начать? Начните с теста
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Каждый ответ немного проясняет картину. 30 секунд, результат сразу.
          </p>
          <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-2xl bg-mist px-4 py-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
            <p className="text-[14px] leading-snug text-ink-soft">
              Ответы не покидают ваш браузер. Мы ничего не сохраняем и не отправляем.
            </p>
          </div>
        </motion.div>

        <motion.div
          {...reveal(0.07)}
          ref={tabsRef}
          onKeyDown={onTabsKeyDown}
          className="mt-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Выбор теста"
        >
          {CLEARING_TESTS.map((test) => (
            <button
              key={test.id}
              type="button"
              role="tab"
              id={`tab-${test.id}`}
              aria-selected={test.id === activeId}
              aria-controls={`panel-${test.id}`}
              className={`chip ${test.id === activeId ? 'chip-active' : ''}`}
              onClick={() => setActiveId(test.id)}
            >
              {test.tab}
            </button>
          ))}
        </motion.div>

        <motion.div {...reveal(0.14)} className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              role="tabpanel"
              id={`panel-${active.id}`}
              aria-labelledby={`tab-${active.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: calm ? 0 : 0.2, ease: EASE }}
            >
              <TestFlow key={active.id} test={active} onOpenQuiz={onOpenQuiz} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
