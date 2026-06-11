import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import type { TopicId } from '../types'
import { track } from '../lib/analytics'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type ResultCopy = {
  title: string
  text: string
}

type MiniTest = {
  id: 'anxiety-test' | 'burnout-test' | 'fit-test'
  tab: string
  /** Пометка рядом со счётчиком вопросов, например «скрининг GAD-2» */
  note?: string
  topic: TopicId
  /** Строка-контекст над каждым вопросом */
  intro?: string
  questions: string[]
  options: { label: string; score: number }[]
  /** Сумма баллов, начиная с которой показываем «повышенный» результат */
  threshold: number
  elevated: ResultCopy
  ok: ResultCopy
}

const YES_NO: MiniTest['options'] = [
  { label: 'Да', score: 1 },
  { label: 'Нет', score: 0 },
]

const TESTS: MiniTest[] = [
  {
    id: 'anxiety-test',
    tab: 'Уровень тревоги',
    note: 'скрининг GAD-2',
    topic: 'anxiety',
    intro: 'Как часто за последние 2 недели вас беспокоили:',
    questions: [
      'Нервозность, тревога, ощущение „на взводе“',
      'Неспособность прекратить или контролировать беспокойство',
    ],
    options: [
      { label: 'Совсем нет', score: 0 },
      { label: 'Несколько дней', score: 1 },
      { label: 'Больше половины дней', score: 2 },
      { label: 'Почти каждый день', score: 3 },
    ],
    threshold: 3,
    elevated: {
      title: 'Повышенный уровень тревоги',
      text: 'Такой результат — повод обсудить состояние со специалистом. Это не диагноз, но тревога, которая мешает жить, хорошо поддаётся терапии.',
    },
    ok: {
      title: 'Выраженной тревоги не видно',
      text: 'Если беспокойство всё же возвращается — разовая консультация поможет понять, что за ним стоит.',
    },
  },
  {
    id: 'burnout-test',
    tab: 'Выгорание',
    topic: 'burnout',
    questions: [
      'Усталость не проходит даже после выходных',
      'Работа, которая радовала, теперь раздражает',
      'Всё чаще ловите себя на мысли „откладываю жизнь на потом“',
    ],
    options: YES_NO,
    threshold: 2,
    elevated: {
      title: 'Похоже на признаки выгорания',
      text: 'Выгорание развивается медленно и само не проходит. Хорошая новость: с ним умеют работать — и чем раньше, тем проще.',
    },
    ok: {
      title: 'Критичных признаков не видно',
      text: 'Если усталость всё же копится — стоит разобраться, что её создаёт, пока она не стала фоном.',
    },
  },
  {
    id: 'fit-test',
    tab: 'Подойдёт ли мне терапия?',
    topic: 'unknown',
    questions: [
      'Замечаете повторяющиеся сценарии — в отношениях, работе, настроении',
      'Хочется разобраться в себе, но в одиночку не получается',
      'Готовы уделять себе час в неделю',
    ],
    options: YES_NO,
    threshold: 2,
    elevated: {
      title: 'Терапия, скорее всего, вам подойдёт',
      text: 'Запрос не обязан быть чётким — сформулировать его помогает сам психолог на первой сессии.',
    },
    ok: {
      title: 'Можно начать с малого',
      text: 'Даже одна сессия помогает понять, нужно ли вам это сейчас. Решение всегда за вами.',
    },
  },
]

function TestCard({
  test,
  onOpenQuiz,
}: {
  test: MiniTest
  onOpenQuiz: (topic: TopicId) => void
}) {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [sum, setSum] = useState(0)

  const total = test.questions.length
  const finished = step >= total
  const result = finished ? (sum >= test.threshold ? test.elevated : test.ok) : null

  const answer = (score: number) => {
    if (step === 0) track('test_start', { test: test.id })
    const nextSum = sum + score
    if (step === total - 1) {
      track('test_complete', {
        test: test.id,
        result: nextSum >= test.threshold ? 'elevated' : 'ok',
      })
    }
    setSum(nextSum)
    setStep(step + 1)
  }

  const restart = () => {
    setSum(0)
    setStep(0)
  }

  const stepTransition = { duration: reduced ? 0 : 0.2, ease: EASE }

  return (
    <div className="min-h-[300px]">
      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: reduced ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -24 }}
            transition={stepTransition}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mist" aria-hidden="true">
              <Sparkles className="h-5 w-5 text-ink" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{result.title}</h3>
            <p className="mt-2 text-ink-soft">{result.text}</p>
            <p className="mt-3 text-[12.5px] text-ink-soft/80">Экспресс-тест, не является диагнозом</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  track('cta_click', { section: 'test_result', test: test.id })
                  onOpenQuiz(test.topic)
                }}
              >
                Подобрать психолога, который работает с{' '}этим
              </button>
              <button
                type="button"
                className="rounded-full px-5 py-3 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:bg-mist hover:text-ink"
                onClick={restart}
              >
                Пройти ещё раз
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduced ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -24 }}
            transition={stepTransition}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] text-ink-soft">
                Вопрос {step + 1}{' '}из{' '}{total}
                {test.note ? ` · ${test.note}` : ''}
              </p>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {test.questions.map((q, i) => (
                  <span
                    key={q}
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                      i <= step ? 'bg-ink' : 'bg-ink/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {test.intro && <p className="mt-5 text-[15px] text-ink-soft">{test.intro}</p>}
            <p className={`${test.intro ? 'mt-2' : 'mt-5'} text-lg font-medium leading-snug`}>
              {test.questions[step]}
            </p>

            <div className="mt-5 grid gap-2">
              {test.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className="w-full rounded-xl border border-line bg-white p-4 text-left text-[15px] transition-colors duration-200 hover:bg-mist/60"
                  onClick={() => answer(option.score)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MiniTests({ onOpenQuiz }: { onOpenQuiz: (topic: TopicId) => void }) {
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState<MiniTest['id']>(TESTS[0].id)
  const active = TESTS.find((t) => t.id === activeId) ?? TESTS[0]

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.3, ease: EASE, delay: reduced ? 0 : delay },
  })

  return (
    <section id="tests" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div {...reveal(0)}>
          <p className="eyebrow">Мини-тесты</p>
          <h2 className="mt-3 text-4xl md:text-5xl">
            Не{' '}уверены, с{' '}чего начать? Начните с{' '}теста
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Каждый{' '}— не{' '}дольше 30{' '}секунд. Результат сразу, без почты
            и{' '}регистрации.
          </p>
        </motion.div>

        <motion.div
          {...reveal(0.07)}
          className="mt-10 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Выбор мини-теста"
        >
          {TESTS.map((test) => (
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
              className="card max-w-2xl p-6 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
            >
              <TestCard key={active.id} test={active} onOpenQuiz={onOpenQuiz} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
