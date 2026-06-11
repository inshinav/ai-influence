import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import type { QuizAnswers, Therapist } from '../types'
import type { MatchResult } from '../lib/matching'
import { topicById } from '../data/topics'
import { experienceLabel, formatPrice } from '../lib/format'
import { track } from '../lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

const SCHEDULE_LABEL: Record<string, string> = {
  morning: 'утром',
  day: 'днём',
  evening: 'вечером',
  weekend: 'в выходные',
}

function Avatar({ therapist }: { therapist: Therapist }) {
  const initials = therapist.name
    .split(' ')
    .map((w) => w[0])
    .join('')
  return (
    <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sun/60 via-peach/60 to-sky/60">
      <span className="font-display text-lg" aria-hidden>
        {initials}
      </span>
      <img
        src={therapist.photo}
        alt={therapist.name}
        width={64}
        height={64}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </span>
  )
}

function summary(answers: QuizAnswers): string {
  const parts: string[] = []
  if (answers.topics.length > 0) {
    parts.push(answers.topics.slice(0, 2).map((id) => topicById(id).label).join(', '))
  }
  if (answers.schedule.length > 0) {
    parts.push(answers.schedule.map((s) => SCHEDULE_LABEL[s]).join('/'))
  }
  parts.push(answers.method === 'any' ? 'доверюсь подбору' : answers.method)
  return parts.join(' · ')
}

export default function Results({
  ranked,
  answers,
  onPick,
  onEdit,
}: {
  ranked: MatchResult[]
  answers: QuizAnswers
  onPick: (t: Therapist) => void
  onEdit: () => void
}) {
  const [visible, setVisible] = useState(3)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  const sendEmail = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true)
      return
    }
    track('email_capture')
    setEmailSent(true)
    setToast(true)
    toastTimer.current = window.setTimeout(() => setToast(false), 3000)
  }

  return (
    <div>
      <h2 className="font-display text-3xl tracking-[-0.02em] md:text-4xl">
        Вам подходят эти психологи
      </h2>
      <p className="mt-3 text-[14.5px] text-ink-soft">
        {summary(answers)}
        <button
          type="button"
          className="ml-2 text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
          onClick={onEdit}
        >
          Изменить ответы
        </button>
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {ranked.slice(0, visible).map((r, i) => (
          <motion.article
            key={r.therapist.id}
            className={`card relative flex flex-col p-5 ${i === 0 ? 'ring-2 ring-sun/70' : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 2) * 0.08, ease: EASE }}
          >
            {i === 0 && (
              <span className="absolute -top-3 right-4 rounded-full bg-sun px-2.5 py-1 text-[11.5px] font-semibold">
                Лучшее совпадение
              </span>
            )}
            <span className="w-fit rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-paper">
              Совпадение {r.percent}%
            </span>

            <div className="mt-4 flex items-center gap-3">
              <Avatar therapist={r.therapist} />
              <div>
                <h3 className="text-[16px] font-semibold">{r.therapist.name}</h3>
                <p className="mt-0.5 text-[13px] text-ink-soft">
                  <span className="mr-1.5 rounded-full bg-mist px-2 py-0.5 font-medium">
                    {r.therapist.method}
                  </span>
                  {experienceLabel(r.therapist.experienceYears)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
              Почему именно {r.therapist.gender === 'f' ? 'она' : 'он'}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {r.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-[14px] leading-snug">
                  <Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                  {reason}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[14.5px]">
              <span className="font-semibold">{formatPrice(r.therapist.price)}</span>
              <span className="text-ink-soft"> · 50 мин</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-ink-soft">
              <span className="size-2 rounded-full bg-ok" aria-hidden />
              {r.therapist.nextSlot}
            </p>

            <div className="mt-auto flex flex-col gap-2 pt-4">
              <button type="button" className="btn-primary w-full !py-3" onClick={() => onPick(r.therapist)}>
                Выбрать время
              </button>
              <button
                type="button"
                className="btn-secondary w-full !py-3"
                aria-expanded={expanded === r.therapist.id}
                onClick={() => setExpanded(expanded === r.therapist.id ? null : r.therapist.id)}
              >
                Подробнее
              </button>
            </div>

            <AnimatePresence initial={false}>
              {expanded === r.therapist.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-[13.5px] text-ink-soft">«{r.therapist.quote}»</p>
                  <p className="mt-2 text-[13px] text-ink-soft">{r.therapist.education}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-6">
        {visible < ranked.length && (
          <button type="button" className="btn-secondary" onClick={() => setVisible((v) => v + 3)}>
            Показать ещё варианты
          </button>
        )}

        <div className="w-full max-w-sm">
          <p className="text-center text-[13.5px] text-ink-soft">
            Не готовы решать сейчас? Заберите подборку с собой
          </p>
          {emailSent ? (
            <p className="mt-3 text-center text-[14.5px]">
              Отправили на <span className="font-medium">{email}</span>
            </p>
          ) : (
            <form
              className="mt-3 flex gap-2"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                sendEmail()
              }}
            >
              <input
                type="email"
                aria-label="Электронная почта для подборки"
                placeholder="Почта — пришлём подборку"
                className={`w-full rounded-full border bg-white px-5 py-3 text-[15px] ${
                  emailError ? 'border-red-400' : 'border-line'
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError(false)
                }}
              />
              <button type="submit" className="btn-secondary shrink-0">
                Прислать
              </button>
            </form>
          )}
          {emailError && (
            <p className="mt-2 text-center text-[13px] text-red-600">Похоже, в адресе опечатка</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="card fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 px-5 py-3.5"
            role="status"
          >
            <Check size={18} className="text-ok" aria-hidden />
            Подборка у вас в почте
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
