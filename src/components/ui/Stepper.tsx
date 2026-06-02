import { Minus, Plus } from 'lucide-react'
import './ui.css'

type StepperProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  label?: string
}

export function Stepper({ value, onChange, min = 1, max = 20, label = 'Quantity' }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} />
      </button>
      <span className="tnum" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
