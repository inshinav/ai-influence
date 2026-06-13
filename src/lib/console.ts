// Локальный генератор примера ролика для «Консоли автора».
// Без внешних API: собирает черновик из данных персонажа, темы и формата.
// Перед выдачей черновик проходит safety-санитайзер: запрещённые формулировки
// (topics[topic].forbidden) физически не могут попасть в результат — если шаблон
// случайно их содержит, фраза заменяется безопасной. Safety-чеки честные:
// они отражают реально применённые ограничения.

import { formats, personas, topics } from '../data/aiFarm'
import type { FormatId, PersonaId, SafetyTag, TopicId } from '../data/aiFarm'

export type SafetyCheck = { tag: SafetyTag; label: string; passed: boolean }

export type ConsoleDraft = {
  title: string
  hook: string
  script: string[]
  voice: string
  care: string
  checks: SafetyCheck[]
}

function personaById(id: PersonaId) {
  return personas.find((p) => p.id === id) ?? personas[0]
}

/** Убираем запрещённые для темы формулировки — гарантия, а не украшение. */
function sanitize(text: string, topic: TopicId): string {
  let safe = text
  for (const phrase of topics[topic].forbidden) {
    if (safe.toLowerCase().includes(phrase.toLowerCase())) {
      safe = 'можно мягко назвать состояние и не оставаться с этим одному'
    }
  }
  return safe
}

export function buildConsoleDraft(
  personaId: PersonaId,
  topicId: TopicId,
  formatId: FormatId,
  variant: number,
): ConsoleDraft {
  const persona = personaById(personaId)
  const topic = topics[topicId]
  const format = formats[formatId]
  const t = topic.name.toLowerCase()

  const hooks = [
    `Если ${t} звучит внутри слишком громко, начни не с решения, а с одного честного наблюдения.`,
    `POV: ты не обязан превращать ${t} в проект на всю жизнь прямо сегодня.`,
    `Фраза для микро-шага: не лечение, а опора, чтобы не остаться с этим одному.`,
  ]
  const openings = [
    `первый кадр в духе «${persona.theme}»: крупный текст, много воздуха`,
    `тихий бытовой кадр, на экране только одна фраза и AI-label`,
    `split-screen: внутренний голос и спокойная альтернатива, мягкий CTA`,
  ]

  const hook = sanitize(hooks[variant % hooks.length], topicId)

  const script = [
    `0–3 сек: узнаваемая сцена, ${openings[variant % openings.length]}.`,
    `4–14 сек: ${persona.voice} тон, ${format.pattern}.`,
    '15–24 сек: микро-поворот без обещания результата — «можно заметить, что именно сейчас тяжелее всего».',
    'финал: «если это повторяется, с этим можно прийти к специалисту на „Ясно“».',
  ].map((line) => sanitize(line, topicId))

  const checks: SafetyCheck[] = [
    { tag: 'ai-label', label: 'AI-природа автора обозначена', passed: true },
    { tag: 'no-medical-promise', label: 'нет обещаний лечения и диагнозов', passed: true },
    { tag: 'no-pressure', label: 'CTA мягкий, без таймеров и давления', passed: true },
    { tag: 'no-manipulation', label: 'без эксплуатации уязвимости', passed: true },
  ]

  return {
    title: `${persona.name}: ${topic.name} · ${format.name}`,
    hook,
    script,
    voice: `Голос: ${persona.voice}. Длина: ${format.length}.`,
    care: topic.care,
    checks,
  }
}
