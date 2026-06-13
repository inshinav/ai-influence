import { motion, useScroll, useSpring } from 'motion/react'

// Тонкая полоса прогресса чтения сверху — спокойный ориентир по длинному скроллу.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.5 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
