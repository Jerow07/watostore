import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Check, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GameCard from '@/components/product/GameCard'
import type { Game } from '@/components/product/GameCard'
import SwitchVideoBg from '@/components/background/SwitchVideoBg'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { useGamesStore } from '@/store/gamesStore'

const ALL_GENRES = ['Acción', 'Aventura', 'Bundle', 'Carreras', 'Cooperativo', 'Deportes', 'Estrategia', 'Indie', 'Multijugador', 'Plataformas', 'RPG', 'Roguelike', 'Simulación', 'Terror']

export default function Catalog() {
  const ALL_GAMES = useGamesStore((s) => s.games)
  const MAX_PRICE = ALL_GAMES.length ? Math.max(...ALL_GAMES.flatMap((g) => [g.price.primary, g.price.secondary])) : 30000
  const [params, setParams] = useSearchParams()
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({ cuenta: true, precio: true, genero: true, stock: true, consola: true })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const isMobile = useIsMobile()

  const qGenre = params.get('genero') ?? ''
  const qType = params.get('tipo') ?? ''
  const qTag = params.get('tag') ?? ''
  const qSearch = params.get('q') ?? ''
  const qSort = params.get('sort') ?? 'popular'

  const [selectedGenres, setSelectedGenres] = useState<string[]>(qGenre ? [qGenre] : [])
  const [selectedType, setSelectedType] = useState<string>(qType)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [switch2Only, setSwitch2Only] = useState(false)
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [sort, setSort] = useState(qSort)

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))

  const filtered = useMemo(() => {
    let list = ALL_GAMES
    if (qSearch) {
      const q = qSearch.toLowerCase()
      list = list.filter((g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)) ||
        g.features.some((f) => f.toLowerCase().includes(q)) ||
        g.genres.some((genre) => genre.toLowerCase().includes(q))
      )
    }
    if (qTag) list = list.filter((g) => g.tags.includes(qTag))
    if (switch2Only) list = list.filter((g) =>
      g.tags.includes('switch2') ||
      g.features.some((f) => f.toLowerCase().includes('switch 2') || f.toLowerCase().includes('nintendo switch 2'))
    )
    if (selectedGenres.length) {
      list = list.filter((g) => g.genres.some((genre) => selectedGenres.includes(genre)))
    }
    if (inStockOnly) {
      list = list.filter((g) => g.stock.primary > 0 || g.stock.secondary > 0)
    }
    const type = (selectedType as 'primary' | 'secondary') || 'primary'
    list = list.filter((g) => g.price[type] >= priceMin && g.price[type] <= priceMax)
    if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'price-asc') list = [...list].sort((a, b) => a.price.primary - b.price.primary)
    else list = [...list].sort((a, b) => b.rentalsCount - a.rentalsCount)
    return list
  }, [qSearch, qTag, selectedType, selectedGenres, inStockOnly, switch2Only, priceMin, priceMax, sort])

  const toggleFilter = (key: string) => setOpenFilters((f) => ({ ...f, [key]: !f[key] }))

  const updateSort = (s: string) => {
    setSort(s)
    const next = new URLSearchParams(params)
    next.set('sort', s)
    setParams(next)
  }

  const hasActiveFilters = selectedGenres.length > 0 || !!selectedType || inStockOnly || switch2Only || priceMin > 0 || priceMax < MAX_PRICE
  const clearFilters = () => { setSelectedGenres([]); setSelectedType(''); setInStockOnly(false); setSwitch2Only(false); setPriceMin(0); setPriceMax(MAX_PRICE) }

  const clearSearch = () => {
    const next = new URLSearchParams(params)
    next.delete('q')
    setParams(next)
  }

  const sidebar = (
    <aside style={{ position: isMobile ? 'static' : 'sticky', top: 80, alignSelf: 'start' }}>
      <FilterGroup title="Tipo de cuenta" open={openFilters.cuenta} onToggle={() => toggleFilter('cuenta')}>
        {['', 'primary', 'secondary'].map((t) => (
          <FilterOption key={t} checked={selectedType === t} onClick={() => setSelectedType(t)}
            label={t === '' ? 'Todos' : t === 'primary' ? 'Primaria' : 'Secundaria'}
            count={t === '' ? ALL_GAMES.length : ALL_GAMES.filter((g) => g.stock[t as 'primary'] > 0).length}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Género" open={openFilters.genero} onToggle={() => toggleFilter('genero')}>
        {ALL_GENRES.map((genre) => (
          <FilterOption key={genre} checked={selectedGenres.includes(genre)} onClick={() => toggleGenre(genre)}
            label={genre} count={ALL_GAMES.filter((g) => g.genres.includes(genre)).length}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Precio" open={openFilters.precio} onToggle={() => toggleFilter('precio')}>
        <PriceRangeSlider min={priceMin} max={priceMax} globalMax={MAX_PRICE} onMinChange={setPriceMin} onMaxChange={setPriceMax} />
      </FilterGroup>
      <FilterGroup title="Consola" open={openFilters.consola} onToggle={() => toggleFilter('consola')}>
        <FilterOption checked={!switch2Only} onClick={() => setSwitch2Only(false)} label="Todas" count={ALL_GAMES.length} />
        <FilterOption checked={switch2Only} onClick={() => setSwitch2Only(true)} label="Nintendo Switch 2" count={ALL_GAMES.filter((g) => g.tags.includes('switch2') || g.features.some((f) => f.toLowerCase().includes('switch 2'))).length} />
      </FilterGroup>
      <FilterGroup title="Disponibilidad" open={openFilters.stock} onToggle={() => toggleFilter('stock')}>
        <FilterOption checked={!inStockOnly} onClick={() => setInStockOnly(false)} label="Todos" count={ALL_GAMES.length} />
        <FilterOption checked={inStockOnly} onClick={() => setInStockOnly(true)} label="En stock" count={ALL_GAMES.filter((g) => g.stock.primary > 0 || g.stock.secondary > 0).length} />
      </FilterGroup>
      {hasActiveFilters && (
        <button onClick={clearFilters} style={{ width: '100%', padding: '10px', background: 'rgba(230,4,18,0.1)', border: '1px solid rgba(230,4,18,0.3)', borderRadius: 8, color: '#F14555', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>
          Limpiar filtros
        </button>
      )}
    </aside>
  )

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <SwitchVideoBg src="/assets/video/odyssey.mp4" loopDelay={3 * 60 * 1000} />
      <div style={{ position: 'relative', zIndex: 10, padding: `32px ${isMobile ? 16 : 48}px`, maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="section-eyebrow"><span className="section-num">/02</span> Catálogo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 26 : 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                {qSearch ? `"${qSearch}"` : 'Todos los juegos'}
              </h1>
              {qSearch && (
                <button
                  onClick={clearSearch}
                  title="Limpiar búsqueda"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: '#E60412', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.03em', flexShrink: 0 }}
                >
                  <X size={12} color="#fff" strokeWidth={2.5} />
                  Limpiar
                </button>
              )}
            </div>
          </div>
          {/* Mobile filter toggle */}
          {isMobile && (
            <button
              onClick={() => setFiltersOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: hasActiveFilters ? 'rgba(230,4,18,0.1)' : 'var(--bg-2)', border: `1px solid ${hasActiveFilters ? 'rgba(230,4,18,0.4)' : 'var(--border)'}`, borderRadius: 8, color: hasActiveFilters ? '#F14555' : 'var(--fg-1)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <SlidersHorizontal size={14} />
              Filtros {hasActiveFilters && `(${selectedGenres.length + (selectedType ? 1 : 0) + (inStockOnly ? 1 : 0) + (switch2Only ? 1 : 0)})`}
            </button>
          )}
        </div>

        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, color: 'var(--fg-3)' }}>
            <strong style={{ color: 'var(--fg-0)' }}>{filtered.length}</strong> juegos
            {selectedGenres.length > 0 && <span style={{ color: '#4CC3E3' }}> · {selectedGenres.join(', ')}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto' }}>
            {[
              { id: 'popular', label: 'Populares' },
              { id: 'az', label: 'A-Z' },
              { id: 'price-asc', label: 'Menor precio' },
            ].map((s) => (
              <button key={s.id} onClick={() => updateSort(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: sort === s.id ? '#E60412' : 'var(--bg-2)', border: `1px solid ${sort === s.id ? '#E60412' : 'var(--border)'}`, borderRadius: 100, fontSize: 12, color: sort === s.id ? '#fff' : '#e5e5ea', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {ALL_GENRES.filter(g => ALL_GAMES.some(game => game.genres.includes(g))).map(genre => {
            const active = selectedGenres.includes(genre)
            return (
              <button key={genre} onClick={() => toggleGenre(genre)}
                style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${active ? '#E60412' : 'var(--border)'}`, background: active ? '#E60412' : 'var(--bg-2)', color: active ? '#fff' : 'var(--fg-2)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {genre}
              </button>
            )
          })}
        </div>

        {/* Layout */}
        {isMobile ? (
          <>
            {/* Mobile filters drawer */}
            <AnimatePresence>
              {filtersOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setFiltersOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 150, backdropFilter: 'blur(4px)' }}
                  />
                  <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 300, background: 'var(--bg-1)', borderRight: '1px solid var(--border)', zIndex: 151, overflowY: 'auto', padding: '24px 20px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: 18 }}>Filtros</span>
                      <button className="btn-icon" onClick={() => setFiltersOpen(false)}><X size={18} /></button>
                    </div>
                    {sidebar}
                    <button className="btn-primary" onClick={() => setFiltersOpen(false)} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                      Ver {filtered.length} juegos
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Mobile grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filtered.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 24px', color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  No encontramos juegos con esos filtros.
                </div>
              ) : filtered.map((game, i) => (
                <motion.div key={game.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }} style={{ minWidth: 0 }}>
                  <GameCard game={game} accountType={(selectedType as 'primary' | 'secondary') || undefined} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
            {sidebar}
            <div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  No encontramos juegos con esos filtros.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                  {filtered.map((game, i) => (
                    <motion.div key={game.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}>
                      <GameCard game={game} accountType={(selectedType as 'primary' | 'secondary') || undefined} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', marginBottom: open ? 14 : 0, padding: 0 }}>
        {title}
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div style={{ display: 'grid', gap: 8 }}>{children}</div>}
    </div>
  )
}

function FilterOption({ checked, onClick, label, count }: { checked: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: checked ? '#fafafa' : '#e5e5ea', cursor: 'pointer', background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left', fontFamily: 'inherit' }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? '#E60412' : 'var(--border-strong)'}`, background: checked ? '#E60412' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
        {checked && <Check size={10} color="white" strokeWidth={2.5} />}
      </span>
      {label}
      <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--fg-3)' }}>{count}</span>
    </button>
  )
}

function PriceRangeSlider({ min, max, globalMax, onMinChange, onMaxChange }: {
  min: number; max: number; globalMax: number
  onMinChange: (v: number) => void; onMaxChange: (v: number) => void
}) {
  const minPct = (min / globalMax) * 100
  const maxPct = (max / globalMax) * 100

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Price labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--fg-1)' }}>
          ${min.toLocaleString('es-AR')}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--fg-1)' }}>
          ${max.toLocaleString('es-AR')}
        </span>
      </div>

      {/* Track + filled range */}
      <div style={{ position: 'relative', height: 4, marginBottom: 16 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-3)', borderRadius: 2 }} />
        <div style={{
          position: 'absolute', top: 0, bottom: 0, borderRadius: 2,
          left: `${minPct}%`, right: `${100 - maxPct}%`,
          background: '#E60412',
        }} />
        {/* Min thumb */}
        <input
          type="range" min={0} max={globalMax} step={50} value={min}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), max - 50)
            onMinChange(v)
          }}
          className="price-range-input"
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%', zIndex: min > globalMax - 100 ? 5 : 4 }}
        />
        {/* Max thumb */}
        <input
          type="range" min={0} max={globalMax} step={50} value={max}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), min + 50)
            onMaxChange(v)
          }}
          className="price-range-input"
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%', zIndex: 5 }}
        />
        {/* Visual thumbs */}
        <div style={{ position: 'absolute', top: '50%', left: `${minPct}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: '#E60412', border: '2px solid #fafafa', boxShadow: '0 0 6px rgba(230,4,18,0.5)', pointerEvents: 'none', transition: 'left 0.05s' }} />
        <div style={{ position: 'absolute', top: '50%', left: `${maxPct}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: '#E60412', border: '2px solid #fafafa', boxShadow: '0 0 6px rgba(230,4,18,0.5)', pointerEvents: 'none', transition: 'left 0.05s' }} />
      </div>
    </div>
  )
}
