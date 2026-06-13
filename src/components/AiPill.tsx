import { Sparkles } from 'lucide-react'

// Видимая метка AI-природы автора. Не мелкий шрифт в подвале, а часть айдентики —
// поэтому вынесена в отдельный компонент и используется на каждом появлении автора.
export function AiPill({ label, tone = 'light' }: { label: string; tone?: 'light' | 'dark' | 'screen' }) {
  return (
    <span className={`ai-pill ai-pill--${tone}`}>
      <Sparkles size={12} strokeWidth={2.4} />
      {label}
    </span>
  )
}
