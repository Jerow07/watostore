import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { useCartStore, type CartItem } from '@/store/cartStore'
import { formatPriceARS } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = ['Datos', 'Pago', 'Confirmación']

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ email: '', name: '', phone: '', consoleId: '', payMethod: 'mp' })
  const { items, totalPrice, clearCart } = useCartStore()
  const total = totalPrice()

  const handleConfirm = () => {
    clearCart()
    setStep(2)
  }

  if (items.length === 0 && step < 2) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase' }}>
          Tu carrito está vacío
        </p>
        <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none' }}>Explorar catálogo</Link>
      </div>
    )
  }

  const orderNum = `WS-${Math.floor(1000 + Math.random() * 9000)}`

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div style={{ padding: '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: i <= step ? '#E60412' : 'var(--bg-2)',
                    border: `2px solid ${i <= step ? '#E60412' : 'var(--border)'}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 500,
                    color: i <= step ? 'white' : '#6b6b73',
                    transition: 'all 0.3s',
                  }}
                >
                  {i < step ? <CheckCircle size={16} /> : String(i + 1).padStart(2, '0')}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: i === step ? '#fafafa' : '#6b6b73',
                    fontWeight: i === step ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 80,
                    height: 1,
                    background: i < step ? '#E60412' : 'var(--border)',
                    margin: '0 8px',
                    marginBottom: 22,
                    transition: 'background 0.3s',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}
            >
              <div
                style={{
                  padding: 32,
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                }}
              >
                <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: '-0.02em' }}>
                  Tus datos
                </h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                      Email *
                    </label>
                    <input className="wato-input" type="email" placeholder="tumail@ejemplo.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                      Nombre completo *
                    </label>
                    <input className="wato-input" placeholder="Tu nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input className="wato-input" placeholder="+54 11 1234-5678" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 28, width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px' }}
                  onClick={() => setStep(1)}
                  disabled={!form.email || !form.name || !form.phone}
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
              <OrderSummary items={items} total={total} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}
            >
              <div
                style={{
                  padding: 32,
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                }}
              >
                <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: '-0.02em' }}>
                  Método de pago
                </h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    { id: 'mp', label: 'Mercado Pago', sub: 'Tarjeta, débito o saldo MP', icon: <Smartphone size={20} /> },
                    { id: 'transfer', label: 'Transferencia bancaria', sub: 'CBU / CVU · Confirmación en 30 min', icon: <Building2 size={20} /> },
                    { id: 'card', label: 'Tarjeta de crédito', sub: 'Visa, Mastercard, AMEX', icon: <CreditCard size={20} /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setForm((f) => ({ ...f, payMethod: m.id }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 18px',
                        background: form.payMethod === m.id ? 'rgba(230,4,18,0.08)' : 'var(--bg-2)',
                        border: `1.5px solid ${form.payMethod === m.id ? '#E60412' : 'var(--border)'}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        width: '100%',
                      }}
                    >
                      <span style={{ color: form.payMethod === m.id ? '#E60412' : '#4CC3E3' }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-0)' }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{m.sub}</div>
                      </div>
                      {form.payMethod === m.id && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#E60412',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}
                    onClick={() => setStep(0)}
                  >
                    Volver
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: 'center', fontSize: 15, padding: '14px' }}
                    onClick={handleConfirm}
                  >
                    Confirmar pedido <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <OrderSummary items={items} total={total} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(74,222,128,0.15)',
                  border: '2px solid rgba(74,222,128,0.4)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 24px',
                  color: '#4ade80',
                }}
              >
                <CheckCircle size={36} />
              </motion.div>
              <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
                ¡Pedido confirmado!
              </h1>
              <p style={{ color: 'var(--fg-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                Revisá tu mail. Te mandamos las credenciales en menos de 15 minutos.
              </p>
              <div
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 18,
                  color: 'var(--fg-0)',
                  letterSpacing: '0.1em',
                  marginBottom: 32,
                }}
              >
                #{orderNum}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link to="/perfil" className="btn-primary" style={{ textDecoration: 'none' }}>Ver mis pedidos</Link>
                <Link to="/catalogo" className="btn-ghost" style={{ textDecoration: 'none' }}>Seguir explorando</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function OrderSummary({ items, total }: { items: CartItem[]; total: number }) {
  return (
    <div
      style={{
        padding: 24,
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        alignSelf: 'start',
        position: 'sticky',
        top: 80,
      }}
    >
      <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
        Resumen del pedido
      </h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {items.map((item) => (
          <div key={`${item.gameId}-${item.accountType}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fg-1)' }}>
              {item.title} <span style={{ color: 'var(--fg-3)' }}>×{item.qty}</span>
            </span>
            <span style={{ fontWeight: 600 }}>{formatPriceARS(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 18 }}>
        <span>Total</span>
        <span style={{ color: '#E60412' }}>{formatPriceARS(total)}</span>
      </div>
    </div>
  )
}
