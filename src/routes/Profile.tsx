import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Heart, User, LogOut, ShoppingBag, Download, MapPin, LayoutDashboard, Pencil, Loader2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GameCard from '@/components/product/GameCard'
import type { Game } from '@/components/product/GameCard'
import { useGamesStore } from '@/store/gamesStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { playSound } from '@/lib/audio'

interface ProfileData {
  full_name: string
  phone: string
  street: string
  city: string
  province: string
  postal_code: string
  country: string
}

interface OrderItem {
  gameId: string
  title: string
  accountType: 'primary' | 'secondary'
  price: number
  qty: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: string
  created_at: string
}

const NAV = [
  { id: 'dashboard', label: 'Escritorio', icon: <LayoutDashboard size={16} /> },
  { id: 'orders', label: 'Pedidos', icon: <ShoppingBag size={16} /> },
  { id: 'downloads', label: 'Descargas', icon: <Download size={16} /> },
  { id: 'address', label: 'Dirección', icon: <MapPin size={16} /> },
  { id: 'account', label: 'Detalles de la cuenta', icon: <User size={16} /> },
  { id: 'wishlist', label: 'Lista de deseos', icon: <Heart size={16} /> },
]

const EMPTY_PROFILE: ProfileData = {
  full_name: '', phone: '', street: '', city: '',
  province: '', postal_code: '', country: 'Argentina',
}

