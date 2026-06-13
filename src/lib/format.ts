// Форматирование чисел в русской типографике: NBSP как разделитель разрядов,
// проценты с запятой. Один источник правды, чтобы метрики везде выглядели одинаково.

const NBSP = ' '

/** Целое число с неразрывными пробелами между разрядами: 12000 → «12 000». */
export function formatInt(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

/** Процент: 8.4 → «8,4%», 61 → «61%». Десятичная запятая по-русски. */
export function formatPct(value: number): string {
  const rounded = Math.round(value * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',')
  return `${text}%`
}

/** Рубли: 690 → «690 ₽». */
export function formatRub(value: number): string {
  return `${formatInt(value)}${NBSP}₽`
}
