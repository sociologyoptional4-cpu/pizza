import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'
import { Panel, Table } from '../AdminUI'

export function StoreSettingsPanel() {
  const settings = useAdminStore((s) => s.settings)
  const update = useAdminStore((s) => s.updateSettings)
  const num = (k: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ [k]: Number(e.target.value) } as Partial<typeof settings>)

  return (
    <Panel title="Store settings" subtitle="Fees, minimums and thresholds">
      <div className="admin-block" style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 520 }}>
        <Field label="Store name">
          <input className="adm-input" value={settings.name} onChange={(e) => update({ name: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className="adm-input" value={settings.phone} onChange={(e) => update({ phone: e.target.value })} />
        </Field>
        <Field label="Free delivery threshold (£)">
          <input className="adm-input" type="number" value={settings.freeDeliveryThreshold} onChange={num('freeDeliveryThreshold')} />
        </Field>
        <Field label="Default delivery fee (£)">
          <input className="adm-input" type="number" value={settings.defaultDeliveryFee} onChange={num('defaultDeliveryFee')} />
        </Field>
        <Field label="Minimum order (£)">
          <input className="adm-input" type="number" value={settings.minOrder} onChange={num('minOrder')} />
        </Field>
        <Field label="Service charge (£)">
          <input className="adm-input" type="number" value={settings.serviceCharge} onChange={num('serviceCharge')} />
        </Field>
      </div>
    </Panel>
  )
}

export function WhatsappSettingsPanel() {
  const settings = useAdminStore((s) => s.settings)
  const update = useAdminStore((s) => s.updateSettings)
  const template = useAdminStore((s) => s.whatsappTemplate)
  const setTemplate = useAdminStore((s) => s.setWhatsappTemplate)
  return (
    <Panel title="WhatsApp settings" subtitle="Order channel">
      <div className="admin-block" style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 520 }}>
        <Field label="WhatsApp number (intl, digits only)">
          <input className="adm-input" value={settings.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} />
        </Field>
        <Field label="Message template">
          <input className="adm-input" value={template} onChange={(e) => setTemplate(e.target.value)} />
        </Field>
        <p className="admin-panel__sub">Tokens: {'{number} {type} {total}'}</p>
      </div>
    </Panel>
  )
}

export function PaymentSettingsPanel() {
  const payments = useAdminStore((s) => s.payments)
  const toggle = useAdminStore((s) => s.togglePayment)
  return (
    <Panel title="Payment settings" subtitle="Enable accepted methods">
      <Table head={['Method', 'Status']}>
        {Object.entries(payments).map(([m, on]) => (
          <tr key={m}>
            <td><strong>{m}</strong></td>
            <td>
              <button className={`adm-toggle ${on ? 'is-on' : 'is-off'}`} onClick={() => toggle(m)}>
                {on ? 'Enabled' : 'Disabled'}
              </button>
            </td>
          </tr>
        ))}
      </Table>
      <p className="admin-panel__sub" style={{ marginTop: 'var(--space-4)' }}>
        Card / Apple Pay / Google Pay are Stripe-ready placeholders — wire keys before going live.
      </p>
    </Panel>
  )
}

export function BannersPanel() {
  const banners = useAdminStore((s) => s.banners)
  const add = useAdminStore((s) => s.addBanner)
  const remove = useAdminStore((s) => s.removeBanner)
  const toggle = useAdminStore((s) => s.toggleBanner)
  const [text, setText] = useState('')
  return (
    <Panel title="Banners" subtitle="Homepage promo messages">
      <Table head={['Text', 'Status', '']}>
        {banners.map((b) => (
          <tr key={b.id}>
            <td>{b.text}</td>
            <td>
              <button className={`adm-toggle ${b.active ? 'is-on' : 'is-off'}`} onClick={() => toggle(b.id)}>
                {b.active ? 'Live' : 'Off'}
              </button>
            </td>
            <td><button className="adm-icon-btn" aria-label="Remove" onClick={() => remove(b.id)}><Trash2 size={15} /></button></td>
          </tr>
        ))}
      </Table>
      <div className="adm-row">
        <input className="adm-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="New banner text" style={{ flex: 1 }} />
        <button className="adm-toggle is-on" onClick={() => { if (text.trim()) { add(text.trim()); setText('') } }}>Add banner</button>
      </div>
    </Panel>
  )
}

export function StaffPanel() {
  const staff = useAdminStore((s) => s.staff)
  const add = useAdminStore((s) => s.addStaff)
  const remove = useAdminStore((s) => s.removeStaff)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'Owner' | 'Manager' | 'Kitchen' | 'Driver'>('Kitchen')
  return (
    <Panel title="Staff access" subtitle="Roles and permissions">
      <Table head={['Name', 'Role', '']}>
        {staff.map((s) => (
          <tr key={s.id}>
            <td><strong>{s.name}</strong></td>
            <td><span className="adm-pill">{s.role}</span></td>
            <td><button className="adm-icon-btn" aria-label="Remove" onClick={() => remove(s.id)}><Trash2 size={15} /></button></td>
          </tr>
        ))}
      </Table>
      <div className="adm-row">
        <input className="adm-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <select className="adm-input" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option>Owner</option><option>Manager</option><option>Kitchen</option><option>Driver</option>
        </select>
        <button className="adm-toggle is-on" onClick={() => { if (name.trim()) { add(name.trim(), role); setName('') } }}>Add staff</button>
      </div>
    </Panel>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)' }}>{label}</span>
      {children}
    </label>
  )
}
