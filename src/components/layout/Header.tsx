import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingCart, User, X, Menu, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useIsMobile } from '@/hooks/useBreakpoint'
import watoLogo from '@/assets/brand/wato-logo.png'
import { STORE_CONFIG } from '@/config/store'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  const cartCount = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)
  const wishlistCount = useWishlistStore((s) => s.ids.length)
  const { user, openAuthModal } = useAuthStore()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [location.pathname])

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contacto', label: 'Contacto' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setMenuOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          height: 64,
          borderBottom: '1px solid',
          borderBottomColor: scrolled ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
          background: scrolled
            ? 'color-mix(in srgb, var(--bg-0) 88%, transparent)'
            : 'color-mix(in srgb, var(--bg-0) 50%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Scroll progress bar */}
        <div
          style={{
            position: 'absolute', bottom: -1, left: 0, height: 2,
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #E60412, #F14555 60%, #4CC3E3)',
            boxShadow: '0 0 10px rgba(230,4,18,0.7)',
            transition: 'width 0.08s linear', zIndex: 2, borderRadius: '0 1px 1px 0',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr auto' : '1fr auto 1fr',
            alignItems: 'center',
            height: '100%',
            padding: `0 ${isMobile ? 16 : 48}px`,
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', justifySelf: 'start' }}>
            <img
              src={watoLogo} alt="WATO STORE"
              style={{ height: 28, width: 28, borderRadius: 6, objectFit: 'cover', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 0 20px rgba(230,4,18,0.30)' }}
            />
            <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: 'var(--fg-0)' }}>
              WATO<span style={{ color: '#E60412' }}>.</span>STORE
            </span>
          </Link>

          {/* Nav center — desktop only */}
          {!isMobile && (
            !searchOpen ? (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                {navLinks.map((l) => {
                  const active = location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to))
                  return (
                    <Link
                      key={l.to} to={l.to}
                      style={{ fontSize: 14, fontWeight: 500, color: active ? 'var(--fg-0)' : 'var(--fg-1)', textDecoration: 'none', padding: '4px 0', position: 'relative', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg-0)' }}
                      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg-1)' }}
                    >
                      {l.label}
                      {active && (
                        <span style={{ position: 'absolute', bottom: -23, left: 0, right: 0, height: 2, background: '#E60412', boxShadow: '0 0 8px rgba(230,4,18,0.6)', borderRadius: 1 }} />
                      )}
                    </Link>
                  )
                })}
              </nav>
            ) : (
              <form onSubmit={handleSearch} style={{ position: 'relative', width: 340 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b6b73', pointerEvents: 'none' }} />
                <input autoFocus className="wato-input" style={{ paddingLeft: 36, width: '100%' }} placeholder="Buscar juegos, géneros..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </form>
            )
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end' }}>
            {!isMobile && (
              <button className="btn-icon" onClick={() => setSearchOpen((v) => !v)} title="Buscar">
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
            )}

            {user ? (
              <Link to="/perfil?tab=wishlist" className="btn-icon" title="Lista de deseos" style={{ textDecoration: 'none', display: 'grid', placeItems: 'center', position: 'relative' }}>
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 4, background: '#E60412', color: 'white', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8, display: 'grid', placeItems: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ) : (
              <button className="btn-icon" title="Lista de deseos" onClick={() => openAuthModal('login')} style={{ position: 'relative' }}>
                <Heart size={18} />
              </button>
            )}

            {user?.email === STORE_CONFIG.adminEmail && (
              <Link to="/admin" className="btn-icon" title="Admin" style={{ textDecoration: 'none', display: 'grid', placeItems: 'center', color: '#E60412' }}>
                <ShieldCheck size={18} />
              </Link>
            )}

            <button className="btn-icon" onClick={openCart} title="Carrito" style={{ position: 'relative' }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, background: '#E60412', color: 'white', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8, display: 'grid', placeItems: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <Link to="/perfil" className="btn-icon" title="Mi cuenta" style={{ textDecoration: 'none', display: 'grid', placeItems: 'center' }}>
                <User size={18} />
              </Link>
            ) : (
              <button className="btn-icon" title="Iniciar sesión" onClick={() => openAuthModal('login')}>
                <User size={18} />
              </button>
            )}

            {/* Hamburger — mobile only */}
            {isMobile && (
              <button className="btn-icon" onClick={() => setMenuOpen((v) => !v)} title="Menú">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
              background: 'color-mix(in srgb, var(--bg-0) 96%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 99,
              display: 'flex', flexDirection: 'column',
              padding: '32px 24px',
              gap: 8,
            }}
          >
            {/* Search */}
            <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b6b73', pointerEvents: 'none' }} />
              <input className="wato-input" style={{ paddingLeft: 36, width: '100%' }} placeholder="Buscar juegos..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </form>

            {navLinks.map((l) => {
              const active = location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to))
              return (
                <Link
                  key={l.to} to={l.to}
                  style={{
                    fontSize: 22, fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif',
                    letterSpacing: '-0.02em',
                    color: active ? '#E60412' : 'var(--fg-0)',
                    textDecoration: 'none', padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                    transition: 'color 0.15s',
                  }}
                >
                  {l.label}
                </Link>
              )
            })}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <Link to="/perfil" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-1)', textDecoration: 'none' }}>
                  <User size={16} /> Mi cuenta
                </Link>
              ) : (
                <button
                  onClick={() => { openAuthModal('login'); setMenuOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-1)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <User size={16} /> Iniciar sesión
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
