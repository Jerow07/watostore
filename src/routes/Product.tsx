import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingCart, Zap, Shield, Clock, Star, ChevronRight, Share2, Check, Bell, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import GameCard from '@/components/product/GameCard'
import type { Game } from '@/components/product/GameCard'
import { useGamesStore } from '@/store/gamesStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { formatPriceARS } from '@/lib/format'
import { supabase } from '@/lib/supabase'

export default function Product() {
  const ALL_GAMES = useGamesStore((s) => s.games)
  const { slug } = useParams<{ slug: string }>()
  const game = ALL_GAMES.find((g) => g.slug === slug)
  const [accountType, setAccountType] = useState<'primary' | 'secondary'>('primary')
  const [activeTab, setActiveTab] = useState('desc')
  const isMobile = useIsMobile()

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const { toggle, has } = useWishlistStore()
  const inWishlist = game ? has(game.id) : false
  const [copied, setCopied] = useState(false)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySubmitted, setNotifySubmitted] = useState(false)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const handleNotify = async () => {
    if (!notifyEmail || !game) return
    setNotifyLoading(true)
    await supabase.from('availability_notifications').insert({
      game_id: game.id,
      game_title: game.title,
      email: notifyEmail,
    })
    setNotifyLoading(false)
    setNotifySubmitted(true)
  }

  if (!game) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--fg-3)' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          404 · Juego no encontrado
        </span>
        <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none', fontSize: 14 }}>Volver al catálogo</Link>
      </div>
    )
  }

  const price = game.price[accountType]
  const related = ALL_GAMES.filter((g) => g.id !== game.id && g.genres.some((genre) => game.genres.includes(genre))).slice(0, 4)
  const handleAddToCart = () => { addItem({ gameId: game.id, title: game.title, slug: game.slug, accountType, price }); openCart() }
  const px = isMobile ? 16 : 48

  const TABS = [
    { id: 'desc', label: 'Descripción' },
    { id: 'how', label: 'Cómo funciona' },
    { id: 'reviews', label: `Reseñas (${game.reviewsCount.toLocaleString('es-AR')})` },
  ]

  const MOCK_REVIEWS = [
    { user: 'Matías G.', rating: 5, text: 'La cuenta primaria es un golazo. Llegó en 10 minutos, funciona perfecto. Lo volvería a alquilar sin dudar.', date: 'hace 3 días' },
    { user: 'Laura V.', rating: 5, text: 'Muy buena experiencia. El soporte me respondió rapidísimo cuando tuve una duda. Recomendado 100%.', date: 'hace 1 semana' },
    { user: 'Diego R.', rating: 4, text: 'El juego es excelente y el servicio es confiable. Solo tardó un poco más de lo esperado pero nada grave.', date: 'hace 2 semanas' },
  ]

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1 }}>
      <div style={{ padding: `32px ${px}px`, maxWidth: 1300, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Inicio</Link>
          <ChevronRight size={10} />
          <Link to="/catalogo" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Catálogo</Link>
          <ChevronRight size={10} />
          <span style={{ color: 'var(--fg-0)' }}>{game.title}</span>
        </div>

        {/* Main grid — stack on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: isMobile ? 24 : 56, marginBottom: 64 }}>
          {/* Cover */}
          <div style={{ aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <img src={game.cover} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ paddingTop: isMobile ? 0 : 8 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {game.genres.map((g) => (
                <span key={g} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 10px', border: '1px solid var(--border-strong)', borderRadius: 4, color: 'var(--fg-1)' }}>{g}</span>
              ))}
              {game.tags.includes('top-week') && (
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 10px', border: '1px solid rgba(76,195,227,0.4)', borderRadius: 4, color: '#4CC3E3' }}>▲ Top semanal</span>
              )}
            </div>

            <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isMobile ? 28 : 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 14 }}>
              {game.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, fontSize: 13, color: 'var(--fg-3)', flexWrap: 'wrap' }}>
              <span style={{ color: '#fbbf24', letterSpacing: 2 }}>{'★'.repeat(Math.floor(game.rating))}</span>
              <span><strong style={{ color: 'var(--fg-0)' }}>{game.rating}</strong> ({game.reviewsCount.toLocaleString('es-AR')} reseñas)</span>
              <span>· {game.rentalsCount.toLocaleString('es-AR')} alquileres</span>
            </div>

            <p style={{ color: 'var(--fg-1)', lineHeight: 1.6, marginBottom: 28, fontSize: 15 }}>
              {game.description.split('\n\n')[0]}
            </p>

            {/* Account selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {(['primary', 'secondary'] as const).map((type) => (
                <button key={type} onClick={() => setAccountType(type)}
                  style={{ border: `1.5px solid ${accountType === type ? '#E60412' : 'var(--border)'}`, borderRadius: 10, padding: isMobile ? 12 : 16, cursor: 'pointer', background: accountType === type ? 'rgba(230,4,18,0.08)' : 'transparent', textAlign: 'left', position: 'relative', transition: 'all 0.2s', fontFamily: 'inherit' }}
                >
                  {accountType === type && <span style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderRadius: '50%', background: '#E60412', boxShadow: '0 0 0 3px rgba(230,4,18,0.2)' }} />}
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 5 }}>
                    {type === 'primary' ? 'Recomendada' : 'Económica'}
                  </div>
                  <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isMobile ? 14 : 17, fontWeight: 600, marginBottom: 4, color: accountType === type ? '#E60412' : '#fafafa' }}>
                    {type === 'primary' ? 'Primaria' : 'Secundaria'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.4, marginBottom: 10 }}>
                    {type === 'primary' ? 'Online y offline. 1 mes.' : 'Solo offline. 1 mes.'}
                  </div>
                  <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isMobile ? 16 : 20, fontWeight: 700 }}>
                    {formatPriceARS(game.price[type])}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {game.stock[accountType] === 0 ? (
                notifySubmitted ? (
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderRadius: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 14, fontWeight: 500 }}>
                    <Check size={16} /> Te avisamos cuando esté disponible
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNotify()}
                      style={{ flex: 1, minWidth: 0, padding: '0 14px', height: 50, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border-strong)', color: 'var(--fg-0)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button
                      onClick={handleNotify}
                      disabled={notifyLoading || !notifyEmail}
                      className="btn-primary"
                      style={{ padding: '0 18px', height: 50, flexShrink: 0, gap: 7, opacity: !notifyEmail ? 0.5 : 1 }}
                    >
                      {notifyLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Bell size={15} />}
                      Avisarme
                    </button>
                  </div>
                )
              ) : (
                <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15 }}>
                  <ShoppingCart size={17} /> Agregar al carrito
                </button>
              )}
              <button onClick={() => toggle(game.id)} className="btn-icon" style={{ width: 50, height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', color: inWishlist ? '#E60412' : '#e5e5ea', flexShrink: 0 }}>
                <Heart size={18} fill={inWishlist ? '#E60412' : 'none'} stroke={inWishlist ? '#E60412' : 'currentColor'} />
              </button>
              <button onClick={handleShare} className="btn-icon" title="Copiar link" style={{ width: 50, height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', color: copied ? '#4ade80' : '#e5e5ea', flexShrink: 0, transition: 'color 0.2s' }}>
                {copied ? <Check size={18} /> : <Share2 size={18} />}
              </button>
            </div>

            {/* Features */}
            <div style={{ padding: 18, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 10, display: 'grid', gap: 10 }}>
              {[
                { icon: <Zap size={15} />, text: 'Entrega instantánea — Acceso por mail en menos de 15 minutos' },
                { icon: <Shield size={15} />, text: '100% verificada — Cuentas legítimas, sin baneos ni sustos' },
                { icon: <Clock size={15} />, text: 'Soporte 24/7 — Atendemos por WhatsApp y mail siempre' },
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--fg-1)' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', color: '#4CC3E3', flexShrink: 0 }}>{feat.icon}</span>
                  {feat.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginBottom: 64 }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, width: isMobile ? '100%' : 'fit-content', marginBottom: 32, overflowX: 'auto' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: isMobile ? '8px 12px' : '8px 18px', fontSize: isMobile ? 12 : 13, fontWeight: 500, borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTab === tab.id ? '#E60412' : 'transparent', color: activeTab === tab.id ? 'white' : '#989898', transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap', flex: isMobile ? 1 : 'none' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'desc' && (
            <div style={{ maxWidth: 700, fontSize: 15, color: 'var(--fg-1)', lineHeight: 1.7 }}>
              {game.description.split('\n\n').map((para, i) => <p key={i} style={{ marginBottom: 16 }}>{para}</p>)}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                {game.features.map((f) => (
                  <span key={f} style={{ padding: '5px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--fg-1)' }}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'how' && (
            <div style={{ maxWidth: 600, fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.8 }}>
              <p>Después de confirmar el pago recibís un mail con las credenciales de la cuenta. Entrás a la tienda de tu consola con esa cuenta, descargás el juego y ¡listo!</p>
              <p style={{ marginTop: 16 }}>La <strong style={{ color: 'var(--fg-0)' }}>cuenta primaria</strong> te permite registrar tu consola como principal, dándote acceso completo online y offline. La <strong style={{ color: '#4CC3E3' }}>cuenta secundaria</strong> te permite descargar el juego y jugarlo sin conexión.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ maxWidth: 700, display: 'grid', gap: 14 }}>
              {MOCK_REVIEWS.map((review, i) => (
                <div key={i} style={{ padding: 20, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #E60412, #F14555)', display: 'grid', placeItems: 'center', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {review.user[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{review.user}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{review.date}</div>
                      </div>
                    </div>
                    <div style={{ color: '#fbbf24', display: 'flex', gap: 2 }}>
                      {Array.from({ length: review.rating }).map((_, j) => <Star key={j} size={13} fill="#fbbf24" stroke="none" />)}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.6, margin: 0 }}>{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48 }}>
            <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Te puede gustar</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 18 }}>
              {related.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
