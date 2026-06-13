// Единый язык движения: мягкие пружины и «проявление» при скролле.
// Всё декоративное — только transform/opacity/filter. Уважается prefers-reduced-motion
// (через CSS-медиазапрос + useReducedMotion в компонентах, где нужна логика).

// Кубическая кривая Безье как фиксированный кортеж — motion ждёт именно такой тип.
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Главная пружина интерфейса — спокойная, без перелёта. */
export const SPRING = { type: 'spring', stiffness: 140, damping: 22, mass: 0.9 } as const

/** Базовое «проявление» секции из тумана: вверх + лёгкое размытие. */
export const reveal = {
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-12% 0px -8% 0px' },
  transition: { duration: 0.7, ease: EASE_OUT },
}

/** Контейнер для каскада дочерних элементов. */
export const staggerParent = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-10% 0px' },
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  },
}

/** Дочерний элемент каскада. */
export const staggerChild = {
  variants: {
    hidden: { opacity: 0, y: 18, filter: 'blur(5px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE_OUT } },
  },
}

/** Появление с лёгким масштабом — для «выезжающих» панелей. */
export const popIn = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
  transition: { duration: 0.32, ease: EASE_OUT },
}
