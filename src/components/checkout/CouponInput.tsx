import { useState } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPriceARS } from '@/lib/format'

export interface CouponResult {
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
}

interface Props {
  subtotal: number
  onApply: (coupon: CouponResult | null) => void
  applied: CouponResult | null
}

export default function CouponInput({ subtotal, onApply, applied }: Props) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const discountAmount = applied
    ? applied.discountType === 'percent'
      ? Math.round((subtotal * applied.discountValue) / 100)
      : Math.min(applied.discountValue, subtotal)
    : 0

  const validate = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError('')

    const { data, error: dbErr } = await supabase
      .from('coupons')
      .select('code, discount_type, discount_value, max_uses, used_count, expires_at, active')
      .eq('code', trimmed)
      .eq('active', true)
      .single()

    setLoading(false)

    if (dbErr || !data) { setError('Código no válido o expirado'); return }
    if (data.max_uses !== null && data.used_count >= data.max_uses) { setError('Este cupón ya alcanzó su límite de usos'); return }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setError('Este cupón expiró'); return }

    onApply({ code: data.code, discountType: data.discount_type as 'percent' | 'fixed', discountValue: data.discount_value })
  }

  const remove = () => { onApply(null); setCode(''); setError('') }

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-2)', fontSize: 13, fontFamily: 'inherit', padding: 0, marginBottom: open ? 12 : 0 }}
      >
        <Tag size={14} />
        ¿Tenés un cupón de descuento?
      </button>

      {open && (
        <div>
          {applied ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} color="#4ade80" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4ade80', letterSpacing: '0.08em' }}>
                  {applied.code}
                </span>
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                  — {applied.discountType === 'percent' ? `${applied.discountValue}% off` : `${formatPriceARS(applied.discountValue)} off`}
                  {' '}(ahorrás {formatPriceARS(discountAmount)})
                </span>
              </div>
              <button onClick={remove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'grid', placeItems: 'center', padding: 4 }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="wato-input"
                placeholder="CÓDIGO"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && validate()}
                style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              />
              <button
                onClick={validate}
                disabled={loading || !code.trim()}
                style={{ padding: '0 18px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg-0)', fontSize: 13, fontFamily: 'inherit', flexShrink: 0, display: 'grid', placeItems: 'center' }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Aplicar'}
              </button>
            </div>
          )}
          {error && (
            <p style={{ fontSize: 12, color: '#F14555', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
