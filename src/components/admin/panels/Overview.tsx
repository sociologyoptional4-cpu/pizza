import { useOrdersStore } from '../../../store/ordersStore'
import { menuRepository } from '../../../data/repository'
import {
  computeKpis,
  ordersByType,
  revenueByDay,
  topItems,
} from '../../../lib/analytics'
import { STAGE_LABELS, currentStageIndex, stagesFor } from '../../../lib/checkout'
import { formatMoney } from '../../../lib/money'
import { BarChart, Donut, Panel, StatCard, Table } from '../AdminUI'

export function DashboardPanel() {
  const orders = useOrdersStore((s) => s.orders)
  const k = computeKpis(orders)
  const week = revenueByDay(orders, 7)

  return (
    <Panel title="Dashboard" subtitle="Today at a glance">
      <div className="stat-grid">
        <StatCard label="Orders today" value={String(k.ordersToday)} tone="ember" />
        <StatCard label="Revenue today" value={formatMoney(k.revenueToday)} tone="gold" />
        <StatCard label="Avg order" value={formatMoney(k.avgOrder)} tone="basil" />
        <StatCard label="All-time orders" value={String(k.orderCount)} hint={formatMoney(k.revenueTotal)} />
      </div>

      <div className="admin-cols">
        <div className="admin-block">
          <h2>Revenue · last 7 days</h2>
          <BarChart data={week.map((d) => ({ label: d.label, value: d.revenue }))} format={(n) => formatMoney(n)} />
        </div>
        <div className="admin-block">
          <h2>Live orders</h2>
          {orders.length === 0 ? (
            <p className="admin-panel__sub">No orders yet.</p>
          ) : (
            <ul className="live-feed">
              {orders.slice(0, 6).map((o) => {
                const stage = stagesFor(o.type)[currentStageIndex(o)]
                return (
                  <li key={o.id}>
                    <span className="live-feed__num">{o.number}</span>
                    <span className="live-feed__meta">{STAGE_LABELS[stage]} · {formatMoney(o.totals.total)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  )
}

const PIE_COLORS = ['oklch(66% 0.2 38)', 'oklch(82% 0.13 85)', 'oklch(64% 0.15 150)']

export function AnalyticsPanel() {
  const orders = useOrdersStore((s) => s.orders)
  const week = revenueByDay(orders, 7)
  const byType = ordersByType(orders)
  const top = topItems(orders)
  const segments = Object.entries(byType).map(([label, value], i) => ({
    label,
    value,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  return (
    <Panel title="Analytics" subtitle="Trends and best sellers">
      <div className="admin-cols">
        <div className="admin-block">
          <h2>Orders · last 7 days</h2>
          <BarChart data={week.map((d) => ({ label: d.label, value: d.orders }))} />
        </div>
        <div className="admin-block">
          <h2>Orders by type</h2>
          {segments.length ? <Donut segments={segments} /> : <p className="admin-panel__sub">No data yet.</p>}
        </div>
      </div>
      <div className="admin-block">
        <h2>Top items</h2>
        {top.length ? (
          <Table head={['Item', 'Units sold']}>
            {top.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td className="tnum">{t.count}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="admin-panel__sub">No sales yet.</p>
        )}
      </div>
    </Panel>
  )
}

export function ReportsPanel() {
  const orders = useOrdersStore((s) => s.orders)

  function exportCsv() {
    const rows = [
      ['Number', 'Date', 'Type', 'Items', 'Total'],
      ...orders.map((o) => [
        o.number,
        new Date(o.createdAt).toISOString(),
        o.type,
        String(o.lines.reduce((n, l) => n + l.draft.quantity, 0)),
        o.totals.total.toFixed(2),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'forno-orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const k = computeKpis(orders)
  const productCount = menuRepository.getProducts().length

  return (
    <Panel
      title="Reports"
      subtitle="Summaries and exports"
      actions={<button className="adm-toggle is-on" onClick={exportCsv}>Export orders CSV</button>}
    >
      <Table head={['Metric', 'Value']}>
        <tr><td>Total orders</td><td className="tnum">{k.orderCount}</td></tr>
        <tr><td>Lifetime revenue</td><td className="tnum">{formatMoney(k.revenueTotal)}</td></tr>
        <tr><td>Average order value</td><td className="tnum">{formatMoney(k.avgOrder)}</td></tr>
        <tr><td>Active products</td><td className="tnum">{productCount}</td></tr>
      </Table>
    </Panel>
  )
}
