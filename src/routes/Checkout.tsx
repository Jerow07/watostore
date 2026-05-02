import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Copy, MessageCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, type CartItem } from '@/store/cartStore'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { formatPriceARS } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import CouponInput, { type CouponResult } from '@/components/checkout/CouponInput'
import PaymentSelector, { type PayMethod } from '@/components/checkout/PaymentSelector'
import { STORE_CONFIG } from '@/config/store'

const TRANSFER_CBU    = STORE_CONFIG.transferCbu
const TRANSFER_ALIAS  = STORE_CONFIG.transferAlias
const WHATSAPP_NUMBER = STORE_CONFIG.whatsapp

const STEPS = ['Datos', 'Pago', 'Confirmación']

interface Form {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const isMobile = useIsMobile()
  const subtotal = totalPrice()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>({ nombre: '', apellido: '', dni: '', email: user?.email ?? '', telefono: '' })
  const [payMethod, setPayMethod] = useState<PayMethod>('mp')
  const [coupon, setCoupon] = useState<CouponResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderNum, setOrderNum] = useState('')
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [copied, setCopied] = useState(false)

  const discountAmount = coupon
    ? coupon.discountType === 'percent'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, subtotal)
    : 0
  const total = Math.max(0, subtotal - discountAmount)
  const px = isMobile ? 16 : 48

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (items.length === 0 && step < 2) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase' }}>Tu carrito está vacío</p>
        <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none' }}>Explorar catálogo</Link>
      </div>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const num = `WS-${Math.floor(1000 + Math.random() * 9000)}`
      setOrderNum(num)

      const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
        customer_name: form.nombre,
        customer_lastname: form.apellido,
        customer_dni: form.dni,
        customer_email: form.email,
        customer_phone: form.telefono,
        user_id: user?.id ?? null,
        items: items.map((i) => ({ gameId: i.gameId, title: i.title, accountType: i.accountType, price: i.price, qty: i.qty })),
        subtotal,
        discount_amount: discountAmount,
        total,
        coupon_code: coupon?.code ?? null,
        payment_method: payMethod,
        status: payMethod === 'transfer' ? 'pending_transfer' : 'pending',
      }).select('id').single()

      if (orderErr) throw orderErr

      if (payMethod === 'mp') {
        const fnRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              order_id: orderData.id,
              items: items.map((i) => ({ title: i.title, price: i.price, qty: i.qty })),
              payer: { email: form.email, name: `${form.nombre} ${form.apellido}` },
              total,
            }),
          }
        )
        const fnData = await fnRes.json()
        if (!fnRes.ok) throw new Error(fnData.error ?? `HTTP ${fnRes.status}`)
        clearCart()
        // Redirect to MercadoPago hosted checkout
        window.location.href = fnData.init_point
        return
      }

      // Transfer: show instructions
      setConfirmedTotal(total)
      clearCart()
      setStep(2)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      alert('Error: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const step0Valid = form.nombre && form.apellido && form.dni && form.email && form.telefono

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div style={{ padding: `40px ${px}px`, maxWidth: 1100, margin: '0 auto' }}>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i <= step ? '#E60412' : 'var(--bg-2)', border: `2px solid ${i <= step ? '#E60412' : 'var(--border)'}`, display: 'grid', placeItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: i <= step ? 'white' : '#6b6b73', transition: 'all 0.3s' }}>
                  {i < step ? <CheckCircle size={16} /> : String(i + 1).padStart(2, '0')}
                </div>
                <span style={{ fontSize: isMobile ? 11 : 12, color: i === step ? '#fafafa' : '#6b6b73', fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: isMobile ? 40 : 80, height: 1, background: i < step ? '#E60412' : 'var(--border)', margin: '0 8px', marginBottom: 22, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 0: Datos ────────────────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 24 }}
            >
              {isMobile && <OrderSummary items={items} subtotal={subtotal} discount={discountAmount} total={total} />}
              <div style={{ padding: isMobile ? 20 : 32, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16 }}>
                <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: '-0.02em' }}>Tus datos</h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Nombre *</label>
                      <input className="wato-input" placeholder="Juan" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Apellido *</label>
                      <input className="wato-input" placeholder="García" value={form.apellido} onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>DNI *</label>
                      <input className="wato-input" placeholder="12345678" value={form.dni} onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Teléfono / WhatsApp *</label>
                      <input className="wato-input" placeholder="+54 11 1234-5678" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input className="wato-input" type="email" placeholder="tumail@ejemplo.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} readOnly={!!user} style={{ opacity: user ? 0.7 : 1 }} />
                    {user && <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', marginTop: 4, display: 'block' }}>Asociado a tu cuenta</span>}
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop: 28, width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px', opacity: step0Valid ? 1 : 0.5 }}
                  onClick={() => setStep(1)} disabled={!step0Valid}>
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
              {!isMobile && <OrderSummary items={items} subtotal={subtotal} discount={discountAmount} total={total} />}
            </motion.div>
          )}

          {/* ── STEP 1: Pago ─────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 24 }}
            >
              {isMobile && <OrderSummary items={items} subtotal={subtotal} discount={discountAmount} total={total} />}
              <div style={{ padding: isMobile ? 20 : 32, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16 }}>
                <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.02em' }}>Método de pago</h2>

                <CouponInput subtotal={subtotal} applied={coupon} onApply={setCoupon} />

                <PaymentSelector selected={payMethod} onChange={setPayMethod} />

                {payMethod === 'transfer' && (
                  <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(76,195,227,0.06)', border: '1px solid rgba(76,195,227,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                    Tras confirmar te mostramos el CBU/alias y el monto exacto a transferir. Enviás el comprobante por WhatsApp y activamos tu alquiler en menos de 30 min.
                  </div>
                )}

                {payMethod === 'mp' && (
                  <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(76,195,227,0.06)', border: '1px solid rgba(76,195,227,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                    Serás redirigido a MercadoPago para completar el pago de forma segura con tarjeta, débito o saldo MP.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                  <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 14 }} onClick={() => setStep(0)} disabled={loading}>
                    Volver
                  </button>
                  <button className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: 15, padding: '14px', opacity: loading ? 0.7 : 1 }}
                    onClick={handleSubmit} disabled={loading}>
                    {loading
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando…</>
                      : payMethod === 'mp'
                        ? <>Ir a MercadoPago <ArrowRight size={16} /></>
                        : <>Confirmar pedido <ArrowRight size={16} /></>
                    }
                  </button>
                </div>
              </div>
              {!isMobile && <OrderSummary items={items} subtotal={subtotal} discount={discountAmount} total={total} />}
            </motion.div>
          )}

          {/* ── STEP 2: Confirmación (transferencia) ─────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ maxWidth: 560, margin: '0 auto' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.4)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#4ade80' }}
                >
                  <CheckCircle size={32} />
                </motion.div>
                <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 26 : 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>¡Pedido recibido!</h1>
                <p style={{ color: 'var(--fg-3)', fontSize: 14, lineHeight: 1.6 }}>
                  Completá la transferencia y envianos el comprobante por WhatsApp.
                </p>
                <div style={{ display: 'inline-block', padding: '8px 18px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: 'var(--fg-0)', letterSpacing: '0.1em', margin: '16px 0 0' }}>
                  #{orderNum}
                </div>
              </div>

              {/* Transfer instructions */}
              <div style={{ padding: 24, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Datos para la transferencia</h3>

                <div style={{ display: 'grid', gap: 14 }}>
                  <TransferRow label="Monto exacto" value={formatPriceARS(confirmedTotal)} highlight onCopy={() => copyToClipboard(String(confirmedTotal))} />
                  <TransferRow label="CBU" value={TRANSFER_CBU} onCopy={() => copyToClipboard(TRANSFER_CBU)} />
                  <TransferRow label="Alias" value={TRANSFER_ALIAS} onCopy={() => copyToClipboard(TRANSFER_ALIAS)} />
                  <TransferRow label="Titular" value="WATO.STORE" />
                </div>

                {copied && (
                  <p style={{ fontSize: 11, color: '#4ade80', fontFamily: 'JetBrains Mono, monospace', marginTop: 10, textAlign: 'center', letterSpacing: '0.08em' }}>
                    ✓ Copiado al portapapeles
                  </p>
                )}
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola! Acabo de hacer el pedido *${orderNum}* por ${formatPriceARS(confirmedTotal)}. Te mando el comprobante.`)}`}
                target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', background: '#25D366', borderRadius: 10, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 15, marginBottom: 16, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.88')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
              >
                <MessageCircle size={18} />
                Enviar comprobante por WhatsApp
              </a>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/catalogo" className="btn-ghost" style={{ textDecoration: 'none' }}>Seguir explorando</Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderSummary({ items, subtotal, discount, total }: { items: CartItem[]; subtotal: number; discount: number; total: number }) {
  return (
    <div style={{ padding: 24, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16, alignSelf: 'start' }}>
      <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Resumen del pedido</h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {items.map((item) => (
          <div key={`${item.gameId}-${item.accountType}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 8 }}>
            <span style={{ color: 'var(--fg-1)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
              <span style={{ color: 'var(--fg-3)' }}> ×{item.qty}</span>
            </span>
            <span style={{ fontWeight: 600, flexShrink: 0 }}>{formatPriceARS(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      {discount > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-3)', marginBottom: 6 }}>
            <span>Subtotal</span><span>{formatPriceARS(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4ade80', marginBottom: 10 }}>
            <span>Descuento cupón</span><span>−{formatPriceARS(discount)}</span>
          </div>
        </>
      )}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 18 }}>
        <span>Total</span>
        <span style={{ color: '#E60412' }}>{formatPriceARS(total)}</span>
      </div>
    </div>
  )
}

function TransferRow({ label, value, highlight, onCopy }: { label: string; value: string; highlight?: boolean; onCopy?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: highlight ? 16 : 13, fontWeight: highlight ? 700 : 400, color: highlight ? '#E60412' : 'var(--fg-0)' }}>
          {value}
        </span>
        {onCopy && (
          <button onClick={onCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'grid', placeItems: 'center', padding: 4, borderRadius: 4 }}>
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6,
}
