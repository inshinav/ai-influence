import { motion } from 'motion/react'
import { Check, CreditCard, MessageCircle, RefreshCw } from 'lucide-react'
import { formatPrice } from '../lib/format'

const EASE = [0.22, 1, 0.36, 1] as const

const INCLUDED = [
  'Видеосессия в защищённом кабинете',
  'Перенос без потери оплаты — при предупреждении заранее',
  'Поддержка 24/7',
]

const PLANS = [
  { title: 'Для себя', price: 3150, duration: '~50 минут', sub: 'Индивидуальная работа с психологом' },
  { title: 'Для двоих', price: 4850, duration: '~1,5 часа', sub: 'Партнёр, член семьи или подросток 16+' },
]

const RISK = [
  { icon: RefreshCw, text: 'Не подошёл психолог — бесплатно подберём другого' },
  { icon: MessageCircle, text: 'Поддержка 24/7' },
  { icon: CreditCard, text: 'Оплата картами РФ и иностранных банков' },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="eyebrow">Цены</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Прозрачно. Без скрытых условий</h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          {PLANS.map((p, i) => (
            <motion.article
              key={p.title}
              className="card p-7"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
            >
              <h3 className="text-lg font-semibold">{p.title}</h3>
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
            </motion.article>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 md:grid-cols-3">
          {RISK.map((r) => (
            <div key={r.text} className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3.5 text-[14px]">
              <r.icon size={18} className="shrink-0 text-ink-soft" aria-hidden />
              {r.text}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[14px] text-ink-soft">
          {'Для сравнения: очная консультация в Москве обычно стоит 2 500–8 000 ₽.'}
        </p>
      </div>
    </section>
  )
}
