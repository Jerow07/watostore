import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Clock, ShoppingBag, TrendingUp, Loader2, RefreshCw, Gamepad2, EyeOff, Eye, Plus, Save, X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useGamesStore } from '@/store/gamesStore'
import { formatPriceARS } from '@/lib/format'
import { STORE_CONFIG } from '@/config/store'
import { useIsMobile } from '@/hooks/useBreakpoint'

const ADMIN_EMAIL = STORE_CONFIG.adminEmail

/* ── Types ─────────────────────────────────────────── */
interface OrderItem { gameId: string; title: string; accountType: 'primary' | 'secondary'; price: number; qty: number }
interface Order {
  id: string; customer_name: string; customer_lastname: string
  customer_email: string; customer_phone: string; items: OrderItem[]
  subtotal: number; discount_amount: number; total: number
  payment_method: string; status: string; created_at: string; expires_at: string | null
}
interface AdminGame {
  id: string; title: string; slug: string; cover: string; genres: string[]
  price_primary: number; price_secondary: number
  stock_primary: number; stock_secondary: number; active: boolean
  description: string; features: string[]; tags: string[]
}
interface NewGameForm {
  title: string; slug: string; cover: string; genres: string
  price_primary: string; price_secondary: string
  stock_primary: string; stock_secondary: string; description: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pend. MercadoPago', pending_transfer: 'Pend. transferencia',
  paid: 'Pagado / Activo', cancelled: 'Cancelado', expired: 'Vencido',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#fbbf24', pending_transfer: '#fbbf24', paid: '#4ade80', cancelled: '#F14555', expired: '#6b6b73',
}

function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
const STOCK_LABELS = ['En uso', 'Último', 'Disponible']

const EMPTY_FORM: NewGameForm = {
  title: '', slug: '', cover: '', genres: '', description: '',
  price_primary: '', price_secondary: '', stock_primary: '2', stock_secondary: '2',
}

