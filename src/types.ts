/** Общие типы прототипа. Единый источник правды для данных, квиза и матчинга. */

export type TopicId =
  | 'anxiety'
  | 'relationships'
  | 'self-esteem'
  | 'burnout'
  | 'loss'
  | 'family'
  | 'unknown'

export type TherapyFormat = 'individual' | 'couple' | 'teen'

export type TimePref = 'morning' | 'day' | 'evening' | 'weekend'

export type Method = 'КПТ' | 'Гештальт' | 'Психоанализ' | 'Системная'

/** Предпочтение по методу: 'any' = «Доверюсь подбору» */
export type MethodPref = 'any' | Method

/** Предпочтение по полу психолога: 'any' = «Не важно» */
export type GenderPref = 'any' | 'f' | 'm'

export type Therapist = {
  id: string
  name: string
  /** URL фото; при ошибке загрузки карточка показывает инициалы на градиенте */
  photo: string
  gender: 'f' | 'm'
  method: Method
  experienceYears: number
  topics: TopicId[]
  formats: TherapyFormat[]
  schedule: TimePref[]
  price: number
  /** Одно живое предложение «как я работаю» */
  quote: string
  education: string
}

export type QuizAnswers = {
  format: TherapyFormat | null
  topics: TopicId[]
  hadTherapy: boolean | null
  gender: GenderPref | null
  method: MethodPref
  schedule: TimePref[]
}

export const emptyAnswers: QuizAnswers = {
  format: null,
  topics: [],
  hadTherapy: null,
  gender: null,
  method: 'any',
  schedule: [],
}

/** Как открыли оверлей: обычный квиз (возможно, с темой) или прямое бронирование психолога */
export type QuizLaunch =
  | { kind: 'quiz'; topic?: TopicId; source: string }
  | { kind: 'book'; therapist: Therapist; source: string }

export type SlotSelection = {
  /** «чт, 13 июня» */
  dateLabel: string
  /** ISO-дата дня, например «2026-06-13» */
  isoDate: string
  /** «19:00» */
  time: string
}
