import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { reviews } from '../data/reviews'

const EASE = [0.22, 1, 0.36, 1] as const

export default function Reviews() {
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1])

  const go = (delta: number) => {
    setIndex(([i]) => [(i + delta + reviews.length) % reviews.length, delta > 0 ? 1 : -1])
  }

  const review = reviews[index]
  const initials = review.name[0]

  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="eyebrow">Отзывы</p>
          <h2 className="mt-3 text-4xl md:text-5xl">После сессий говорят так</h2>
        </motion.div>

        <div className="mt-10 max-w-2xl">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                className="card cursor-grab p-7 active:cursor-grabbing"
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.3, ease: EASE }}
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
                    className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-peach/50 to-sky/50 font-display text-[15px]"
                  >
                    {initials}
                  </span>
                  <span className="text-[14.5px] font-medium text-ink-soft">
                    {review.name}, {review.age}, {review.occupation}
                  </span>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[12.5px]">
                    {review.topicLabel}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Предыдущий отзыв"
                className="flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:bg-mist"
                onClick={() => go(-1)}
              >
                <ArrowLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Следующий отзыв"
                className="flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:bg-mist"
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
                  className={`size-2 rounded-full transition-colors ${i === index ? 'bg-ink' : 'bg-ink/20'}`}
                  onClick={() => setIndex([i, i > index ? 1 : -1])}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
