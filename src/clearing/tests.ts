import type { TopicId } from '../types'

/**
 * «Расчистка»: данные трёх мини-тестов как отдающего разговора.
 * Каждый вариант ответа несёт своё «отражение» — короткую бережную реплику
 * сервиса в ответ на ответ человека. Карта реакций уникальна на (вопрос × ответ).
 * Ответы не покидают браузер: модуль — чистые данные, без сети.
 */

export type ClearingTestId = 'anxiety-test' | 'burnout-test' | 'fit-test'

export type ResultCopy = {
  title: string
  text: string
}

export type ChoiceOption = {
  label: string
  score: number
  /** Одна строка эмпатичного отражения: бережно, без диагнозов */
  reflection: string
}

export type ChoiceQuestion = {
  kind: 'choice'
  text: string
  options: ChoiceOption[]
}

/** Полоса значений слайдера: value <= upTo → балл и отражение */
export type SliderBand = {
  upTo: number
  score: number
  reflection: string
}

export type SliderQuestion = {
  kind: 'slider'
  text: string
  minLabel: string
  maxLabel: string
  /** Отсортированы по upTo; последняя полоса покрывает максимум шкалы */
  bands: SliderBand[]
}

export type ClearingQuestion = ChoiceQuestion | SliderQuestion

/** Бесплатный инструмент, который отдаём вместе с результатом — до любых CTA */
export type FreeTool =
  | { kind: 'breath'; title: string; text: string; cta: string; target: string }
  | { kind: 'steps'; title: string; text: string; steps: string[] }
  | { kind: 'weekly-question'; title: string; text: string; question: string }

/** Правило тяжёлой ветки (вместо результата — экран поддержки) */
export type HeavyRule =
  | { kind: 'sum-or-all-max'; minSum: number }
  | { kind: 'all-yes-choices' }

export type ClearingTest = {
  id: ClearingTestId
  tab: string
  /** Пометка рядом с прогрессом, например «скрининг GAD-2» */
  note?: string
  topic: TopicId
  /** Строка-контекст над вопросами */
  intro?: string
  questions: ClearingQuestion[]
  /** Сумма баллов, начиная с которой показываем «повышенный» результат */
  threshold: number
  /** Порог тяжёлой ветки и её бережная вводная */
  heavy?: { rule: HeavyRule; lead: string }
  elevated: ResultCopy
  ok: ResultCopy
  tool: FreeTool
}

/** Полоса слайдера для конкретного значения 0–10 */
export function bandFor(question: SliderQuestion, value: number): SliderBand {
  return (
    question.bands.find((band) => value <= band.upTo) ??
    question.bands[question.bands.length - 1]
  )
}

function maxQuestionScore(question: ClearingQuestion): number {
  if (question.kind === 'choice') return Math.max(...question.options.map((o) => o.score))
  return Math.max(...question.bands.map((b) => b.score))
}

/** Сработал ли порог тяжёлой ветки по набранным баллам */
export function isHeavy(test: ClearingTest, scores: number[]): boolean {
  const heavy = test.heavy
  if (!heavy || scores.length < test.questions.length) return false
  if (heavy.rule.kind === 'sum-or-all-max') {
    const sum = scores.reduce((a, b) => a + b, 0)
    const allMax = test.questions.every((q, i) => scores[i] >= maxQuestionScore(q))
    return sum >= heavy.rule.minSum || allMax
  }
  // all-yes-choices: все вопросы «да/нет» отвечены максимальным баллом
  return test.questions.every((q, i) => q.kind !== 'choice' || scores[i] >= maxQuestionScore(q))
}

