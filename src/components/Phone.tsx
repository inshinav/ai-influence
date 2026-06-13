import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Bookmark, Heart, Share2 } from 'lucide-react'
import type { Persona } from '../data/aiFarm'
import { publicExamplePath } from '../lib/paths'
import { AiPill } from './AiPill'

type AccentStyle = CSSProperties & { '--accent'?: string; '--glow'?: string }

type PhoneProps = {
  persona: Persona
  hook: string
  topicLabel?: string
  caption?: string
  time?: string
  metrics?: { retention?: string; saves?: string }
  videoFile?: string
  size?: 'sm' | 'md' | 'lg'
  showRail?: boolean
}

// Реалистичная вертикальная «витрина»: тёмный экран 9:16, статус-бар с AI-меткой,
// подпись поверх затемнения, как в настоящем вертикальном видео. Если в
// public/examples лежит MP4 с нужным именем — играет живое видео, иначе синтетика.
export function Phone({
  persona,
  hook,
  topicLabel,
  caption,
  time = '2:14',
  metrics,
  videoFile,
  size = 'md',
  showRail = true,
}: PhoneProps) {
  const [videoFailed, setVideoFailed] = useState(false)
  const style = { '--accent': persona.color, '--glow': persona.glow } as AccentStyle
  const showVideo = Boolean(videoFile) && !videoFailed

  return (
    <div className={`phone phone--${size}`} style={style}>
      <span className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        {showVideo && (
          <video
            key={videoFile}
            className="phone-video"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            onError={() => setVideoFailed(true)}
            src={publicExamplePath(videoFile as string)}
          />
        )}
        <div className="phone-fx" aria-hidden="true">
          <span className="phone-glow" />
          <span className="phone-grain" />
        </div>

        <div className="phone-top">
          <span className="phone-time">{time}</span>
          <AiPill label={persona.aiBadge} tone="screen" />
        </div>

        {showRail && (
          <div className="phone-rail" aria-hidden="true">
            <span>
              <Heart size={18} />
              <small>{metrics?.retention ?? ''}</small>
            </span>
            <span className="phone-rail-save">
              <Bookmark size={18} />
              <small>{metrics?.saves ?? ''}</small>
            </span>
            <span>
              <Share2 size={18} />
            </span>
          </div>
        )}

        <div className="phone-caption">
          {topicLabel && <span className="phone-chip">{topicLabel}</span>}
          <strong>{hook}</strong>
          {caption && <p>{caption}</p>}
          <span className="phone-handle">{persona.handle}</span>
        </div>
      </div>
    </div>
  )
}
