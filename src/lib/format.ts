/** Типографика русского языка: неразрывные пробелы, цены, склонения. */

export const NBSP = ' '

/** 3150 → «3 150 ₽» (неразрывные пробелы) */
export function formatPrice(price: number): string {
  const grouped = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${grouped}${NBSP}₽`
}

/** Склонение: 1 год / 2 года / 5 лет */
export function pluralYears(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n}${NBSP}год`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n}${NBSP}года`
  return `${n}${NBSP}лет`
}

/** «9 лет практики» */
export function experienceLabel(years: number): string {
  return `${pluralYears(years)} практики`
}
