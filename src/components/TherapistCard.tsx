import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Play } from 'lucide-react'
import type { Therapist, Method } from '../types'
import { topicById } from '../data/topics'
import { formatPrice, experienceLabel, NBSP } from '../lib/format'
import { track } from '../lib/analytics'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Тёплый абзац «как я работаю» — общий для метода, дополняет личную цитату. */
const methodApproach: Record<Method, string> = {
  КПТ: 'Мы разбираем конкретные ситуации и находим мысли, которые запускают тревогу или апатию. Постепенно у вас появляются рабочие инструменты — и между сессиями вы уже знаете, что делать. Никаких упражнений ради галочки: только то, что помогает именно вам.',
  Гештальт:
    'Мы идём от того, что происходит с вами прямо сейчас — в жизни и на самой сессии. Я помогаю замечать чувства, которые привычно прячутся за «всё нормально». Темп выбираете вы: торопить здесь никто не будет.',
  Психоанализ:
    'Вместе ищем, откуда растут повторяющиеся сценарии — в отношениях, в работе, в отношении к себе. Путь небыстрый, но изменения получаются глубокими и остаются с вами. Моя задача — помогать видеть то, что в одиночку разглядеть трудно.',
  Системная:
    'Смотрим не только на вас, но и на отношения, в которых вы живёте: пара, семья, родители. Часто дело не в одном человеке, а в правилах, по которым устроена система. Меняются правила — и всем внутри становится легче дышать.',
}

export default function TherapistCard({
  therapist,
  onBook,
}: {
  therapist: Therapist
  onBook: (t: Therapist) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion()

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
    <article className="card card-hover flex h-full flex-col p-5">
      {/* Фото + имя, метод, опыт */}
      <div className="flex items-start gap-4">
        <div className="relative flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sun/60 via-peach/60 to-sky/60">
          <span aria-hidden="true" className="font-display text-xl">
            {initials}
          </span>
          <img
            src={therapist.photo}
            alt={therapist.name}
            width={72}
            height={72}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold">{therapist.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-mist px-2.5 py-0.5 text-[12.5px] font-medium">
              {therapist.method}
            </span>
            <span className="text-[13.5px] text-ink-soft">
              {experienceLabel(therapist.experienceYears)}
            </span>
          </div>
        </div>
      </div>

      {/* Темы */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {therapist.topics.slice(0, 3).map((id) => (
          <span
            key={id}
            className="rounded-full border border-line px-2.5 py-1 text-[12.5px] text-ink-soft"
          >
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
        <span
          aria-hidden="true"
          className={`size-2 rounded-full bg-ok${slotToday && !reduceMotion ? ' animate-pulse' : ''}`}
        />
        <p className="text-[13.5px] text-ink-soft">
          Ближайший слот: <span className="font-medium text-ok">{therapist.nextSlot}</span>
        </p>
      </div>

      {/* Действия */}
      <div className="mt-auto flex gap-2 pt-4">
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
              <div>
                <div
                  role="img"
                  aria-label={'Видео-визитка — заглушка'}
                  className="relative flex aspect-video items-center justify-center rounded-xl bg-ink/90"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-white">
                    <Play aria-hidden="true" className="ml-0.5 size-5 text-ink" fill="currentColor" />
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-ink-soft">{`Видео-знакомство, 60${NBSP}сек`}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
