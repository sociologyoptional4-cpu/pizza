import { Check } from 'lucide-react'
import type { Order } from '../../data/types'
import { STAGE_LABELS, currentStageIndex, stagesFor } from '../../lib/checkout'
import './order-timeline.css'

export function OrderTimeline({ order, now }: { order: Order; now?: Date }) {
  const stages = stagesFor(order.type)
  const activeIdx = currentStageIndex(order, now)

  return (
    <ol className="timeline" aria-label="Order progress">
      {stages.map((stage, i) => {
        const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending'
        return (
          <li key={stage} className={`timeline__step is-${state}`}>
            <span className="timeline__marker">
              {state === 'done' ? <Check size={14} /> : <span className="timeline__dot" />}
            </span>
            <span className="timeline__label">{STAGE_LABELS[stage]}</span>
          </li>
        )
      })}
    </ol>
  )
}
