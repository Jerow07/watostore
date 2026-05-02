import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { formatPriceARS } from '@/lib/format'
import { useGamesStore } from '@/store/gamesStore'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalItems } = useCartStore()
  const allGames = useGamesStore((s) => s.games)
  const isMobile = useIsMobile()
  const total = totalPrice()
  const count = totalItems()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={closeCart}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />

          <motion.aside
            key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: isMobile ? '100vw' : 440,
              background: 'var(--bg-1)',
              borderLeft: '1px solid var(--border)',
              zIndex: 201,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Head */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingCart size={20} style={{ color: '#E60412' }} />
                <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                  Tu carrito
                </h3>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4CC3E3', marginLeft: 4 }}>
                  [ {String(count).padStart(2, '0')} ]
                </span>
              </div>
              <button className="btn-icon" onClick={closeCart}><X size={18} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--fg-3)', paddingTop: 80 }}>
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Carrito vacío
                  </p>
                  <Link to="/catalogo" className="btn-primary" onClick={closeCart} style={{ marginTop: 8, fontSize: 14, textDecoration: 'none' }}>
                    Explorar catálogo
                  </Link>
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const gameData = allGames.find(g => g.id === item.gameId)
                    const cover = gameData?.cover
                    const maxQty = gameData?.stock?.[item.accountType] ?? 1
                    const atMax = item.qty >= maxQty
                    return (
                    <div
                      key={`${item.gameId}-${item.accountType}`}
                      style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 12, alignItems: 'center', padding: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10 }}
                    >
                      <img src={cover} alt={item.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', display: 'block', background: 'var(--bg-3)' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                        <span style={{ display: 'inline-block', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 6px', borderRadius: 3, background: item.accountType === 'primary' ? 'rgba(230,4,18,0.15)' : 'rgba(76,195,227,0.15)', color: item.accountType === 'primary' ? '#F14555' : '#4CC3E3', marginBottom: 6 }}>
                          {item.accountType === 'primary' ? 'Primaria' : 'Secundaria'} · 1 mes
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <button onClick={() => updateQty(item.gameId, item.accountType, item.qty - 1)} style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--bg-3)', border: 'none', color: 'var(--fg-0)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                            <Minus size={11} />
                          </button>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                          <button
                            onClick={() => { if (!atMax) updateQty(item.gameId, item.accountType, item.qty + 1) }}
                            disabled={atMax}
                            style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--bg-3)', border: 'none', color: atMax ? 'var(--fg-3)' : 'var(--fg-0)', cursor: atMax ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', opacity: atMax ? 0.4 : 1 }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 15 }}>{formatPriceARS(item.price * item.qty)}</span>
                        <button onClick={() => removeItem(item.gameId, item.accountType)} style={{ color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#E60412')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#6b6b73')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )})}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-3)', marginBottom: 8 }}>
                  <span>Subtotal</span><span>{formatPriceARS(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-3)', marginBottom: 16 }}>
                  <span>Procesamiento</span><span style={{ color: '#4ade80' }}>Gratis</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, paddingTop: 16, borderTop: '1px solid var(--border)', marginBottom: 20 }}>
                  <span>Total</span><span style={{ color: '#E60412' }}>{formatPriceARS(total)}</span>
                </div>
                <Link to="/checkout" className="btn-primary" onClick={closeCart} style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: 15, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  Alquilar ahora <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
