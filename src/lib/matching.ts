import type { QuizAnswers, Therapist, TimePref, TopicId } from '../types'
import { topicById } from '../data/topics'
import { experienceLabel } from './format'

export type MatchResult = {
  therapist: Therapist
  score: number
  /** Нормализованный «процент совпадения» в честном диапазоне 86–97 */
  percent: number
  /** 2–3 человеческие причины для блока «Почему именно она/он» */
  reasons: string[]
}

/**
 * Прозрачный скоринг:
 *  +3 за каждую совпавшую тему · +2 формат · +2 пересечение расписания ·
 *  +2 метод (если выбран явно) · +1 пол (если указан).
 */
export function scoreTherapist(t: Therapist, a: QuizAnswers): number {
  let score = 0
  for (const topic of a.topics) {
    if (t.topics.includes(topic)) score += 3
  }
  if (a.format && t.formats.includes(a.format)) score += 2
  if (a.schedule.some((s) => t.schedule.includes(s))) score += 2
  if (a.method !== 'any' && t.method === a.method) score += 2
  if (a.gender && a.gender !== 'any' && t.gender === a.gender) score += 1
  return score
}

/** Максимально возможный балл для данных ответов — для нормализации в проценты */
function maxScore(a: QuizAnswers): number {
  let max = a.topics.length * 3
  if (a.format) max += 2
  if (a.schedule.length > 0) max += 2
  if (a.method !== 'any') max += 2
  if (a.gender && a.gender !== 'any') max += 1
  return Math.max(max, 1)
}

/** Сортировка по убыванию score (опыт — тонкая добавка), проценты 86–97 (без 100% — честнее) */
export function rankTherapists(all: Therapist[], a: QuizAnswers): MatchResult[] {
  const max = maxScore(a)
  return all
    .map((therapist) => {
      const score = scoreTherapist(therapist, a)
      // Непрерывная величина: скор задаёт базу, опыт мягко разводит равные скоры
      const fine = 85 + (score / max) * 8 + Math.min(therapist.experienceYears, 15) * 0.35
      return {
        therapist,
        score,
        fine,
        percent: Math.max(86, Math.min(Math.round(fine), 97)),
        reasons: explainMatch(therapist, a),
      }
    })
    .sort((x, y) => y.score - x.score || y.fine - x.fine)
    .map((r) => ({ therapist: r.therapist, score: r.score, percent: r.percent, reasons: r.reasons }))
}

const methodHints: Record<Therapist['method'], string> = {
  КПТ: 'КПТ — практичный подход, работа с мыслями и поведением',
  Гештальт: 'Гештальт — внимание к чувствам и тому, что происходит «здесь и сейчас»',
  Психоанализ: 'Психоанализ — глубокая работа с причинами, а не симптомами',
  Системная: 'Системная терапия — смотрит на отношения целиком, а не на одного человека',
}

const scheduleLabels: Record<string, string> = {
  morning: 'по утрам',
  day: 'днём',
  evening: 'по вечерам',
  weekend: 'в выходные',
}

/** Объяснимость = доверие: 2–3 причины, собранные из реальных совпадений */
export function explainMatch(t: Therapist, a: QuizAnswers): string[] {
  const reasons: string[] = []

  const matchedTopics = a.topics.filter((topic) => t.topics.includes(topic))
  if (matchedTopics.length > 0) {
    const names = matchedTopics
      .filter((id) => id !== 'unknown')
      .map((id) => topicById(id).withLabel)
    if (names.length > 0) {
      reasons.push(`Работает с ${names.slice(0, 2).join(' и ')} — ${experienceLabel(t.experienceYears)}`)
    } else {
      reasons.push(`Помогает разобраться, когда непонятно, что происходит, — ${experienceLabel(t.experienceYears)}`)
    }
  } else {
    reasons.push(`${experienceLabel(t.experienceYears)[0].toUpperCase()}${experienceLabel(t.experienceYears).slice(1)} и постоянные супервизии`)
  }

  if (a.method !== 'any' && t.method === a.method) {
    reasons.push(methodHints[t.method])
  } else if (a.method === 'any') {
    reasons.push(methodHints[t.method])
  }

  const matchedTimes = a.schedule.filter((s) => t.schedule.includes(s))
  if (matchedTimes.length > 0) {
    reasons.push(`Свободное время ${matchedTimes.map((s) => scheduleLabels[s]).join(' и ')} · ближайший слот: ${t.nextSlot}`)
  } else {
    reasons.push(`Ближайший свободный слот: ${t.nextSlot}`)
  }

  if (a.gender && a.gender !== 'any' && t.gender === a.gender && reasons.length < 3) {
    reasons.push(a.gender === 'f' ? 'Психолог-женщина — как вы и хотели' : 'Психолог-мужчина — как вы и хотели')
  }

  return reasons.slice(0, 3)
}

/** Родительный падеж имени: «у Дарьи», «у Павла». Покрывает все имена каталога. */
function genitiveName(name: string): string {
  if (name === 'Павел') return 'Павла'
  if (name.endsWith('я')) return `${name.slice(0, -1)}и`
  if (name.endsWith('а')) {
    const prev = name[name.length - 2]
    return `${name.slice(0, -1)}${'гкхжчшщ'.includes(prev) ? 'и' : 'ы'}`
  }
  if (name.endsWith('й')) return `${name.slice(0, -1)}я`
  return `${name}а`
}

/**
 * Одна человечная строка, которая цитирует ответы пользователя и связывает
 * их с конкретным психологом. index карточки смещает выбор среди применимых
 * вариантов, чтобы у трёх карточек по возможности были разные строки.
 */
export function quoteFromAnswers(t: Therapist, a: QuizAnswers, index = 0): string | null {
  /** Винительный падеж тем: «Вы отметили тревогу…» */
  const topicAccusative: Record<TopicId, string> = {
    anxiety: 'тревогу',
    burnout: 'выгорание',
    relationships: 'сложности в отношениях',
    'self-esteem': 'тему самооценки',
    loss: 'потерю и перемены',
    family: 'семейные вопросы',
    unknown: 'что сейчас тяжело',
  }

  const timeLabel: Record<TimePref, string> = {
    morning: 'утром',
    day: 'днём',
    evening: 'вечером',
    weekend: 'в выходные',
  }

  const firstName = t.name.split(' ')[0]
  const variants: string[] = []

  const matchedTopic = a.topics.find((topic) => t.topics.includes(topic))
  if (matchedTopic) {
    variants.push(
      matchedTopic === 'unknown'
        ? `Вы отметили, что сейчас тяжело\u00A0— ${firstName} работает именно с этим`
        : `Вы отметили ${topicAccusative[matchedTopic]}\u00A0— ${firstName} работает именно с этим`,
    )
  }

  if (a.hadTherapy === false) {
    variants.push(`Вы впервые в терапии\u00A0— ${firstName} бережно помогает освоиться`)
  }

  if (a.duration === 'always' || a.duration === 'year') {
    variants.push(`Вы живёте с этим давно\u00A0— ${firstName} умеет работать с долгими историями`)
  }

  const matchedTime = a.schedule.find((s) => t.schedule.includes(s))
  if (matchedTime) {
    variants.push(`Вам удобно ${timeLabel[matchedTime]}\u00A0— у ${genitiveName(firstName)} как раз есть это время`)
  }

  if (variants.length === 0) return null
  return variants[index % variants.length]
}
