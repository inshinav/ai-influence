/**
 * PNG-карточка результата: рисуется полностью на клиенте (canvas 2D, без
 * библиотек) и сразу уходит в загрузки. Ничего никуда не отправляется.
 */

const W = 1080
const H = 1350
const PAD = 96

const INK = '#16181d'
const INK_SOFT = '#5a6573'
const PAPER = '#ffffff'
const SKY = '#279be0'
const LINE = 'rgba(22, 24, 29, 0.12)'

const FONT_DISPLAY = "'Geologica Variable', Geologica, Inter, system-ui, sans-serif"
const FONT_SANS = "'Inter Variable', Inter, system-ui, sans-serif"

export type ResultCardOptions = {
  /** Название теста, например «Уровень тревоги» */
  testName: string
  /** Заголовок результата */
  title: string
  /** 1–2 строки расшифровки */
  text: string
  /** Имя файла без расширения */
  fileName?: string
}

/** Мягкое рассветное пятно: радиальный градиент к прозрачному той же температуры */
function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  inner: string,
  outer: string,
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
  gradient.addColorStop(0, inner)
  gradient.addColorStop(1, outer)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)
}

/** Перенос по словам; NBSP внутри «слов» сохраняет связки вида «2 недели» */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const probe = current === '' ? word : `${current} ${word}`
    if (current !== '' && ctx.measureText(probe).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = probe
    }
  }
  if (current !== '') lines.push(current)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s,;:.]+$/u, '')}…`
    return kept
  }
  return lines
}

/** Лёгкая разрядка для eyebrow-строки (canvas не умеет letter-spacing везде) */
function spaced(text: string): string {
  return text.split('').join(' ')
}

export async function downloadResultCard(opts: ResultCardOptions): Promise<void> {
  // Дожидаемся шрифтов документа, чтобы Geologica/Inter попали в карточку
  try {
    await Promise.all([
      document.fonts.load(`650 72px ${FONT_DISPLAY}`),
      document.fonts.load(`400 34px ${FONT_SANS}`),
      document.fonts.load(`600 26px ${FONT_SANS}`),
      document.fonts.ready,
    ])
  } catch {
    /* шрифты не загрузились — нарисуем системными */
  }

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Бумага + мягкий рассветный градиент (sun / peach / sky с низкой альфой)
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)
  glow(ctx, W * 0.82, H * 0.12, 640, 'rgba(39, 155, 224, 0.18)', 'rgba(39, 155, 224, 0)')
  glow(ctx, W * 0.12, H * 0.34, 560, 'rgba(95, 194, 240, 0.16)', 'rgba(95, 194, 240, 0)')
  glow(ctx, W * 0.5, H * 0.97, 700, 'rgba(255, 217, 168, 0.20)', 'rgba(255, 217, 168, 0)')

  ctx.textBaseline = 'alphabetic'

  // Логотип «ясно·» — жёлтая точка после серифного слова
  ctx.fillStyle = INK
  ctx.font = `800 64px ${FONT_DISPLAY}`
  const logoBaseline = PAD + 52
  ctx.fillText('ЯСНО', PAD, logoBaseline)
  const logoWidth = ctx.measureText('ЯСНО').width
  ctx.fillStyle = SKY
  ctx.beginPath()
  ctx.arc(PAD + logoWidth + 22, logoBaseline - 9, 11, 0, Math.PI * 2)
  ctx.fill()

  // Название теста — eyebrow с разрядкой
  ctx.fillStyle = INK_SOFT
  ctx.font = `600 26px ${FONT_SANS}`
  ctx.fillText(spaced(opts.testName.toUpperCase()), PAD, 332)

  // Заголовок результата
  ctx.fillStyle = INK
  ctx.font = `650 72px ${FONT_DISPLAY}`
  const titleLines = wrapLines(ctx, opts.title, W - PAD * 2, 3)
  let y = 430
  for (const line of titleLines) {
    ctx.fillText(line, PAD, y)
    y += 84
  }

  // Расшифровка
  ctx.fillStyle = INK_SOFT
  ctx.font = `400 34px ${FONT_SANS}`
  const textLines = wrapLines(ctx, opts.text, W - PAD * 2, 5)
  y += 12
  for (const line of textLines) {
    ctx.fillText(line, PAD, y)
    y += 52
  }

  // Нижний блок: дата и приглашение вернуться
  ctx.strokeStyle = LINE
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD, 1040)
  ctx.lineTo(W - PAD, 1040)
  ctx.stroke()

  const date = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  ctx.fillStyle = INK
  ctx.font = `500 30px ${FONT_SANS}`
  ctx.fillText(date, PAD, 1108)

  ctx.fillStyle = INK_SOFT
  ctx.font = `400 28px ${FONT_SANS}`
  ctx.fillText('вернитесь через 2 недели — сравните ощущения', PAD, 1158)

  // Дисклеймер
  ctx.fillStyle = 'rgba(91, 95, 104, 0.8)'
  ctx.font = `400 24px ${FONT_SANS}`
  ctx.fillText('Экспресс-скрининг для саморефлексии, не диагноз', PAD, H - PAD + 10)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
  if (!blob) return

  // Мобайл: системный шеринг-лист — карточку можно сразу переслать,
  // а не искать в «Загрузках». Отказ человека — не повод навязывать файл.
  const file = new File([blob], `${opts.fileName ?? 'yasno-result'}.png`, { type: 'image/png' })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      /* share не получился — падаем в обычное скачивание */
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${opts.fileName ?? 'yasno-result'}.png`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
