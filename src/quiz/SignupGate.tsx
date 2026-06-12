import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Lock } from 'lucide-react'
import type { SlotSelection, Therapist } from '../types'
import { formatPrice } from '../lib/format'
import { track } from '../lib/analytics'

export default function SignupGate({
  therapist,
  slot,
  onDone,
  onBack,
}: {
  therapist: Therapist
  slot: SlotSelection
  onDone: () => void
  onBack: () => void
}) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    track('signup_shown')
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const submit = () => {
    const next: { email?: string; phone?: string } = {}
    if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Проверьте адрес почты'
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Проверьте номер — нужно не меньше 10 цифр'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setLoading(true)
    timer.current = window.setTimeout(() => {
      track('signup_submitted')
      track('booking_confirmed')
      onDone()
    }, 600)
  }

  const firstName = therapist.name.split(' ')[0]

  return (
    <div>
      <button
        type="button"
        className="mb-6 inline-flex items-center gap-1.5 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
        onClick={onBack}
      >
        <ArrowLeft size={16} aria-hidden />
        Назад к времени
      </button>

      <h2 className="font-display text-3xl tracking-[-0.02em]">Почти готово</h2>
      <p className="mt-2 text-ink-soft">Куда прислать ссылку на сессию с {firstName}?</p>

      {/* Выбор человека перед глазами: время не «потерялось», пока он вводит контакты */}
      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 !shadow-none p-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky/30 via-azure/30 to-sky-soft">
            <span className="font-display text-[14px]" aria-hidden>
              {therapist.name
                .split(' ')
                .map((w) => w[0])
                .join('')}
            </span>
            <img
              src={therapist.photo}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </span>
          <div>
            <p className="text-[15px] font-semibold leading-tight">{therapist.name}</p>
            <p className="text-[13px] text-ink-soft">
              {slot.dateLabel} · {slot.time}
            </p>
          </div>
        </div>
        <p className="text-[14px] font-medium">{formatPrice(therapist.price)}</p>
      </div>

      <form
        className="mt-8 flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div>
          <label htmlFor="signup-email" className="text-[13.5px] font-medium">
            Почта
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className={`mt-1.5 w-full rounded-2xl border bg-white px-5 py-4 text-[16px] ${
              errors.email ? 'border-red-400' : 'border-line'
            }`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((p) => ({ ...p, email: undefined }))
            }}
          />
          {errors.email && <p className="mt-1.5 text-[13px] text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="signup-phone" className="text-[13.5px] font-medium">
            Телефон
          </label>
          <input
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+7 900 000-00-00"
            className={`mt-1.5 w-full rounded-2xl border bg-white px-5 py-4 text-[16px] ${
              errors.phone ? 'border-red-400' : 'border-line'
            }`}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setErrors((p) => ({ ...p, phone: undefined }))
            }}
          />
          {errors.phone && <p className="mt-1.5 text-[13px] text-red-600">{errors.phone}</p>}
        </div>

        {/* Страх «куда уйдут мои данные» снимается в момент ввода, а не в FAQ */}
        <p className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-soft">
          <Lock size={15} className="mt-0.5 shrink-0 text-sky" aria-hidden />
          {'Контакты нужны только для ссылки на сессию и напоминаний. Никому не передаём — даже психологу виден лишь ваш запрос.'}
        </p>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              Закрепляем…
            </>
          ) : (
            'Закрепить запись'
          )}
        </button>

        <p className="text-center text-[13.5px] text-ink-soft">
          {'Оплата — после знакомства с психологом в личном кабинете. Никаких паролей — вход по ссылке из письма.'}
        </p>
      </form>
    </div>
  )
}
