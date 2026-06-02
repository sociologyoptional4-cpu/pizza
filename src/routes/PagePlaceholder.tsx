/* Temporary scaffold page. Replaced by real pages in later phases. */
import { Link } from 'react-router-dom'
import { STORE } from '../data/catalog'

export function PagePlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <main className="container" style={{ paddingBlock: 'var(--space-section)' }}>
      <p className="eyebrow">{STORE.name}</p>
      <h1 style={{ fontSize: 'var(--text-h2)' }}>{title}</h1>
      <p className="lead" style={{ maxWidth: '46ch', marginTop: 'var(--space-4)' }}>
        {note ?? 'This page is scaffolded in Phase 1. Full design lands in a later phase.'}
      </p>
      <p style={{ marginTop: 'var(--space-6)' }}>
        <Link to="/" className="eyebrow">
          ← Back home
        </Link>
      </p>
    </main>
  )
}
