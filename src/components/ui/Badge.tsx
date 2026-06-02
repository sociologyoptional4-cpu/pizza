import type { ReactNode } from 'react'
import './ui.css'

type BadgeTone = 'veg' | 'nonveg' | 'gold' | 'neutral'

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function Sticker({ children }: { children: ReactNode }) {
  return <span className="sticker">{children}</span>
}
