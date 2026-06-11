import {
  CloudDrizzle,
  HeartHandshake,
  Sparkles,
  BatteryLow,
  Leaf,
  Home,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import type { TopicId } from '../types'

export type Topic = {
  id: TopicId
  /** Название для чипов и фильтров */
  label: string
  /** Форма для строки-резюме и причин матчинга («Работает с тревогой») */
  withLabel: string
  icon: LucideIcon
}

export const topics: Topic[] = [
  { id: 'anxiety', label: 'Тревога и страхи', withLabel: 'тревогой', icon: CloudDrizzle },
  { id: 'relationships', label: 'Отношения', withLabel: 'отношениями', icon: HeartHandshake },
  { id: 'self-esteem', label: 'Самооценка', withLabel: 'самооценкой', icon: Sparkles },
  { id: 'burnout', label: 'Выгорание и апатия', withLabel: 'выгоранием', icon: BatteryLow },
  { id: 'loss', label: 'Потеря и перемены', withLabel: 'потерей и переменами', icon: Leaf },
  { id: 'family', label: 'Семья и дети', withLabel: 'семейными темами', icon: Home },
  { id: 'unknown', label: '«Не знаю — просто тяжело»', withLabel: 'неясными состояниями', icon: HelpCircle },
]

export const topicById = (id: TopicId): Topic => topics.find((t) => t.id === id) ?? topics[6]

/** Короткие подписи для чипов в hero (компактнее полных названий) */
export const heroChips: { id: TopicId; label: string }[] = [
  { id: 'anxiety', label: 'Тревога' },
  { id: 'relationships', label: 'Отношения' },
  { id: 'burnout', label: 'Выгорание' },
  { id: 'self-esteem', label: 'Самооценка' },
  { id: 'loss', label: 'Потеря и перемены' },
  { id: 'unknown', label: '«Просто тяжело»' },
]
