import { motion } from 'motion/react'
import { Check, CreditCard, MessageCircle, RefreshCw } from 'lucide-react'
import { formatPrice, NBSP } from '../lib/format'
import { track } from '../lib/analytics'
import { reveal, revealParent, VIEWPORT_ONCE } from '../lib/motionPresets'

const INCLUDED = [
  'Видеосессия в защищённом кабинете',
  'Перенос без потери оплаты — при предупреждении заранее',
  'Поддержка 24/7',
]

const PLANS = [
  {
    title: 'Для себя',
    price: 3150,
    duration: '~50 минут',
    sub: 'Индивидуальная работа с психологом',
    badge: null as string | null,
  },
  {
    title: 'Для двоих',
    price: 4850,
    duration: '~1,5 часа',
    sub: 'Совместная работа с психологом',
    badge: `партнёр или подросток${NBSP}16+`,
  },
]

const RISK = [
  { icon: RefreshCw, text: 'Не подошёл психолог — бесплатно подберём другого' },
  { icon: MessageCircle, text: 'Поддержка 24/7' },
  { icon: CreditCard, text: 'Оплата картами РФ и иностранных банков' },
]

/** Цены как продолжение истории отбора: те же 9% — и честные условия рядом */
export default function Pricing({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  return (
    <section id="pricing" className="py-12 md:py-16">
      <div className="container-x">
        <motion.h2
          className="text-3xl md:text-4xl"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          Прозрачно. Без скрытых условий
        </motion.h2>

        <motion.div
          className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2"
          variants={revealParent}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          {PLANS.map((p) => (
            <motion.article key={p.title} className="card overflow-hidden" variants={reveal}>
              <div className="h-1 rounded-t-[20px] bg-gradient-to-r from-sky to-azure" aria-hidden />
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  {p.badge && (
                    <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-[12px] text-ink">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[14px] text-ink-soft">{p.sub}</p>
                <p className="mt-5 font-display text-4xl">
                  {formatPrice(p.price)}
                  <span className="ml-2 align-middle font-sans text-[15px] font-normal text-ink-soft">
                    · {p.duration}
                  </span>
                </p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14.5px]">
                      <Check size={17} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 md:grid-cols-3">
          {RISK.map((r) => (
            <div
              key={r.text}
              className="flex items-center gap-3 rounded-2xl bg-sky-soft/50 px-4 py-3.5 text-[14px]"
            >
              <r.icon size={18} className="shrink-0 text-sky" aria-hidden />
              {r.text}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[14px] text-ink-soft">
          {'Для сравнения: очная консультация в Москве обычно стоит 2 500–8 000 ₽.'}
        </p>

        <div className="mt-8 text-center">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              track('cta_click', { section: 'pricing_cta' })
              onOpenQuiz()
            }}
          >
            {`Начать подбор${NBSP}— бесплатно`}
          </button>
          <p className="mt-2 text-[13px] text-ink-soft">
            Оплата{NBSP}— только после знакомства с{NBSP}психологом
          </p>
        </div>
      </div>
    </section>
  )
}
