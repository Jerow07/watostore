import { Smartphone, Building2 } from 'lucide-react'

export type PayMethod = 'mp' | 'transfer'

interface Props {
  selected: PayMethod
  onChange: (m: PayMethod) => void
}

const METHODS = [
  {
    id: 'mp' as const,
    label: 'MercadoPago',
    sub: 'Tarjeta de crédito/débito, saldo MP',
    icon: <Smartphone size={20} />,
    badge: null,
  },
  {
    id: 'transfer' as const,
    label: 'Transferencia bancaria',
    sub: 'CVU / alias · Confirmación en 30 min',
    icon: <Building2 size={20} />,
    badge: null,
  },
]

export default function PaymentSelector({ selected, onChange }: Props) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {METHODS.map((m) => {
        const active = selected === m.id
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 18px',
              background: active ? 'rgba(230,4,18,0.08)' : 'var(--bg-2)',
              border: `1.5px solid ${active ? '#E60412' : 'var(--border)'}`,
              borderRadius: 10,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              width: '100%',
            }}
          >
            <span style={{ color: active ? '#E60412' : '#4CC3E3', flexShrink: 0 }}>{m.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-0)' }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{m.sub}</div>
            </div>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${active ? '#E60412' : 'var(--border-strong)'}`,
              background: active ? '#E60412' : 'transparent',
              transition: 'all 0.2s',
            }} />
          </button>
        )
      })}
    </div>
  )
}