/* ── Component ─────────────────────────────────────── */
export default function Admin() {
  const { user, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()
  const loadGames = useGamesStore((s) => s.loadGames)
  const isMobile = useIsMobile()

  const [tab, setTab] = useState<'orders' | 'games'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [adminGames, setAdminGames] = useState<AdminGame[]>([])
  const [gameSearch, setGameSearch] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingGames, setLoadingGames] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [editingGame, setEditingGame] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<AdminGame>>({})
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newForm, setNewForm] = useState<NewGameForm>(EMPTY_FORM)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/'); return }
    if (user.email !== ADMIN_EMAIL) { navigate('/'); return }
    fetchOrders()
    fetchGames()
  }, [user, authLoading, navigate])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoadingOrders(false)
  }

  const fetchGames = async () => {
    setLoadingGames(true)
    const { data } = await supabase.from('games').select('id,title,slug,cover,genres,price_primary,price_secondary,stock_primary,stock_secondary,active,description,features,tags').order('id')
    if (data) setAdminGames(data)
    setLoadingGames(false)
  }

  const approveOrder = async (id: string) => {
    setApproving(id)
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('orders').update({ status: 'paid', expires_at }).eq('id', id)
    setOrders(p => p.map(o => o.id === id ? { ...o, status: 'paid', expires_at } : o))
    setApproving(null)
  }

  const cancelOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id)
    setOrders(p => p.map(o => o.id === id ? { ...o, status: 'cancelled' } : o))
  }

  const expireOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'expired' }).eq('id', id)
    setOrders(p => p.map(o => o.id === id ? { ...o, status: 'expired' } : o))
    const order = orders.find(o => o.id === id)
    if (order) {
      const uniqueGameIds = [...new Set(order.items.map(i => i.gameId))]
      for (const gameId of uniqueGameIds) {
        const game = adminGames.find(g => g.id === gameId)
        if (game) {
          supabase.functions.invoke('notify-availability', {
            body: { game_id: gameId, game_title: game.title, game_slug: game.slug },
          })
        }
      }
    }
  }

  const startEdit = (game: AdminGame) => {
    setEditingGame(game.id)
    setEditValues({ price_primary: game.price_primary, price_secondary: game.price_secondary, stock_primary: game.stock_primary, stock_secondary: game.stock_secondary })
  }

  const saveGame = async (id: string) => {
    setSaving(true)
    await supabase.from('games').update({ ...editValues, updated_at: new Date().toISOString() }).eq('id', id)
    setAdminGames(p => p.map(g => g.id === id ? { ...g, ...editValues } : g))
    await loadGames()
    setEditingGame(null)
    setSaving(false)
  }

  const toggleActive = async (game: AdminGame) => {
    const active = !game.active
    await supabase.from('games').update({ active }).eq('id', game.id)
    setAdminGames(p => p.map(g => g.id === game.id ? { ...g, active } : g))
    await loadGames()
  }

  const addGame = async () => {
    const maxId = Math.max(...adminGames.map(g => parseInt(g.id) || 0))
    const newId = String(maxId + 1)
    const genres = newForm.genres.split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('games').insert({
      id: newId,
      title: newForm.title,
      slug: newForm.slug || newForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      cover: newForm.cover,
      genres,
      rating: 4.5,
      reviews_count: 0,
      rentals_count: 0,
      price_primary: Number(newForm.price_primary),
      price_secondary: Number(newForm.price_secondary),
      stock_primary: Number(newForm.stock_primary),
      stock_secondary: Number(newForm.stock_secondary),
      description: newForm.description,
      features: [],
      tags: [],
      active: true,
    })
    if (!error) {
      setShowAddForm(false)
      setNewForm(EMPTY_FORM)
      fetchGames()
      await loadGames()
    }
  }

  const uploadCover = async (file: File) => {
    setUploadingCover(true)
    const ext = file.name.split('.').pop() ?? 'webp'
    const path = `covers/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('game-covers').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('game-covers').getPublicUrl(path)
      setNewForm(p => ({ ...p, cover: data.publicUrl }))
    }
    setUploadingCover(false)
  }

  if (authLoading) return <div style={{ paddingTop: 120, display: 'grid', placeItems: 'center', minHeight: '100vh' }}><Loader2 size={32} style={{ color: 'var(--fg-3)', animation: 'spin 1s linear infinite' }} /></div>
  if (!user || user.email !== ADMIN_EMAIL) return null

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending_transfer' || o.status === 'pending').length
  const paidOrders = orders.filter(o => o.status === 'paid').length
  const revenue = orders.filter(o => o.status === 'paid').reduce((a, o) => a + o.total, 0)

  const tabStyle = (t: 'orders' | 'games') => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    background: tab === t ? '#E60412' : 'var(--bg-2)',
    color: tab === t ? 'white' : 'var(--fg-2)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 4 }}>Panel de administración</p>
            <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Admin</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={tabStyle('orders')} onClick={() => setTab('orders')}><ShoppingBag size={14} style={{ display: 'inline', marginRight: 6 }} />Pedidos</button>
            <button style={tabStyle('games')} onClick={() => setTab('games')}><Gamepad2 size={14} style={{ display: 'inline', marginRight: 6 }} />Juegos</button>
          </div>
        </div>

        {/* ── PEDIDOS ── */}
        {tab === 'orders' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total pedidos', value: String(totalOrders), color: '#4CC3E3', icon: <ShoppingBag size={16} /> },
                { label: 'Pendientes', value: String(pendingOrders), color: '#fbbf24', icon: <Clock size={16} /> },
                { label: 'Aprobados', value: String(paidOrders), color: '#4ade80', icon: <Check size={16} /> },
                { label: 'Ingresos', value: formatPriceARS(revenue), color: '#E60412', icon: <TrendingUp size={16} /> },
              ].map(s => (
                <div key={s.label} style={{ padding: '16px 18px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={fetchOrders} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', color: 'var(--fg-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'inherit' }}>
                <RefreshCw size={13} /> Actualizar
              </button>
            </div>

            {loadingOrders ? (
              <div style={{ display: 'grid', placeItems: 'center', height: 200 }}>
                <Loader2 size={28} style={{ color: 'var(--fg-3)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--fg-3)' }}>
                <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin pedidos aún</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {orders.map(order => (
                  <div key={order.id} style={{ padding: '16px 20px', background: 'var(--bg-1)', border: `1px solid ${order.status === 'pending_transfer' ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`, borderRadius: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 13 }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 4, background: `${STATUS_COLOR[order.status]}20`, color: STATUS_COLOR[order.status] }}>
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, background: 'var(--bg-3)', color: 'var(--fg-3)' }}>
                            {order.payment_method === 'mp' ? 'MercadoPago' : 'Transferencia'}
                          </span>
                          {order.status === 'paid' && order.expires_at && (() => {
                            const days = daysUntilExpiry(order.expires_at)
                            if (days === null) return null
                            const color = days <= 0 ? '#F14555' : days <= 3 ? '#f97316' : '#4ade80'
                            const label = days <= 0 ? 'Expirado' : `Vence en ${days}d`
                            return (
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 4, background: `${color}20`, color }}>
                                {label}
                              </span>
                            )
                          })()}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--fg-1)', marginBottom: 4 }}>
                          <strong>{order.customer_name} {order.customer_lastname}</strong>
                          <span style={{ color: 'var(--fg-3)', marginLeft: 8 }}>{order.customer_email}</span>
                          <span style={{ color: 'var(--fg-3)', marginLeft: 8 }}>· {order.customer_phone}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                          {order.items.map((item, i) => (
                            <span key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-2)', color: 'var(--fg-2)', border: '1px solid var(--border)' }}>
                              {item.title} · {item.accountType === 'primary' ? 'Pri' : 'Sec'} ×{item.qty}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                          {new Date(order.created_at).toLocaleString('es-AR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 17, color: '#E60412' }}>{formatPriceARS(order.total)}</div>
                        {(order.status === 'pending_transfer' || order.status === 'pending') && (
                          <>
                            <button onClick={() => approveOrder(order.id)} disabled={approving === order.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#4ade80', border: 'none', borderRadius: 7, color: '#0a0a0c', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: approving === order.id ? 0.6 : 1 }}>
                              {approving === order.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />} Aprobar
                            </button>
                            <button onClick={() => cancelOrder(order.id)}
                              style={{ padding: '5px 12px', background: 'none', border: '1px solid rgba(230,4,18,0.4)', borderRadius: 7, color: '#F14555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Cancelar
                            </button>
                          </>
                        )}
                        {order.status === 'paid' && (
                          <button onClick={() => expireOrder(order.id)}
                            style={{ padding: '5px 12px', background: 'none', border: '1px solid rgba(230,4,18,0.4)', borderRadius: 7, color: '#F14555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Expirar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── JUEGOS ── */}
        {tab === 'games' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ color: 'var(--fg-3)', fontSize: 13 }}>{adminGames.length} juegos · {adminGames.filter(g => g.active).length} activos</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={fetchGames} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', color: 'var(--fg-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'inherit' }}>
                  <RefreshCw size={13} /> Actualizar
                </button>
                <button onClick={() => { setShowAddForm(v => !v); setNewForm(EMPTY_FORM) }} style={{ background: showAddForm ? 'var(--bg-3)' : '#E60412', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                  {showAddForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Agregar juego</>}
                </button>
              </div>
            </div>

            {/* Search bar */}
            <input
              className="wato-input"
              placeholder="Buscar juego por nombre..."
              value={gameSearch}
              onChange={e => setGameSearch(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            {/* Add game form */}
            {showAddForm && (
              <div style={{ padding: 24, background: 'var(--bg-1)', border: '1px solid rgba(230,4,18,0.3)', borderRadius: 14, marginBottom: 20 }}>
                <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 20px' }}>Nuevo juego</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { key: 'title', label: 'Título *', placeholder: 'The Legend of Zelda...' },
                    { key: 'slug', label: 'Slug (URL)', placeholder: 'zelda-totk (auto si vacío)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input className="wato-input" placeholder={f.placeholder} value={newForm[f.key as keyof NewGameForm]}
                        onChange={e => setNewForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}

                  {/* Cover upload */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Cover *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: newForm.cover ? '120px 1fr' : '1fr', gap: 12, alignItems: 'start' }}>
                      {newForm.cover && (
                        <img src={newForm.cover} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      )}
                      <div>
                        <div
                          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={e => {
                            e.preventDefault(); setIsDragging(false)
                            const file = e.dataTransfer.files[0]
                            if (file) uploadCover(file)
                          }}
                          onClick={() => { const inp = document.getElementById('cover-file-input') as HTMLInputElement; inp?.click() }}
                          style={{
                            border: `2px dashed ${isDragging ? '#E60412' : 'var(--border)'}`,
                            borderRadius: 10, padding: '24px 16px', textAlign: 'center',
                            cursor: 'pointer', background: isDragging ? 'rgba(230,4,18,0.05)' : 'var(--bg-2)',
                            transition: 'all 0.15s', marginBottom: 8,
                          }}
                        >
                          <input id="cover-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
                          {uploadingCover
                            ? <Loader2 size={20} style={{ color: 'var(--fg-3)', animation: 'spin 1s linear infinite', margin: '0 auto 6px' }} />
                            : <Upload size={20} style={{ color: 'var(--fg-3)', margin: '0 auto 6px' }} />}
                          <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>
                            {uploadingCover ? 'Subiendo...' : 'Arrastrá la imagen o hacé click'}
                          </p>
                        </div>
                        <input className="wato-input" placeholder="O pegá una URL directamente" value={newForm.cover}
                          onChange={e => setNewForm(p => ({ ...p, cover: e.target.value }))} style={{ fontSize: 12 }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Géneros (separados por coma)</label>
                    <input className="wato-input" placeholder="Acción, Aventura" value={newForm.genres}
                      onChange={e => setNewForm(p => ({ ...p, genres: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea className="wato-input" placeholder="Descripción del juego..." rows={3} value={newForm.description}
                      onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  {[
                    { key: 'price_primary', label: 'Precio Primaria (ARS)' },
                    { key: 'price_secondary', label: 'Precio Secundaria (ARS)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input className="wato-input" type="number" placeholder="0" value={newForm[f.key as keyof NewGameForm]}
                        onChange={e => setNewForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Stock Primaria</label>
                    <select className="wato-input" value={newForm.stock_primary} onChange={e => setNewForm(p => ({ ...p, stock_primary: e.target.value }))}>
                      <option value="0">0 — En uso</option>
                      <option value="1">1 — Último</option>
                      <option value="2">2 — Disponible</option>
                      <option value="3">3 — Disponible</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Stock Secundaria</label>
                    <select className="wato-input" value={newForm.stock_secondary} onChange={e => setNewForm(p => ({ ...p, stock_secondary: e.target.value }))}>
                      <option value="0">0 — En uso</option>
                      <option value="1">1 — Último</option>
                      <option value="2">2 — Disponible</option>
                      <option value="3">3 — Disponible</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={addGame} className="btn-primary" style={{ fontSize: 14 }}
                    disabled={!newForm.title || !newForm.cover || !newForm.price_primary || !newForm.price_secondary}>
                    <Plus size={15} /> Agregar juego
                  </button>
                  <button onClick={() => { setShowAddForm(false); setNewForm(EMPTY_FORM) }} className="btn-ghost" style={{ fontSize: 14 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {loadingGames ? (
              <div style={{ display: 'grid', placeItems: 'center', height: 200 }}>
                <Loader2 size={28} style={{ color: 'var(--fg-3)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {adminGames.filter(g => {
                  const q = gameSearch.toLowerCase()
                  if (!q) return true
                  return (
                    g.title.toLowerCase().includes(q) ||
                    g.slug.toLowerCase().includes(q) ||
                    g.description?.toLowerCase().includes(q) ||
                    g.genres?.some(x => x.toLowerCase().includes(q)) ||
                    g.features?.some(x => x.toLowerCase().includes(q)) ||
                    g.tags?.some(x => x.toLowerCase().includes(q))
                  )
                }).map(game => (
                  <div key={game.id} style={{ padding: '14px 16px', background: 'var(--bg-1)', border: `1px solid ${!game.active ? 'rgba(255,255,255,0.04)' : 'var(--border)'}`, borderRadius: 10, opacity: game.active ? 1 : 0.5 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 14, alignItems: 'center' }}>
                      <img src={game.cover} alt={game.title} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', background: 'var(--bg-3)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{game.title}</div>
                        {editingGame === game.id ? (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            {[
                              { key: 'price_primary', label: 'Pri $' },
                              { key: 'price_secondary', label: 'Sec $' },
                            ].map(f => (
                              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 10, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{f.label}</span>
                                <input type="number" value={editValues[f.key as keyof AdminGame] as number}
                                  onChange={e => setEditValues(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                                  style={{ width: 90, padding: '4px 8px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--fg-0)', fontSize: 13, fontFamily: 'inherit' }} />
                              </div>
                            ))}
                            {[
                              { key: 'stock_primary', label: 'Stock Pri' },
                              { key: 'stock_secondary', label: 'Stock Sec' },
                            ].map(f => (
                              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 10, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{f.label}</span>
                                <select value={editValues[f.key as keyof AdminGame] as number}
                                  onChange={e => setEditValues(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                                  style={{ padding: '4px 8px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--fg-0)', fontSize: 12, fontFamily: 'inherit' }}>
                                  <option value={0}>0 — En uso</option>
                                  <option value={1}>1 — Último</option>
                                  <option value={2}>2 — Disponible</option>
                                  <option value={3}>3 — Disponible</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>Pri: <strong style={{ color: 'var(--fg-0)' }}>{formatPriceARS(game.price_primary)}</strong></span>
                            <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>Sec: <strong style={{ color: 'var(--fg-0)' }}>{formatPriceARS(game.price_secondary)}</strong></span>
                            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', padding: '1px 7px', borderRadius: 4, background: game.stock_primary === 0 ? 'rgba(230,4,18,0.12)' : game.stock_primary === 1 ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)', color: game.stock_primary === 0 ? '#F14555' : game.stock_primary === 1 ? '#fbbf24' : '#4ade80' }}>
                              Pri: {STOCK_LABELS[Math.min(game.stock_primary, 2)]}
                            </span>
                            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', padding: '1px 7px', borderRadius: 4, background: game.stock_secondary === 0 ? 'rgba(230,4,18,0.12)' : game.stock_secondary === 1 ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)', color: game.stock_secondary === 0 ? '#F14555' : game.stock_secondary === 1 ? '#fbbf24' : '#4ade80' }}>
                              Sec: {STOCK_LABELS[Math.min(game.stock_secondary, 2)]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {editingGame === game.id ? (
                          <>
                            <button onClick={() => saveGame(game.id)} disabled={saving}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#4ade80', border: 'none', borderRadius: 7, color: '#0a0a0c', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {saving ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={12} />} Guardar
                            </button>
                            <button onClick={() => setEditingGame(null)}
                              style={{ padding: '6px 10px', background: 'var(--bg-3)', border: 'none', borderRadius: 7, color: 'var(--fg-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(game)}
                            style={{ padding: '6px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--fg-1)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Editar
                          </button>
                        )}
                        <button onClick={() => toggleActive(game)} title={game.active ? 'Ocultar' : 'Mostrar'}
                          style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 7, color: game.active ? 'var(--fg-2)' : '#E60412', cursor: 'pointer' }}>
                          {game.active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 5,
}
