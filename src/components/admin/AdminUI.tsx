/* Small dependency-free admin primitives: stat card, bar chart, donut, table shell. */
import type { ReactNode } from 'react'
import './admin.css'

export function StatCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'ember' | 'gold' | 'basil' }) {
  return (
    <div className={`stat-card ${tone ? `stat-card--${tone}` : ''}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value tnum">{value}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </div>
  )
}

export function BarChart({ data, format }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="bar-chart" role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="bar-chart__col">
          <div className="bar-chart__track">
            <div
              className="bar-chart__bar"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={format ? format(d.value) : String(d.value)}
            />
          </div>
          <span className="bar-chart__label">{d.label}</span>
          <span className="bar-chart__val tnum">{format ? format(d.value) : d.value}</span>
        </div>
      ))}
    </div>
  )
}

export function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0))
  let acc = 0
  const stops = segments
    .map((s) => {
      const start = (acc / total) * 360
      acc += s.value
      const end = (acc / total) * 360
      return `${s.color} ${start}deg ${end}deg`
    })
    .join(', ')
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }} />
      <ul className="donut-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="donut-dot" style={{ background: s.color }} /> {s.label}
            <span className="tnum">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Panel({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <div>
          <h1 className="admin-panel__title">{title}</h1>
          {subtitle && <p className="admin-panel__sub">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