export const CLEARING_TESTS: ClearingTest[] = [
  {
    id: 'anxiety-test',
    tab: 'Уровень тревоги',
    note: 'скрининг GAD-2',
    topic: 'anxiety',
    intro: 'Как часто за последние 2 недели вас беспокоили:',
    questions: [
      {
        kind: 'choice',
        text: 'Нервозность, тревога, ощущение „на взводе“',
        options: [
          {
            label: 'Совсем нет',
            score: 0,
            reflection: 'Хорошо, когда тревога — не фон жизни. Пусть так и остаётся.',
          },
          {
            label: 'Несколько дней',
            score: 1,
            reflection: 'Несколько неспокойных дней случаются у каждого. Важно, что вы их замечаете.',
          },
          {
            label: 'Больше половины дней',
            score: 2,
            reflection: 'Когда тревожных дней больше половины — это уже не эпизод, а фон. Вы в этом не одни.',
          },
          {
            label: 'Почти каждый день',
            score: 3,
            reflection: 'Просыпаться с тревогой почти каждый день — это изматывает. Многие отмечают то же.',
          },
        ],
      },
      {
        kind: 'choice',
        text: 'Неспособность прекратить или контролировать беспокойство',
        options: [
          {
            label: 'Совсем нет',
            score: 0,
            reflection: 'Хорошо, когда беспокойство получается отпускать. Это ценный навык.',
          },
          {
            label: 'Несколько дней',
            score: 1,
            reflection: 'Иногда мысли цепляются одна за другую — это знакомо многим.',
          },
          {
            label: 'Больше половины дней',
            score: 2,
            reflection: 'Беспокойство, которое не выключается большую часть дней, отнимает много сил. Это не слабость.',
          },
          {
            label: 'Почти каждый день',
            score: 3,
            reflection: 'Беспокойство, которое не остановить, выматывает сильнее всего. Спасибо, что отвечаете честно.',
          },
        ],
      },
    ],
    threshold: 3,
    heavy: {
      rule: { kind: 'sum-or-all-max', minSum: 5 },
      lead: 'Спасибо за честные ответы. Похоже, сейчас вам действительно тяжело — и с этим не нужно оставаться один на один.',
    },
    elevated: {
      title: 'Повышенный уровень тревоги',
      text: 'Похоже, тревога занимает в вашей жизни заметное место. Это не диагноз — но тревога, которая мешает жить, хорошо поддаётся терапии.',
    },
    ok: {
      title: 'Выраженной тревоги не видно',
      text: 'Если беспокойство всё же возвращается — разовая консультация поможет понять, что за ним стоит.',
    },
    tool: {
      kind: 'breath',
      title: 'Дыхание 4-7-8 — попробуйте прямо сейчас',
      text: 'Вдох на 4 счёта, пауза на 7, выдох на 8. Несколько кругов — и нервная система получает сигнал, что можно отпустить.',
      cta: 'Попробовать дыхание',
      target: '#breath',
    },
  },
  {
    id: 'burnout-test',
    tab: 'Выгорание',
    topic: 'burnout',
    questions: [
      {
        kind: 'choice',
        text: 'Усталость не проходит даже после выходных',
        options: [
          {
            label: 'Да',
            score: 1,
            reflection: 'Усталость, которую не лечат выходные, — важный сигнал. Хорошо, что вы его замечаете.',
          },
          {
            label: 'Нет',
            score: 0,
            reflection: 'Хорошо, что отдых пока восстанавливает. Это главный ресурс — берегите его.',
          },
        ],
      },
      {
        kind: 'slider',
        text: 'Насколько вы истощены к вечеру?',
        minLabel: 'совсем нет',
        maxLabel: 'очень сильно',
        bands: [
          {
            upTo: 1,
            score: 0,
            reflection: 'Похоже, к вечеру силы ещё остаются. Это хороший знак.',
          },
          {
            upTo: 3,
            score: 0,
            reflection: 'Лёгкая усталость к вечеру — нормальная плата за день, если ночь её забирает.',
          },
          {
            upTo: 5,
            score: 1,
            reflection: 'Середина шкалы — повод присмотреться, куда уходят силы днём.',
          },
          {
            upTo: 7,
            score: 1,
            reflection: 'Ощутимое истощение к вечеру накапливается день за днём. Это правда тяжело.',
          },
          {
            upTo: 10,
            score: 2,
            reflection: 'Почти на нуле к вечеру — так жить очень тяжело. Спасибо, что не приукрашиваете.',
          },
        ],
      },
      {
        kind: 'choice',
        text: 'Работа, которая радовала, теперь раздражает',
        options: [
          {
            label: 'Да',
            score: 1,
            reflection: 'Когда любимое дело начинает раздражать — это чаще про усталость, чем про само дело.',
          },
          {
            label: 'Нет',
            score: 0,
            reflection: 'Дело всё ещё откликается — значит, контакт с ним не потерян.',
          },
        ],
      },
      {
        kind: 'choice',
        text: 'Всё чаще ловите себя на мысли „откладываю жизнь на потом“',
        options: [
          {
            label: 'Да',
            score: 1,
            reflection: '«Потом» редко наступает само. Хорошо, что вы заметили это сейчас.',
          },
          {
            label: 'Нет',
            score: 0,
            reflection: 'Похоже, жизнь происходит с вами сейчас, а не откладывается. Это ценно.',
          },
        ],
      },
    ],
    threshold: 3,
    heavy: {
      rule: { kind: 'all-yes-choices' },
      lead: 'Спасибо за честность. Похоже, силы почти на нуле. Это не лень и не слабость — это сигнал, что вам давно нужна передышка и поддержка.',
    },
    elevated: {
      title: 'Похоже на признаки выгорания',
      text: 'Выгорание развивается медленно и само не проходит. Хорошая новость: с ним умеют работать — и чем раньше начать, тем проще вернуть силы.',
    },
    ok: {
      title: 'Критичных признаков не видно',
      text: 'Если усталость всё же копится — стоит разобраться, что её создаёт, пока она не стала фоном.',
    },
    tool: {
      kind: 'steps',
      title: 'Микро-переформулировка: три шага',
      text: 'Маленький приём из когнитивно-поведенческого подхода. Займёт пару минут.',
      steps: [
        'Поймайте мысль, которая давит сильнее всего. Например: «я не вывожу».',
        'Спросите себя: что бы вы сказали близкому человеку, который так думает о себе?',
        'Скажите это себе — теми же словами. Например: «мне нужна передышка. Это не провал, а сигнал».',
      ],
    },
  },
  {
    id: 'fit-test',
    tab: 'Подойдёт ли мне терапия?',
    topic: 'unknown',
    questions: [
      {
        kind: 'choice',
        text: 'Замечаете повторяющиеся сценарии — в отношениях, работе, настроении',
        options: [
          {
            label: 'Да',
            score: 1,
            reflection: 'Увидеть повторяющийся сценарий — уже половина пути. Дальше обычно легче.',
          },
          {
            label: 'Нет',
            score: 0,
            reflection: 'Изнутри сценарии видны хуже всего — и это нормально. Возможно, их и правда нет.',
          },
        ],
      },
      {
        kind: 'choice',
        text: 'Хочется разобраться в себе, но в одиночку не получается',
        options: [
          {
            label: 'Да',
            score: 1,
            reflection: 'В одиночку и не должно получаться всё. Просить поддержки — навык, а не слабость.',
          },
          {
            label: 'Нет',
            score: 0,
            reflection: 'Справляться самостоятельно — ценный навык. Терапия его не отменяет, а дополняет.',
          },
        ],
      },
      {
        kind: 'choice',
        text: 'Готовы уделять себе час в неделю',
        options: [
          {
            label: 'Да',
            score: 1,
            reflection: 'Час в неделю на себя — это забота, а не роскошь. Хорошее начало.',
          },
          {
            label: 'Нет',
            score: 0,
            reflection: 'Если часа пока нет — это тоже честный ответ. Возможно, именно с него стоит начать разговор.',
          },
        ],
      },
    ],
    threshold: 2,
    elevated: {
      title: 'Терапия, скорее всего, вам подойдёт',
      text: 'Запрос не обязан быть чётким — сформулировать его помогает сам психолог на первой сессии. Решение всегда за вами.',
    },
    ok: {
      title: 'Можно начать с малого',
      text: 'Даже одна сессия помогает понять, нужно ли вам это сейчас. Спешить некуда.',
    },
    tool: {
      kind: 'weekly-question',
      title: 'Вопрос себе на неделю',
      text: 'Возвращайтесь к нему каждый вечер — без оценок, просто замечайте ответ. Через неделю он расскажет больше любого теста.',
      question: 'Что я сегодня сделал(а) для себя — не для дел, а для себя?',
    },
  },
]