export default function Profile() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, signOut, openAuthModal, loading: authLoading } = useAuthStore()
  const isMobile = useIsMobile()

  const [tab, setTab] = useState(params.get('tab') ?? 'dashboard')
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE)
  const [profileForm, setProfileForm] = useState<ProfileData>(EMPTY_PROFILE)
  const [addressForm, setAddressForm] = useState<ProfileData>(EMPTY_PROFILE)
  const [editingAddress, setEditingAddress] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const ALL_GAMES = useGamesStore((s) => s.games)
  const { ids } = useWishlistStore()
  const wishlistGames = ALL_GAMES.filter((g) => ids.includes(g.id))

  // Play sound on enter
  useEffect(() => {
    playSound('/sounds/profile-enter.mp3', 0.8)
  }, [])

  // Redirect if not logged in (wait for auth to resolve first)
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/')
      openAuthModal('login')
    }
  }, [user, authLoading, navigate, openAuthModal])

  // Load profile + orders from Supabase
  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoadingProfile(true)

      const [{ data: prof }, { data: ord }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*').eq('customer_email', user.email).order('created_at', { ascending: false }),
      ])

      if (prof) {
        const p: ProfileData = {
          full_name: prof.full_name ?? '',
          phone: prof.phone ?? '',
          street: prof.street ?? '',
          city: prof.city ?? '',
          province: prof.province ?? '',
          postal_code: prof.postal_code ?? '',
          country: prof.country ?? 'Argentina',
        }
        setProfile(p)
        setProfileForm(p)
        setAddressForm(p)
      }
      if (ord) setOrders(ord)
      setLoadingProfile(false)
    }
    load()
  }, [user])

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
    }).eq('id', user.id)
    setProfile((p) => ({ ...p, full_name: profileForm.full_name, phone: profileForm.phone }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const saveAddress = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({
      street: addressForm.street,
      city: addressForm.city,
      province: addressForm.province,
      postal_code: addressForm.postal_code,
      country: addressForm.country,
    }).eq('id', user.id)
    setProfile((p) => ({ ...p, ...addressForm }))
    setEditingAddress(false)
    setSaving(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const sidebarItemStyle = (id: string) => ({
    display: 'flex' as const, alignItems: 'center' as const, gap: 11,
    padding: '12px 16px', borderRadius: 0, fontSize: 14,
    color: tab === id ? '#E60412' : 'var(--fg-1)',
    background: 'transparent', border: 'none',
    borderLeft: !isMobile ? `2px solid ${tab === id ? '#E60412' : 'transparent'}` : 'none',
    borderBottom: isMobile ? `2px solid ${tab === id ? '#E60412' : 'transparent'}` : 'none',
    cursor: 'pointer' as const, fontFamily: 'inherit',
    textAlign: 'left' as const, width: isMobile ? 'auto' : '100%',
    transition: 'all 0.15s', fontWeight: tab === id ? 600 : 400,
    whiteSpace: 'nowrap' as const,
  })

  if (authLoading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><Loader2 size={28} style={{ color: 'var(--fg-3)', animation: 'spin 1s linear infinite' }} /></div>
  if (!user) return null

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
        <img
          src="/assets/pikachu-sidebar.png"
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: '30%',
            left: -220,
            transform: 'translateY(-50%)',
            width: 220,
            pointerEvents: 'none',
            zIndex: 20,
            userSelect: 'none',
          }}
        />

        {/* Sidebar */}
        <aside style={{ borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none', paddingTop: isMobile ? 16 : 32, width: isMobile ? '100%' : 260, background: 'var(--bg-1)', position: 'relative', overflow: 'visible', flexShrink: 0 }}>
          <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E60412, #F14555)',
                display: 'grid', placeItems: 'center',
                fontFamily: '"Space Grotesk",sans-serif', fontSize: 18, fontWeight: 700,
                color: 'white', flexShrink: 0, boxShadow: '0 0 20px rgba(230,4,18,0.3)',
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 15 }}>
                  {profile.full_name || user.email?.split('@')[0]}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <nav style={{ display: isMobile ? 'flex' : 'block', overflowX: isMobile ? 'auto' : 'visible', whiteSpace: isMobile ? 'nowrap' : 'normal', paddingBottom: isMobile ? 8 : 0, WebkitOverflowScrolling: 'touch' }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)} style={sidebarItemStyle(n.id)}
                onMouseEnter={(e) => { if (tab !== n.id) (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-0)' }}
                onMouseLeave={(e) => { if (tab !== n.id) (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-1)' }}
              >
                <span style={{ opacity: 0.7 }}>{n.icon}</span>
                {n.label}
                {n.id === 'wishlist' && ids.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--fg-3)' }}>
                    {ids.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
            <button onClick={handleLogout}
              style={{ ...sidebarItemStyle('logout'), color: 'var(--fg-3)', borderLeft: '2px solid transparent' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#E60412')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)')}
            >
              <LogOut size={16} style={{ opacity: 0.7 }} /> Cerrar sesión
            </button>
          </div>

        </aside>

        {/* Content */}
        <main style={{ padding: isMobile ? '24px 16px' : '36px 40px', background: 'var(--bg-0)', flex: 1, minWidth: 0 }}>
          {loadingProfile ? (
            <div style={{ display: 'grid', placeItems: 'center', height: 200 }}>
              <Loader2 size={28} style={{ color: 'var(--fg-3)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                {/* ── ESCRITORIO ── */}
                {tab === 'dashboard' && (
                  <>
                    <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Escritorio</h2>
                    <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 28 }}>
                      Hola <strong style={{ color: 'var(--fg-0)' }}>{profile.full_name?.split(' ')[0] || user.email?.split('@')[0]}</strong>, bienvenido a tu cuenta.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
                      {[
                        { label: 'Alquileres activos', value: String(orders.filter(o => o.status === 'paid').length), color: '#4ade80' },
                        { label: 'Juegos deseados', value: String(ids.length), color: '#E60412' },
                        { label: 'Total pedidos', value: String(orders.length), color: '#4CC3E3' },
                      ].map((s) => (
                        <div key={s.label} style={{ padding: '20px 22px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12 }}>
                          <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                          <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                      Desde acá podés ver tus <button onClick={() => setTab('orders')} style={{ background: 'none', border: 'none', color: '#E60412', cursor: 'pointer', fontSize: 14, padding: 0, textDecoration: 'underline' }}>pedidos</button>,{' '}
                      administrar tu <button onClick={() => setTab('address')} style={{ background: 'none', border: 'none', color: '#E60412', cursor: 'pointer', fontSize: 14, padding: 0, textDecoration: 'underline' }}>dirección</button> y{' '}
                      editar los <button onClick={() => setTab('account')} style={{ background: 'none', border: 'none', color: '#E60412', cursor: 'pointer', fontSize: 14, padding: 0, textDecoration: 'underline' }}>detalles de tu cuenta</button>.
                    </p>
                  </>
                )}

                {/* ── PEDIDOS ── */}
                {tab === 'orders' && (
                  <>
                    <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Pedidos</h2>
                    <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 24 }}>Historial completo de alquileres</p>
                    {orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--fg-3)' }}>
                        <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 12px' }} />
                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                          Todavía no tenés pedidos
                        </p>
                        <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none', fontSize: 14 }}>Explorar catálogo</Link>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                        {orders.map((order) => (
                          <div key={order.id} style={{
                            display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14, alignItems: 'center',
                            padding: 14, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 10,
                            minWidth: isMobile ? 400 : 'auto',
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                                Pedido #{order.id.slice(0, 8).toUpperCase()}
                              </div>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {new Date(order.created_at).toLocaleDateString('es-AR')}
                              </div>
                            </div>
                            <span style={{
                              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
                              padding: '4px 10px', borderRadius: 4,
                              background: order.status === 'paid' ? 'rgba(74,222,128,0.15)' : order.status === 'cancelled' ? 'rgba(230,4,18,0.15)' : 'rgba(251,191,36,0.15)',
                              color: order.status === 'paid' ? '#4ade80' : order.status === 'cancelled' ? '#F14555' : '#fbbf24',
                            }}>
                              {order.status === 'paid' ? '● Activo' : order.status === 'cancelled' ? '✕ Cancelado' : '◐ Pendiente'}
                            </span>
                            <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 15 }}>
                              ${order.total.toLocaleString('es-AR')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── DESCARGAS ── */}
                {tab === 'downloads' && (() => {
                  const activeItems = orders
                    .filter(o => o.status === 'paid')
                    .flatMap(o => o.items.map(item => ({ ...item, orderDate: o.created_at })))
                  return (
                    <>
                      <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Descargas</h2>
                      <p style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 24 }}>Tus alquileres activos</p>
                      {activeItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--fg-3)' }}>
                          <Download size={48} strokeWidth={1} style={{ margin: '0 auto 12px' }} />
                          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                            No hay alquileres activos
                          </p>
                          <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none', fontSize: 14 }}>Explorar catálogo</Link>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                          {activeItems.map((item, i) => {
                            const game = ALL_GAMES.find(g => g.id === item.gameId)
                            if (!game) return null
                            return (
                              <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 16, alignItems: 'center', padding: 16, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, minWidth: isMobile ? 440 : 'auto' }}>
                                <img src={game.cover} alt={game.title} style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{game.title}</div>
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, background: item.accountType === 'primary' ? 'rgba(230,4,18,0.15)' : 'rgba(76,195,227,0.15)', color: item.accountType === 'primary' ? '#F14555' : '#4CC3E3' }}>
                                      {item.accountType === 'primary' ? 'Primaria' : 'Secundaria'}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                                      {new Date(item.orderDate).toLocaleDateString('es-AR')}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', display: 'inline-block' }} />
                                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Activo</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* ── DIRECCIÓN ── */}
                {tab === 'address' && (
                  <>
                    <p style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 28 }}>
                      Las siguientes direcciones se utilizarán de forma predeterminada en la página de pago.
                    </p>
                    <div style={{ maxWidth: 560 }}>
                      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Dirección de facturación</h3>
                        </div>
                        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                          <button onClick={() => setEditingAddress(!editingAddress)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: '#E60412', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: editingAddress ? 'none' : 'underline' }}>
                            <Pencil size={13} /> {editingAddress ? 'Cancelar edición' : 'Editar Dirección de facturación'}
                          </button>
                        </div>
                        <div style={{ padding: '20px 24px', background: 'var(--bg-1)' }}>
                          {editingAddress ? (
                            <div style={{ display: 'grid', gap: 14 }}>
                              {[
                                { key: 'full_name', label: 'Nombre completo' },
                                { key: 'street', label: 'Calle y número' },
                                { key: 'city', label: 'Ciudad' },
                                { key: 'province', label: 'Provincia' },
                                { key: 'postal_code', label: 'Código postal' },
                              ].map((field) => (
                                <div key={field.key}>
                                  <label style={{ fontSize: 11, color: 'var(--fg-2)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{field.label}</label>
                                  <input className="wato-input" value={addressForm[field.key as keyof ProfileData]}
                                    onChange={(e) => setAddressForm((f) => ({ ...f, [field.key]: e.target.value }))} />
                                </div>
                              ))}
                              <button className="btn-primary" style={{ width: 'fit-content', fontSize: 14 }} onClick={saveAddress} disabled={saving}>
                                {saving ? <Loader2 size={15} /> : 'Guardar dirección'}
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: 6 }}>
                              {profile.street ? (
                                [profile.full_name, profile.street, profile.city, profile.province, profile.postal_code].map((line, i) => (
                                  <p key={i} style={{ margin: 0, fontSize: 15, color: 'var(--fg-1)', fontStyle: 'italic' }}>{line}</p>
                                ))
                              ) : (
                                <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>No hay dirección guardada.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── DETALLES DE LA CUENTA ── */}
                {tab === 'account' && (
                  <>
                    <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Detalles de la cuenta</h2>
                    <div style={{ maxWidth: 440, display: 'grid', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Nombre completo</label>
                        <input className="wato-input" type="text" value={profileForm.full_name}
                          onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email</label>
                        <input className="wato-input" type="email" value={user.email ?? ''} disabled
                          style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Teléfono</label>
                        <input className="wato-input" type="tel" placeholder="+54 11 0000-0000"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <button className="btn-primary" style={{ width: 'fit-content', fontSize: 14, gap: 8 }} onClick={saveProfile} disabled={saving}>
                        {saving ? <Loader2 size={15} /> : saved ? <><Check size={15} /> Guardado</> : 'Guardar cambios'}
                      </button>
                    </div>
                  </>
                )}

                {/* ── LISTA DE DESEOS ── */}
                {tab === 'wishlist' && (
                  <>
                    <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Mis Deseados</h2>
                    {wishlistGames.length === 0 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-1)', marginBottom: 20 }}>
                          <div style={{ width: 20, height: 20, border: '1px solid var(--border-strong)', borderRadius: 4, flexShrink: 0 }} />
                          <span style={{ fontSize: 14, color: 'var(--fg-2)' }}>Tu lista de deseos está vacía.</span>
                        </div>
                        <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none', fontSize: 14 }}>Volver al catálogo</Link>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 14 }}>
                        {wishlistGames.map((g) => <GameCard key={g.id} game={g} />)}
                      </div>
                    )}
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--fg-2)',
  fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  display: 'block', marginBottom: 6,
}
