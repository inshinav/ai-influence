import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, X } from 'lucide-react'
import type {
  GenderPref,
  MethodPref,
  QuizAnswers,
  QuizLaunch,
  SlotSelection,
  Therapist,
  TherapyFormat,
  TimePref,
  TopicId,
} from '../types'
import { emptyAnswers } from '../types'
import { therapists } from '../data/therapists'
import { countEligible, rankTherapists, type MatchResult } from '../lib/matching'
import { track } from '../lib/analytics'
import { SPRING } from '../lib/motionPresets'
import QuizProgress from './QuizProgress'
import StepFormat from './steps/StepFormat'
import StepTopics from './steps/StepTopics'
import StepExperience from './steps/StepExperience'
import StepGender from './steps/StepGender'
import StepMethod from './steps/StepMethod'
import StepSchedule from './steps/StepSchedule'
import MatchingAnimation from './MatchingAnimation'
import Results from './Results'
import SlotPicker from './SlotPicker'
import SignupGate from './SignupGate'
import Confirmation from './Confirmation'

type Stage = 'steps' | 'matching' | 'results' | 'slot' | 'signup' | 'confirmation'

const TOTAL_STEPS = 6
const EASE = [0.22, 1, 0.36, 1] as const

type Props = {
  launch: QuizLaunch | null
  onClose: () => void
}

export default function QuizOverlay({ launch, onClose }: Props) {
  return (
    <AnimatePresence>
      {launch && <QuizSession key="quiz-session" launch={launch} onClose={onClose} />}
    </AnimatePresence>
  )
}

/**
 * Сессия квиза: монтируется заново на каждое открытие, поэтому стартовое
 * состояние выводится из launch синхронно — без миганий «не того» экрана.
 */
