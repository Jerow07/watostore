import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AccountType } from '@/store/cartStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPriceARS } from '@/lib/format'

export interface Game {
  id: string
  title: string
  slug: string
  genres: string[]
  rating: number
  reviewsCount: number
  rentalsCount: number
  price: { primary: number; secondary: number }
  stock: { primary: number; secondary: number }
  description: string
  features: string[]
  tags: string[]
  cover: string
  created_at?: string
}

interface Props {
  game: Game
  accountType?: AccountType
}

export default function GameCard({ game, accountType }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const { toggle, has } = useWishlistStore()
  const inWishlist = has(game.id)
  const showBoth = accountType === undefined

  const cartQty = (type: AccountType) =>
    cartItems.find((i) => i.gameId === game.id && i.accountType === type)?.qty ?? 0

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(game.id)
  }

  const handleAdd = (e: React.MouseEvent, type: AccountType) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ gameId: game.id, title: game.title, slug: game.slug, accountType: type, price: game.price[type] })
  }

  const isNew = game.created_at
    ? Date.now() - new Date(game.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false

  // single-type helpers
  const type = accountType ?? 'primary'
  const price = game.price[type]
  const stock = game.stock[type]
  const stockLabel = stock === 0 ? 'En uso' : stock === 1 ? 'Último' : 'Disponible'
  const stockClass = stock === 0 ? 'badge-stock-out' : stock === 1 ? 'badge-stock-low' : 'badge-stock-ok'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="game-card"
    >
      <Link to={`/producto/${game.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {/* Cover */}
        <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg-3)' }}>
          <img
            src={game.cover}
            alt={game.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Top badges */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              right: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            {showBoth ? (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <span className="badge-primary">Primaria</span>
                <span className="badge-secondary">Secundaria</span>
              </div>
            ) : (
              <span className={accountType === 'primary' ? 'badge-primary' : 'badge-secondary'}>
                {accountType === 'primary' ? 'Primaria' : 'Secundaria'}
              </span>
            )}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 1.2 }}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                color: inWishlist ? '#E60412' : 'white',
                transition: 'background 0.2s, color 0.2s',
                flexShrink: 0,
              }}
            >
              <Heart size={14} fill={inWishlist ? '#E60412' : 'none'} stroke={inWishlist ? '#E60412' : 'currentColor'} />
            </motion.button>
          </div>

          {/* New badge */}
          {isNew && (
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, background: '#E60412', color: 'white' }}>
                Nuevo
              </span>
            </div>
          )}

          {/* Stock badge — single mode only */}
          {!showBoth && (
            <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
              <span className={stockClass}>{stockLabel}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 12px' }}>
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {game.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--fg-3)',
              marginBottom: 10,
            }}
          >
            <span>{game.genres[0]}</span>
            <span>·</span>
            <span style={{ color: '#fbbf24' }}>★ {game.rating}</span>
          </div>

          {showBoth ? (
            <div style={{ display: 'grid', gap: 6 }}>
              {(['primary', 'secondary'] as const).map((t) => {
                const s = game.stock[t]
                const p = game.price[t]
                const sClass = s === 0 ? 'badge-stock-out' : s === 1 ? 'badge-stock-low' : 'badge-stock-ok'
                const sLabel = s === 0 ? 'En uso' : s === 1 ? 'Último' : 'Disponible'
                const disabled = s === 0 || cartQty(t) >= s
                return (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, opacity: s === 0 ? 0.45 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span className={t === 'primary' ? 'badge-primary' : 'badge-secondary'} style={{ flexShrink: 0 }}>
                        {t === 'primary' ? 'Pri' : 'Sec'}
                      </span>
                      <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 15 }}>
                        <span style={{ fontSize: 9, color: 'var(--fg-3)', fontWeight: 500, marginRight: 2 }}>ARS</span>
                        {p.toLocaleString('es-AR')}
                      </span>
                      <span className={sClass} style={{ flexShrink: 0 }}>{sLabel}</span>
                    </div>
                    <button
                      onClick={(e) => handleAdd(e, t)}
                      disabled={disabled}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'var(--bg-3)',
                        border: 'none',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        color: disabled ? 'var(--fg-3)' : 'var(--fg-0)',
                        opacity: disabled ? 0.4 : 1,
                        transition: 'background 0.15s, transform 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (disabled) return
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.background = '#E60412'
                        b.style.transform = 'rotate(90deg)'
                      }}
                      onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.background = 'var(--bg-3)'
                        b.style.transform = 'rotate(0deg)'
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500, marginRight: 2 }}>ARS</span>
                {price.toLocaleString('es-AR')}
              </div>
              {(() => {
                const disabledSingle = stock === 0 || cartQty(type) >= stock
                return (
                  <button
                    onClick={(e) => handleAdd(e, type)}
                    disabled={disabledSingle}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: 'var(--bg-3)',
                      border: 'none',
                      cursor: disabledSingle ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      color: disabledSingle ? 'var(--fg-3)' : 'var(--fg-0)',
                      opacity: disabledSingle ? 0.4 : 1,
                      transition: 'background 0.15s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (disabledSingle) return
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.background = '#E60412'
                      b.style.transform = 'rotate(90deg)'
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.background = 'var(--bg-3)'
                      b.style.transform = 'rotate(0deg)'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                )
              })()}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

// also export formatPriceARS for reuse
export { formatPriceARS }
