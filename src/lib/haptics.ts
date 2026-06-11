/** Деликатная тактильность на mobile. «Тихий режим» отключает полностью. */

let enabled = true

export function setHapticsEnabled(value: boolean): void {
  enabled = value
}

export function haptic(pattern: number | number[] = 8): void {
  if (!enabled) return
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  } catch {
    /* не поддерживается — молча */
  }
}