function QuizSession({ launch, onClose }: { launch: QuizLaunch; onClose: () => void }) {
  /** Прямое бронирование с карточки психолога — сразу к выбору времени */
  const directBooking = launch.kind === 'book'

  const [stage, setStage] = useState<Stage>(directBooking ? 'slot' : 'steps')
  /* Клик по чипу боли — это уже ответ «что беспокоит»: открываем шаг тем
     с видимо выбранным чипом («мы услышали»), формат по умолчанию — для себя
     (меняется на шаге 1, он остаётся доступен через «Назад») */
  const [step, setStep] = useState(launch.kind === 'quiz' && launch.topic ? 2 : 1)
  const [answers, setAnswers] = useState<QuizAnswers>(() =>
    launch.kind === 'quiz' && launch.topic
      ? { ...emptyAnswers, format: 'individual', topics: [launch.topic] }
      : emptyAnswers,
  )
  const [ranked, setRanked] = useState<MatchResult[]>([])
  const [chosen, setChosen] = useState<Therapist | null>(
    launch.kind === 'book' ? launch.therapist : null,
  )
  const [slot, setSlot] = useState<SlotSelection | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  /** Направление слайда шагов: 1 — вперёд, −1 — назад */
  const [dir, setDir] = useState(1)
  const dialogRef = useRef<HTMLDivElement>(null)
  const startTracked = useRef(false)

  /** Живой счётчик: сколько специалистов каталога проходят под текущие ответы */
  const matched = useMemo(() => countEligible(therapists, answers), [answers])

  useEffect(() => {
    if (startTracked.current) return
    startTracked.current = true
    if (launch.kind === 'book') {
      track('quiz_start', { source: launch.source, mode: 'direct_booking', therapist: launch.therapist.id })
    } else {
      track('quiz_start', { source: launch.source, topic: launch.topic })
    }
  }, [launch])

  // Блокировка скролла страницы под оверлеем
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const goNext = useCallback(() => {
    setDir(1)
    setStep((s) => {
      const next = Math.min(s + 1, TOTAL_STEPS)
      if (next !== s) track('quiz_step', { step: next })
      return next
    })
  }, [])

  const goBack = useCallback(() => {
    setDir(-1)
    track('quiz_back')
    setStep((s) => Math.max(s - 1, 1))
  }, [])

  /** Одиночный выбор: фиксируем ответ, даём 180мс увидеть состояние — и дальше */
  const pickAndAdvance = useCallback(
    <T,>(apply: (v: T) => Partial<QuizAnswers>) =>
      (v: T) => {
        setAnswers((a) => ({ ...a, ...apply(v) }))
        window.setTimeout(goNext, 180)
      },
    [goNext],
  )

  const startMatching = useCallback(() => {
    setRanked(rankTherapists(therapists, answers))
    track('quiz_complete')
    setStage('matching')
  }, [answers])

  const handleMatchingDone = useCallback(() => {
    track('match_shown', { top_score: ranked[0]?.percent })
    setStage('results')
  }, [ranked])

  const requestClose = useCallback(() => {
    if (stage === 'confirmation') {
      onClose()
      return
    }
    setConfirmExit(true)
  }, [stage, onClose])

  const confirmClose = useCallback(() => {
    track('quiz_abandon', { step: stage === 'steps' ? step : stage })
    setConfirmExit(false)
    onClose()
  }, [stage, step, onClose])

  // Esc — закрытие с подтверждением
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (confirmExit) setConfirmExit(false)
        else requestClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmExit, requestClose])

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepFormat
            value={answers.format}
            onSelect={pickAndAdvance<TherapyFormat>((format) => ({ format }))}
          />
        )
      case 2:
        return (
          <StepTopics
            value={answers.topics}
            onChange={(topics: TopicId[]) => setAnswers((a) => ({ ...a, topics }))}
            onNext={goNext}
          />
        )
      case 3:
        return (
          <StepExperience
            value={answers.hadTherapy}
            onSelect={pickAndAdvance<boolean>((hadTherapy) => ({ hadTherapy }))}
          />
        )
      case 4:
        return (
          <StepGender
            value={answers.gender}
            onSelect={pickAndAdvance<GenderPref>((gender) => ({ gender }))}
          />
        )
      case 5:
        return (
          <StepMethod
            value={answers.method}
            onSelect={pickAndAdvance<MethodPref>((method) => ({ method }))}
          />
        )
      case 6:
        return (
          <StepSchedule
            value={answers.schedule}
            onChange={(schedule: TimePref[]) => setAnswers((a) => ({ ...a, schedule }))}
            onNext={startMatching}
          />
        )
      default:
        return null
    }
  }

  const renderStage = () => {
    switch (stage) {
      case 'steps':
        return (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: dir * 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: dir * -28, filter: 'blur(6px)' }}
            transition={SPRING}
            className="mx-auto w-full max-w-xl"
          >
            {renderStep()}
          </motion.div>
        )
      case 'matching':
        return (
          <motion.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <MatchingAnimation answers={answers} onDone={handleMatchingDone} />
          </motion.div>
        )
      case 'results':
        return (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="mx-auto w-full max-w-5xl"
          >
            <Results
              ranked={ranked}
              answers={answers}
              onPick={(t: Therapist) => {
                setChosen(t)
                setStage('slot')
              }}
              onEdit={() => {
                setDir(-1)
                setStage('steps')
                setStep(2)
              }}
            />
          </motion.div>
        )
      case 'slot':
        return chosen ? (
          <motion.div
            key="slot"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="mx-auto w-full max-w-2xl"
          >
            <SlotPicker
              therapist={chosen}
              onConfirm={(s: SlotSelection) => {
                setSlot(s)
                setStage('signup')
              }}
              onBack={directBooking ? null : () => setStage('results')}
            />
          </motion.div>
        ) : null
      case 'signup':
        return chosen && slot ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="mx-auto w-full max-w-md"
          >
            <SignupGate
              therapist={chosen}
              slot={slot}
              onDone={() => setStage('confirmation')}
              onBack={() => setStage('slot')}
            />
          </motion.div>
        ) : null
      case 'confirmation':
        return chosen && slot ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="mx-auto w-full max-w-2xl"
          >
            <Confirmation therapist={chosen} slot={slot} onClose={onClose} />
          </motion.div>
        ) : null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper"
    >
      {/* Деликатное небо под контентом — атмосфера ясности */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-sky-soft/50 to-transparent"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Подбор психолога"
        tabIndex={-1}
        className="relative min-h-full outline-none"
      >
      {/* Верхняя панель */}
      <div className="sticky top-0 z-10 bg-paper/80 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex w-24 items-center">
            {stage === 'steps' && step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-mist hover:text-ink"
              >
                <ArrowLeft size={16} aria-hidden />
                Назад
              </button>
            )}
          </div>
          {stage === 'steps' && <QuizProgress step={step} total={TOTAL_STEPS} matched={matched} />}
          <div className="flex w-24 items-center justify-end">
            <button
              type="button"
              onClick={requestClose}
              aria-label="Закрыть подбор"
              className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-mist hover:text-ink"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
        </div>
        {stage === 'steps' && (
          <div className="h-1 w-full bg-mist" aria-hidden>
            <div
              className="h-full rounded-r-full bg-sky transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="container-x flex min-h-[calc(100dvh-64px)] flex-col justify-center py-10 md:py-14">
        <AnimatePresence mode="wait">{renderStage()}</AnimatePresence>
      </div>

      {/* Подтверждение закрытия */}
      <AnimatePresence>
        {confirmExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(22,24,29,0.45)] p-5"
            onClick={() => setConfirmExit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="card w-full max-w-sm p-7"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-label="Подтверждение закрытия"
            >
              <h3 className="text-lg font-semibold">
                {stage === 'slot' || stage === 'signup'
                  ? `Закрыть запись к ${chosen ? chosen.name.split(' ')[0] : 'психологу'}?`
                  : stage === 'results'
                    ? 'Закрыть подборку?'
                    : 'Прервать подбор?'}
              </h3>
              <p className="mt-2 text-[15px] text-ink-soft">
                {stage === 'signup' && chosen && slot
                  ? `Время ${slot.dateLabel}, ${slot.time} пока свободно — останется только закрепить.`
                  : stage === 'slot'
                    ? 'Осталось выбрать время — это меньше минуты. Закрыть и начать заново?'
                    : stage === 'results'
                      ? 'Подборка исчезнет — но её можно прислать себе на почту внизу страницы.'
                      : 'Ответы не сохранятся. Подбор занимает всего пару минут.'}
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button type="button" className="btn-primary w-full" onClick={() => setConfirmExit(false)} autoFocus>
                  Продолжить подбор
                </button>
                <button type="button" className="btn-secondary w-full" onClick={confirmClose}>
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  )
}
