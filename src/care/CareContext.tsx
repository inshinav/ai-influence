import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'motion/react'
import { setSoundEnabled } from '../lib/sound'
import { setHapticsEnabled } from '../lib/haptics'

/**
 * «Панель заботы»: доступность как видимая забота, а не настройки в шестерёнке.
 * Тихий режим — жёсткий kill-switch: убирает движение, звук и тактильность разом.
 */
export type CareSettings = {
  /** Тихий режим: никакого движения, звука и вибрации */
  quiet: boolean
  /** Больше контраста: темнее вторичный текст и линии */
  contrast: boolean
  /** Крупнее текст */
  largeText: boolean
  /** Меньше анимации (декоративное — выкл, функциональное — мгновенно) */
  lessMotion: boolean
  /** Звуковой слой (по умолчанию выключен) */
  sound: boolean
}

const DEFAULTS: CareSettings = {
  quiet: false,
  contrast: false,
  largeText: false,
  lessMotion: false,
  sound: false,
}

type CareContextValue = {
  settings: CareSettings
  setSetting: <K extends keyof CareSettings>(key: K, value: CareSettings[K]) => void
  /** Системный prefers-reduced-motion ИЛИ тихий режим ИЛИ «меньше анимации» */
  calmMotion: boolean
  /** Звук фактически разрешён (включён и не в тихом режиме) */
  soundOn: boolean
}

const CareContext = createContext<CareContextValue | null>(null)

export function CareProvider({ children }: { children: ReactNode }) {
  // Состояние только в React — прототип ничего не пишет на устройство
  const [settings, setSettings] = useState<CareSettings>(DEFAULTS)
  const systemReduced = useReducedMotion() ?? false

  const setSetting = useCallback(
    <K extends keyof CareSettings>(key: K, value: CareSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const calmMotion = systemReduced || settings.quiet || settings.lessMotion
  const soundOn = settings.sound && !settings.quiet

  // Классы на <html>: ими управляют переопределения токенов в index.css
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('care-contrast', settings.contrast)
    root.classList.toggle('care-large', settings.largeText)
    root.classList.toggle('care-quiet', settings.quiet)
    root.classList.toggle('care-calm', calmMotion)
  }, [settings.contrast, settings.largeText, settings.quiet, calmMotion])

  useEffect(() => {
    setSoundEnabled(soundOn)
  }, [soundOn])

  useEffect(() => {
    setHapticsEnabled(!settings.quiet)
  }, [settings.quiet])

  const value = useMemo(
    () => ({ settings, setSetting, calmMotion, soundOn }),
    [settings, setSetting, calmMotion, soundOn],
  )

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>
}

export function useCare(): CareContextValue {
  const ctx = useContext(CareContext)
  if (!ctx) throw new Error('useCare должен вызываться внутри <CareProvider>')
  return ctx
}

/**
 * Замена useReducedMotion по всему приложению: учитывает и системную
 * настройку, и «Панель заботы». true = амбиентное движение выключено.
 */
export function useCalmMotion(): boolean {
  return useCare().calmMotion
}
