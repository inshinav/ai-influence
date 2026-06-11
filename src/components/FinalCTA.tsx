import { motion } from 'motion/react'
import { track } from '../lib/analytics'
import { useCalmMotion } from '../care/CareContext'
import { reveal, revealParent, VIEWPORT_ONCE } from '../lib/motionPresets'
import { ScribbleUnderline } from './Scribble'

/** Финальный заход на пике уверенности: лёгкий быстрый старт на ясном небе */
export default function FinalCTA({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const calm = useCalmMotion()

  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      {/* Атмосфера: ясное небо с тёплым краем у горизонта */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-soft/45 to-azure/25" />
        <div
          className="absolute inset-x-0 bottom-0 h-44"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 100%, rgba(255,217,168,0.35), transparent 70%)',
          }}
        />
        {!calm && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/15 blur-[110px]"
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="grain absolute inset-0" />
      </div>

      <motion.div
        className="container-x relative text-center"
        variants={revealParent}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT_ONCE}
      >
        <motion.h2
          variants={reveal}
          className="mx-auto max-w-3xl text-4xl md:text-6xl"
        >
          {'Первый шаг — '}
          <span className="relative inline-block">
            самый короткий
            <ScribbleUnderline className="absolute -bottom-2 left-0" delay={500} />
          </span>
        </motion.h2>
        <motion.p variants={reveal} className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          {'2 минуты — и вы увидите своих психологов. Регистрация — только когда решите закрепить время.'}
        </motion.p>
        <motion.div variants={reveal} className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            className="btn-primary !px-10 !py-4 text-[17px]"
            onClick={() => {
              track('cta_click', { section: 'final' })
              onOpenQuiz()
            }}
          >
            {'Подобрать психолога — 2 минуты'}
          </button>
          <span className="hand text-[22px]">и без регистрации</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
