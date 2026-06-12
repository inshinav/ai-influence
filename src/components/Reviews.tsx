import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCalmMotion } from '../care/CareContext'
import { SPRING, reveal, VIEWPORT_ONCE } from '../lib/motionPresets'
import { NBSP } from '../lib/format'
import { track } from '../lib/analytics'
import { reviews, type Review } from '../data/reviews'

/** Приглушённый сосед на сцене: декорация без интерактива */
function SideReviewCard({ review }: { review: Review }) {
  return (
    <figure className="card scale-[0.92] p-6 opacity-45 blur-[1px]">
      <blockquote className="line-clamp-4 text-[15px] leading-relaxed">{review.text}</blockquote>
      <figcaption className="mt-4 text-[13px] font-medium text-ink-soft">
        {review.name}, {review.age}
      </figcaption>
    </figure>
  )
}

export default function Reviews({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1])
  const reduceMotion = useCalmMotion()

  const go = (delta: number) => {
    setIndex(([i]) => [(i + delta + reviews.length) % reviews.length, delta > 0 ? 1 : -1])
  }

  const review = reviews[index]
  const prev = reviews[(index - 1 + reviews.length) % reviews.length]
  const next = reviews[(index + 1) % reviews.length]
  const initials = review.name[0]

  const handleQuizCta = () => {
    track('cta_click', { section: 'reviews_cta' })
    onOpenQuiz()
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <motion.div
          variants={reveal}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          <p className="eyebrow">Отзывы</p>
          <h2 className="mt-3 text-4xl md:text-5xl">После сессий говорят так</h2>
          {/* Проверяемое, а не заявленное: рейтинги живут на независимых площадках */}
          <p className="mt-4 text-[14.5px] text-ink-soft">
            {`4,8${NBSP}из${NBSP}5 в App${NBSP}Store и Google${NBSP}Play · 800+ отзывов на${NBSP}независимых площадках`}
          </p>
        </motion.div>

        {/* Сцена: активная история в фокусе, соседние — приглушены по бокам */}
        <div className="mt-12 md:grid md:grid-cols-[1fr_1.6fr_1fr] md:items-center md:gap-4">
          <div aria-hidden="true" className="pointer-events-none hidden md:block">
            <SideReviewCard review={prev} />
          </div>

          <div className="overflow-hidden md:overflow-visible">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                className="card cursor-grab p-7 active:cursor-grabbing"
                initial={reduceMotion ? false : { opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1)
                  else if (info.offset.x > 60) go(-1)
                }}
              >
                <blockquote className="text-[17px] leading-relaxed">{review.text}</blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-azure/50 to-sky/50 font-display text-[15px]"
                  >
                    {initials}
                  </span>
                  <span className="text-[14.5px] font-medium text-ink-soft">
                    {review.name}, {review.age}, {review.occupation}
                  </span>
                  <span className="rounded-full bg-sky-soft px-2.5 py-1 text-[12.5px] text-ink">
                    {review.topicLabel}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div aria-hidden="true" className="pointer-events-none hidden md:block">
            <SideReviewCard review={next} />
          </div>
        </div>

        {/* Управление */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Предыдущий отзыв"
              className="flex size-11 items-center justify-center rounded-full border border-line bg-paper transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-mist active:scale-95"
              onClick={() => go(-1)}
            >
              <ArrowLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Следующий отзыв"
              className="flex size-11 items-center justify-center rounded-full border border-line bg-paper transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-mist active:scale-95"
              onClick={() => go(1)}
            >
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
          <div className="flex gap-2">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-label={`Отзыв ${i + 1}`}
                className={`size-2 rounded-full transition-[background-color,transform] ${
                  i === index ? 'scale-125 bg-sky-deep' : 'bg-ink/20 hover:bg-ink/40'
                }`}
                onClick={() => setIndex([i, i > index ? 1 : -1])}
              />
            ))}
          </div>
        </div>

        {/* Мостик к подбору */}
        <div className="mt-10 flex justify-center">
          <button type="button" className="btn-secondary" onClick={handleQuizCta}>
            {`Хочу так же${NBSP}— подобрать психолога`}
          </button>
        </div>
      </div>
    </section>
  )
}
