import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { track } from '../lib/analytics'
import { useCalmMotion } from '../care/CareContext'

export default function StickyCTA({
  hidden,
  onOpenQuiz,
}: {
  hidden: boolean
  onOpenQuiz: () => void
}) {
  const [heroGone, setHeroGone] = useState(false)
  const reduceMotion = useCalmMotion()

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setHeroGone(!entry.isIntersecting)
    })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {heroGone && !hidden && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-white/85 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-xl md:hidden"
          initial={reduceMotion ? { y: 0 } : { y: 80 }}
          animate={{ y: 0 }}
          exit={reduceMotion ? { y: 0 } : { y: 80 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              track('cta_click', { section: 'sticky' })
              onOpenQuiz()
            }}
          >
            {'Подобрать психолога · 2 мин'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
