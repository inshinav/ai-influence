import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { track } from '../lib/analytics'
import { useCalmMotion } from '../care/CareContext'

/**
 * Мобильная закреплённая CTA. Появляется, как только кнопки hero ушли
 * за край экрана (а не когда скрылась вся секция), и прячется во время
 * погружений — дыхательной практики и тестов: продавать поверх паузы
 * для себя — значит обесценить её.
 */
export default function StickyCTA({
  hidden,
  onOpenQuiz,
}: {
  hidden: boolean
  onOpenQuiz: () => void
}) {
  const [ctaGone, setCtaGone] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const reduceMotion = useCalmMotion()

  useEffect(() => {
    const cta = document.getElementById('hero-cta') ?? document.getElementById('hero')
    if (!cta) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setCtaGone(!entry.isIntersecting)
    })
    observer.observe(cta)
    return () => observer.disconnect()
  }, [])

  // Погружения: пока дыхание или тест занимают большую часть экрана — молчим
  useEffect(() => {
    const targets = ['breath', 'tests']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return
    const visible = new Map<Element, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target, entry.intersectionRatio > 0.45)
        setImmersive([...visible.values()].some(Boolean))
      },
      { threshold: [0, 0.45, 1] },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {ctaGone && !hidden && !immersive && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-paper/85 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-xl md:hidden"
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
            {'Подобрать психолога · 2 мин'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
