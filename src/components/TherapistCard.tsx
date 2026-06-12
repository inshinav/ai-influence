import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import { useCalmMotion } from '../care/CareContext'
import type { Therapist, Method } from '../types'
import { topicById } from '../data/topics'
import { formatPrice, experienceLabel, NBSP } from '../lib/format'
import { track } from '../lib/analytics'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Тёплый абзац «как я работаю» — общий для метода, дополняет личную цитату. */
const methodApproach: Record<Method, string> = {
  КПТ: 'Мы разбираем конкретные ситуации и находим мысли, которые запускают тревогу или апатию. Постепенно у вас появляются рабочие инструменты — и между сессиями вы уже знаете, что делать. Никаких упражнений ради галочки: только то, что помогает именно вам.',
  Гештальт:
    'Мы идём от того, что происходит с вами прямо сейчас — в жизни и на самой сессии. Я помогаю замечать чувства, которые привычно прячутся за «всё нормально». Темп выбираете вы: торопить здесь никто не будет.',
  Психоанализ:
    'Вместе ищем, откуда растут повторяющиеся сценарии — в отношениях, в работе, в отношении к себе. Путь небыстрый, но изменения получаются глубокими и остаются с вами. Моя задача — помогать видеть то, что в одиночку разглядеть трудно.',
  Системная:
    'Смотрим не только на вас, но и на отношения, в которых вы живёте: пара, семья, родители. Часто дело не в одном человеке, а в правилах, по которым устроена система. Меняются правила — и всем внутри становится легче дышать.',
}

export default function TherapistCard({
  therapist,
  onBook,
}: {
  therapist: Therapist
  onBook: (t: Therapist) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useCalmMotion()

  const initials = therapist.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')

  const slotToday = therapist.nextSlot.includes('сегодня')
  const panelId = `therapist-details-${therapist.id}`

  const handleBook = () => {
    track('cta_click', { section: 'therapist_card', id: therapist.id })
    onBook(therapist)
  }

  const handleToggle = () => {
    const next = !expanded
    if (next) track('therapist_expand', { id: therapist.id })
    setExpanded(next)
  }

  return (
    <article className="group card card-hover flex h-full flex-col overflow-hidden !p-0">
      {/* Фото — крупно, как первая встреча взглядом */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-sky/30 via-azure/30 to-sky-soft">
        {/* Фолбэк-инициалы под фото */}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-display text-4xl font-semibold text-sky-deep/60"
        >
          {initials}
        </span>
        <img
          src={therapist.photo}
          alt={therapist.name}
          width={400}
          height={300}
          loading="lazy"
          className={`absolute inset-0 size-full object-cover${
            reduceMotion
              ? ''
              : ' transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105'
          }`}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        {/* Постоянная подложка для читаемости подписи */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/35 to-transparent"
        />
        {/* Свечение «ясного неба» снизу — проявляется на hover */}
        {!reduceMotion && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sky/30 via-dawn/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {/* Имя + метод поверх фото */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-2 gap-y-1 p-4">
          <h3 className="font-display text-[19px] font-semibold text-white">{therapist.name}</h3>
          <span className="glass rounded-full px-2.5 py-0.5 text-[12px] font-medium text-ink">
            {therapist.method}
          </span>
        </div>
      </div>

      {/* Тело карточки */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13.5px] text-ink-soft">{experienceLabel(therapist.experienceYears)}</p>

        {/* Темы */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {therapist.topics.slice(0, 3).map((id) => (
            <span key={id} className="rounded-full bg-mist px-2.5 py-1 text-[12.5px] text-ink-soft">
              {topicById(id).label}
            </span>
          ))}
        </div>

        {/* Цитата */}
        <p className="mt-3 line-clamp-2 text-[14.5px] text-ink-soft">{`«${therapist.quote}»`}</p>

        {/* Цена */}
        <p className="mt-3">
          <span className="font-semibold">{formatPrice(therapist.price)}</span>{' '}
          <span className="text-ink-soft">{`· 50${NBSP}мин`}</span>
        </p>

        {/* Честная доступность */}
        <div className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="relative flex size-2">
            {slotToday && !reduceMotion && (
              <span className="absolute inset-0 animate-ping rounded-full bg-ok/40" />
            )}
            <span className="relative size-2 rounded-full bg-ok" />
          </span>
          <p className="text-[13.5px] text-ink-soft">
            Ближайший слот: <span className="font-medium text-ok">{therapist.nextSlot}</span>
          </p>
        </div>

        {/* Действия: «Записаться» проявляется на hover (desktop), всегда видна на mobile */}
        <div className="mt-auto flex gap-2 pt-4">
          {/* CTA всегда видима: скрытая до hover кнопка записи стоила бы конверсии */}
          <button
            type="button"
            className="btn-primary flex-1 !px-4 !py-2.5 text-[15px]"
            onClick={handleBook}
          >
            Записаться
          </button>
          <button
            type="button"
            className="btn-secondary !px-4 !py-2.5 text-[15px]"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={handleToggle}
          >
            Подробнее
          </button>
        </div>

        {/* Развёрнутая анкета */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={panelId}
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
            >
              <div className="mt-4 space-y-4 border-t border-line pt-4">
                <div>
                  <h4 className="eyebrow">Образование</h4>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                    {therapist.education}
                  </p>
                </div>
                <div>
                  <h4 className="eyebrow">Как я работаю</h4>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                    {methodApproach[therapist.method]}
                  </p>
                </div>
                {/* Прозрачность отбора на карточке конкретного человека —
                    в момент, когда решают, можно ли ему довериться */}
                <div>
                  <h4 className="eyebrow">Проверено Ясно</h4>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {[
                      'Диплом и подготовка в методе подтверждены',
                      'Прошёл отбор — 6 этапов, проходят 9% кандидатов',
                      'Регулярные супервизии и этический кодекс',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-soft"
                      >
                        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}
