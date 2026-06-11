import type { Transition, Variants } from 'motion/react'

/**
 * Motion-язык «Ясное небо 2.0»: пружинная физика + blur-in появления.
 * Один словарь на всё приложение — никаких «случайных» значений.
 */

/** Базовая пружина — «дорогое» ощущение вместо линейных переходов */
export const SPRING: Transition = { type: 'spring', stiffness: 120, damping: 18 }

/** Плотная пружина для микрореакций (чипы, кнопки, мелкие элементы) */
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 260, damping: 22 }

/** Мягкая кривая для затуханий/прозрачности, где пружина не нужна */
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const

/** Появление секции: blur-in + подъём. Использовать с whileInView + viewport once */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
}

/** Родитель оркестрованного stagger-появления детей */
export const revealParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

/** Стандартный viewport для whileInView-появлений */
export const VIEWPORT_ONCE = { once: true, margin: '-80px' } as const
