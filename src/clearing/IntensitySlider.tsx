import { haptic } from '../lib/haptics'

/**
 * «Весомый» слайдер интенсивности 0–10: нативный input[type=range]
 * с крупным бегунком 28px и треком mist → sun/40. Стрелки клавиатуры
 * работают нативно; на каждое изменение — лёгкая тактильная «насечка».
 */

const SLIDER_CSS = `
.clearing-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 28px;
  background: transparent;
  cursor: pointer;
}
.clearing-range:focus-visible {
  outline: 2px solid var(--sky);
  outline-offset: 6px;
  border-radius: 999px;
}
.clearing-range::-webkit-slider-runnable-track {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--mist), rgba(255, 200, 61, 0.4));
}
.clearing-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -9px;
  border-radius: 50%;
  background: var(--ink);
  border: 3px solid #ffffff;
  box-shadow: 0 2px 10px rgba(21, 23, 28, 0.25);
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.clearing-range:hover::-webkit-slider-thumb {
  transform: scale(1.07);
}
.clearing-range:active::-webkit-slider-thumb {
  transform: scale(1.12);
}
.clearing-range::-moz-range-track {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--mist), rgba(255, 200, 61, 0.4));
}
.clearing-range::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--ink);
  border: 3px solid #ffffff;
  box-shadow: 0 2px 10px rgba(21, 23, 28, 0.25);
}
`

export default function IntensitySlider({
  value,
  onChange,
  minLabel,
  maxLabel,
  label,
}: {
  value: number
  onChange: (value: number) => void
  minLabel: string
  maxLabel: string
  /** aria-label для самого input */
  label: string
}) {
  return (
    <div>
      <style>{SLIDER_CSS}</style>

      <p className="text-center" aria-hidden="true">
        <span className="font-display text-5xl leading-none tracking-tight">{value}</span>
        <span className="ml-2 text-[15px] text-ink-soft">из 10</span>
      </p>

      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => {
          const next = Number(e.currentTarget.value)
          if (next !== value) haptic(6)
          onChange(next)
        }}
        className="clearing-range mt-5"
        aria-label={label}
        aria-valuetext={`${value} из 10`}
      />

      <div className="mt-2.5 flex items-center justify-between text-[15px] font-medium text-ink-soft">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
