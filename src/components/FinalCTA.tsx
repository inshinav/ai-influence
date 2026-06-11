import { motion } from 'motion/react'
import { track } from '../lib/analytics'
import { useCalmMotion } from '../care/CareContext'

export default function FinalCTA({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const reduceMotion = useCalmMotion()

  return (
    <section className="py-24 md:py-32">
      <div className="container-x">
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mx-auto max-w-3xl font-display text-4xl md:text-6xl">
            {'Первый шаг — самый короткий'}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            {'2 минуты — и вы увидите своих психологов. Регистрация — только когда решите закрепить время.'}
          </p>
          <div className="mt-9">
            <button
              type="button"
              className="btn-primary !px-9 !py-4 text-[17px]"
              onClick={() => {
                track('cta_click', { section: 'final' })
                onOpenQuiz()
              }}
            >
              {'Подобрать психолога — 2 минуты'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
