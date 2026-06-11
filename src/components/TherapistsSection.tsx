import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Therapist, TopicId } from '../types'
import { useCalmMotion } from '../care/CareContext'
import { therapists } from '../data/therapists'
import TherapistCard from './TherapistCard'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type Filter = 'all' | TopicId | 'couple'

const filterOptions: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'anxiety', label: 'Тревога' },
  { id: 'relationships', label: 'Отношения' },
  { id: 'burnout', label: 'Выгорание' },
  { id: 'self-esteem', label: 'Самооценка' },
  { id: 'couple', label: 'Для двоих' },
]

const INITIAL_VISIBLE = 6

export default function TherapistsSection({ onBook }: { onBook: (t: Therapist) => void }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [visible, setVisible] = useState(INITIAL_VISIBLE)
  const reduceMotion = useCalmMotion()

  const filtered = therapists.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'couple') return t.formats.includes('couple')
    return t.topics.includes(filter)
  })

  const shown = filtered.slice(0, visible)
  const hasMore = filtered.length > visible

  const selectFilter = (next: Filter) => {
    setFilter(next)
    setVisible(INITIAL_VISIBLE)
  }

  return (
    <section id="therapists" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="eyebrow">Психологи</p>
          <h2 className="mt-3 text-4xl md:text-5xl">{'Знакомьтесь — до записи'}</h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Открытые анкеты: метод, опыт, темы и ближайшее свободное время.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const active = filter === option.id
            return (
              <button
                key={option.id}
                type="button"
                className={`chip${active ? ' chip-active' : ''}`}
                aria-pressed={active}
                onClick={() => selectFilter(option.id)}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        {shown.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {shown.map((t) => (
                <motion.div
                  key={t.id}
                  layout={!reduceMotion}
                  className="h-full"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
                >
                  <TherapistCard therapist={t} onBook={onBook} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="card mt-10 p-10 text-center">
            <p className="text-ink-soft">
              {'Под этот фильтр пока никого — посмотрите всех специалистов'}
            </p>
            <button type="button" className="btn-secondary mt-5" onClick={() => selectFilter('all')}>
              Показать всех
            </button>
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button type="button" className="btn-secondary" onClick={() => setVisible(filtered.length)}>
              Показать ещё
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
