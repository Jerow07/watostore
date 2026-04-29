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
}

interface Props {
  game: Game
  accountType?: AccountType
}

export default function GameCard({ game, accountType = 'primary' }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, has } = useWishlistStore()
  const inWishlist = has(game.id)

  const price = game.price[accountType]
  const stock = game.stock[accountType]
  const stockLabel = stock === 0 ? 'Sin stock' : stock <= 3 ? 'Pocas unidades' : 'Disponible'
  const stockClass = stock === 0 ? 'badge-stock-low' : stock <= 3 ? 'badge-stock-low' : 'badge-stock-ok'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ gameId: game.id, title: game.title, slug: game.slug, accountType, price })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(game.id)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="game-card"
    >
      <Link to={`/producto/${game.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {/* Cover */}
        <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg-3)' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 8px, transparent 8px, transparent 16px), linear-gradient(180deg, #25252c, #1a1a1f)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: 'var(--fg-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textAlign: 'center',
                padding: '0 12px',
              }}
            >
              {game.title}
            </span>
          </div>

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
            <span className={accountType === 'primary' ? 'badge-primary' : 'badge-secondary'}>
              {accountType === 'primary' ? 'Primaria' : 'Secundaria'}
            </span>
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
              }}
            >
              <Heart size={14} fill={inWishlist ? '#E60412' : 'none'} stroke={inWishlist ? '#E60412' : 'currentColor'} />
            </motion.button>
          </div>

          {/* Stock badge */}
          <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
            <span className={stockClass}>{stockLabel}</span>
          </div>
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
              marginBottom: 12,
            }}
          >
            <span>{game.genres[0]}</span>
            <span>·</span>
            <span style={{ color: '#fbbf24' }}>★ {game.rating}</span>
          </div>
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
            <button
              onClick={handleAdd}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--bg-3)',
                border: 'none',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--fg-0)',
                transition: 'background 0.15s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
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
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// also export formatPriceARS for reuse
export { formatPriceARS }
