import { motion } from 'motion/react'
import { Check } from 'lucide-react'

type Item = { label: string; passed: boolean }

// Ряд safety-проверок. Анимируется с каскадом, когда нужно показать, что
// «безопасность встроена» как живой процесс, а не статичная плашка.
export function SafetyChecks({ items, animate = false }: { items: Item[]; animate?: boolean }) {
  return (
    <ul className="safety-checks">
      {items.map((item, index) => (
        <motion.li
          key={item.label}
          className={item.passed ? 'is-pass' : 'is-warn'}
          initial={animate ? { opacity: 0, x: -8 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: animate ? 0.15 * index : 0, duration: 0.3 }}
        >
          <Check size={14} strokeWidth={3} />
          {item.label}
        </motion.li>
      ))}
    </ul>
  )
}
