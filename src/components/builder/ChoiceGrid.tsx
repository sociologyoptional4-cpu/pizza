import { Check } from 'lucide-react'
import { formatMoney } from '../../lib/money'
import './builder.css'

export type Choice = { id: string; label: string; sublabel?: string; delta?: number; disabled?: boolean }

type Props = {
  choices: Choice[]
  value: string
  onChange: (id: string) => void
  label: string
}

/** Big-target single-select grid. Shows price delta so elderly users see the cost of each option. */
export function ChoiceGrid({ choices, value, onChange, label }: Props) {
  return (
    <div className="choice-grid" role="radiogroup" aria-label={label}>
      {choices.map((c) => {
        const selected = c.id === value
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={c.disabled}
            className={`choice ${selected ? 'is-selected' : ''}`}
            onClick={() => onChange(c.id)}
          >
            <span className="choice__main">
              <span className="choice__label">{c.label}</span>
              {c.sublabel && <span className="choice__sub">{c.sublabel}</span>}
            </span>
            <span className="choice__right">
              {c.delta !== undefined && c.delta > 0 && (
                <span className="choice__delta tnum">+{formatMoney(c.delta)}</span>
              )}
              {selected && <Check size={16} className="choice__check" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
