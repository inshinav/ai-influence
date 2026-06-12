import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarPlus, Check } from 'lucide-react'
import type { SlotSelection, Therapist } from '../types'
import { experienceLabel, formatPrice } from '../lib/format'
import { downloadIcs } from '../lib/ics'
import { ScribbleUnderline } from '../components/Scribble'
import { track } from '../lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

const FIRST_SESSION = [
  'Познакомитесь и расскажете, что привело — своими словами, без подготовки',
  'Вместе сформулируете запрос: с чем хочется разобраться в первую очередь',
  'Наметите план работы — без давления и оценок',
]

export default function Confirmation({
  therapist,
  slot,
  onClose,
}: {
  therapist: Therapist
  slot: SlotSelection
  onClose: () => void
}) {
  const [offer, setOffer] = useState<'open' | 'held' | 'later'>('open')
  const [toast, setToast] = useState(false)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    track('second_session_offer_shown')
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const holdRhythm = () => {
    track('second_session_accepted')
    setOffer('held')
    setToast(true)
    toastTimer.current = window.setTimeout(() => setToast(false), 3500)
  }

  const initials = therapist.name
    .split(' ')
    .map((w) => w[0])
    .join('')

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -top-20 left-1/2 -z-10 h-72 w-[560px] max-w-full -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 50%, rgba(95,194,240,0.40), transparent 65%), radial-gradient(circle at 70% 50%, rgba(214,236,251,0.7), transparent 65%), radial-gradient(circle at 50% 95%, rgba(255,217,168,0.25), transparent 60%)',
        }}
      />

      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex size-14 items-center justify-center rounded-full bg-ok text-white"
        >
          <Check size={28} aria-hidden />
        </motion.div>
        <h2 className="mt-5 font-display text-3xl md:text-4xl">
          <span className="relative inline-block">
            Запись закреплена
            <ScribbleUnderline className="absolute -bottom-2 left-0" delay={500} />
          </span>
        </h2>
        <p aria-hidden className="hand mt-3 text-[22px]">{`до встречи — ${slot.dateLabel}`}</p>
      </div>

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky/25 via-azure/25 to-dawn/40">
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
          <div>
            <p className="font-semibold">{therapist.name}</p>
            <p className="text-[13.5px] text-ink-soft">
              {therapist.method} · {experienceLabel(therapist.experienceYears)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {slot.dateLabel} · {slot.time}
          </p>
          <p className="text-[13.5px] text-ink-soft">50 минут, видеосессия</p>
          <p className="mt-0.5 text-[14px] font-medium">{formatPrice(therapist.price)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Что будет на первой сессии</h3>
        <ol className="mt-4 flex flex-col gap-3">
          {FIRST_SESSION.map((point, i) => (
            <li key={point} className="flex items-start gap-3 text-[15px] text-ink-soft">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mist text-[13px] font-semibold text-ink">
                {i + 1}
              </span>
              {point}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" onClick={() => downloadIcs(therapist, slot)}>
          <CalendarPlus size={18} aria-hidden />
          Добавить в календарь
        </button>
        <p className="text-[13.5px] text-ink-soft">Напомним за 24 часа и за 1 час до сессии</p>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-paper p-6">
        {offer === 'open' && (
          <>
            <p className="text-[15.5px] leading-relaxed">
              {'Терапия работает как ритм: 81% чувствуют результат к 5-й сессии. Удержать то же время на следующей неделе? Это бесплатно и ни к чему не обязывает.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button type="button" className="btn-primary" onClick={holdRhythm}>
                Да, закрепить ритм
              </button>
              <button
                type="button"
                className="text-[14.5px] text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
                onClick={() => setOffer('later')}
              >
                Решу после первой сессии
              </button>
            </div>
          </>
        )}
        {offer === 'held' && (
          <p className="text-[15.5px] leading-relaxed">
            {`Время ${slot.time} на следующей неделе удержано за вами на 24 часа после первой сессии. Подтвердите одним нажатием — или просто отпустите, ничего не спишем.`}
          </p>
        )}
        {offer === 'later' && (
          <p className="text-[15.5px] leading-relaxed">
            {'Хорошо. Решение всегда за вами — вернуться к этому можно в любой момент.'}
          </p>
        )}
      </div>

      <div className="mt-10 text-center">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Вернуться на главную
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="card fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap px-5 py-3.5"
            role="status"
          >
            <Check size={18} className="text-ok" aria-hidden />
            Время удержано — решите после первой сессии
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
