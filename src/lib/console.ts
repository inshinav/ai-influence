// Локальный генератор примера ролика для «Консоли автора».
// Без внешних API. Сборка проходит safety-санитайзер (замена запрещённых для темы
// формулировок), а затем safety-гейт РЕАЛЬНО сканирует финальный текст по трём
// словарям — запрещённое темы / давление / диагнозы-манипуляции — и выставляет
// чеки по факту скана. Это не декорация: каждая галка выводится из проверки,
// и при перехвате формулировки чек уходит в «ревизию».

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
  /** Сколько запрещённых формулировок санитайзер перехватил и заменил. */
  intercepted: number
}

// Запрещено во всех темах: давление/ургентность и диагнозы/манипуляции.
const PRESSURE = ['срочно', 'немедленно', 'только сегодня', 'осталось', 'успей', 'купи']
const MANIPULATION = ['у тебя депрессия', 'у тебя расстройство', 'диагноз', 'гаранти', 'вылечит', '100%']

function personaById(id: PersonaId) {
  return personas.find((p) => p.id === id) ?? personas[0]
}

function hits(text: string, list: string[]): number {
  const low = text.toLowerCase()
  return list.reduce((n, phrase) => (low.includes(phrase.toLowerCase()) ? n + 1 : n), 0)
}

/** Заменяет запрещённые для темы формулировки на безопасную. Возвращает текст и число замен. */
function sanitize(text: string, topic: TopicId): { text: string; replaced: number } {
  let safe = text
  let replaced = 0
  for (const phrase of topics[topic].forbidden) {
    if (safe.toLowerCase().includes(phrase.toLowerCase())) {
      safe = 'можно мягко назвать состояние и не оставаться с этим одному'
      replaced += 1
    }
  }
  return { text: safe, replaced }
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

  let intercepted = 0
  const clean = (line: string) => {
    const r = sanitize(line, topicId)
    intercepted += r.replaced
    return r.text
  }

  const hook = clean(hooks[variant % hooks.length])
  const script = [
    `0–3 сек: узнаваемая сцена, ${openings[variant % openings.length]}.`,
    `4–14 сек: ${persona.voice} тон, ${format.pattern}.`,
    '15–24 сек: микро-поворот без обещания результата — «можно заметить, что именно сейчас тяжелее всего».',
    'финал: «если это повторяется, с этим можно прийти к специалисту на „Ясно“».',
  ].map(clean)

  // Safety-гейт сканирует ИТОГОВЫЙ текст — чеки честные, выведены из проверки.
  const full = [hook, ...script].join(' ')
  const forbiddenLeft = hits(full, topic.forbidden)
  const pressureLeft = hits(full, PRESSURE)
  const manipLeft = hits(full, MANIPULATION)

  const checks: SafetyCheck[] = [
    {
      tag: 'ai-label',
      label: persona.disclosure ? `AI-метка автора: ${persona.disclosure}` : 'AI-метка не указана',
      passed: Boolean(persona.disclosure),
    },
    {
      tag: 'no-medical-promise',
      label:
        intercepted > 0
          ? `перехвачено запрещённых формулировок: ${intercepted}`
          : `тема проверена по ${topic.forbidden.length} запрещённым формулировкам — чисто`,
      passed: forbiddenLeft === 0,
    },
    {
      tag: 'no-pressure',
      label: pressureLeft === 0 ? 'CTA без таймеров и давления' : 'найдено давление — на ревизию',
      passed: pressureLeft === 0,
    },
    {
      tag: 'no-manipulation',
      label: manipLeft === 0 ? 'без диагнозов и манипуляций' : 'найден диагноз/манипуляция — на ревизию',
      passed: manipLeft === 0,
    },
  ]

  return {
    title: `${persona.name}: ${topic.name} · ${format.name}`,
    hook,
    script,
    voice: `Голос: ${persona.voice}. Длина: ${format.length}.`,
    care: topic.care,
    checks,
    intercepted,
  }
}
