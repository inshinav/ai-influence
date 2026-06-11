import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { faq } from '../data/faq'

const EASE = [0.22, 1, 0.36, 1] as const

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="eyebrow">Вопросы</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Частые вопросы</h2>
        </motion.div>

        <div className="mt-10 max-w-2xl">
          {faq.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="border-b border-line">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="shrink-0 text-ink-soft"
                  >
                    <Plus size={20} aria-hidden />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-[15.5px] leading-relaxed text-ink-soft">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
