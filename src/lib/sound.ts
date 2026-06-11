/**
 * Звуковой слой: тактичные синтезированные микро-звуки (Web Audio, без файлов).
 * По умолчанию ВЫКЛЮЧЕН. Управляется «Панелью заботы»; «Тихий режим» — kill-switch.
 */

let ctx: AudioContext | null = null
let enabled = false

export function setSoundEnabled(value: boolean): void {
  enabled = value
  if (!value && ctx && ctx.state === 'running') {
    void ctx.suspend()
  }
}

export function isSoundEnabled(): boolean {
  return enabled
}

function ensureContext(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Мягкий синусовый тон с плавной атакой и затуханием. Громкость намеренно низкая. */
function tone(freq: number, duration: number, peak = 0.035): void {
  const ac = ensureContext()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const now = ac.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + Math.min(0.08, duration / 3))
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + duration + 0.05)
}

/** Короткий «тик» перехода (шаг теста, переключение экрана) */
export function transitionTick(): void {
  tone(523.25, 0.16, 0.02)
}

/** Тёплое подтверждение (результат, завершение) */
export function softChime(): void {
  tone(392, 0.5, 0.03)
  window.setTimeout(() => tone(523.25, 0.6, 0.025), 120)
}

/** Дыхательные ориентиры: вдох выше, задержка ровная, выдох ниже */
export function breathCue(kind: 'inhale' | 'hold' | 'exhale'): void {
  if (kind === 'inhale') tone(392, 0.6, 0.03)
  else if (kind === 'hold') tone(329.63, 0.4, 0.02)
  else tone(261.63, 0.9, 0.03)
}
