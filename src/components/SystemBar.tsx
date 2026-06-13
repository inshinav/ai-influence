import { motion } from 'motion/react'
import { Activity, Gauge, MonitorSmartphone, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { systemBar } from '../data/aiFarm'

const ICONS: Record<string, LucideIcon> = {
  creators: Activity,
  devices: MonitorSmartphone,
  safety: ShieldCheck,
  loop: Gauge,
}

// Тонкая сводка системы под hero. Значения берутся из data (один источник правды).
export function SystemBar() {
  return (
    <motion.div
      className="systembar"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      aria-label="Сводка системы"
    >
      {systemBar.map((item) => {
        const Icon = ICONS[item.icon] ?? Activity
        return (
          <span key={item.icon}>
            <Icon size={16} />
            {item.value}
          </span>
        )
      })}
    </motion.div>
  )
}
