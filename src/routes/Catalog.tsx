import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Check, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GameCard from '@/components/product/GameCard'
import type { Game } from '@/components/product/GameCard'
import SwitchVideoBg from '@/components/background/SwitchVideoBg'
import { useIsMobile } from '@/hooks/useBreakpoint'
import gamesData from '@/data/games.json'

const ALL_GAMES = gamesData as Game[]
const ALL_GENRES = ['Aventura', 'RPG', 'Acción', 'Carreras', 'Indie', 'Deportes', 'Fighting', 'Plataformas', 'Puzzle', 'Terror', 'Estrategia', 'Simulación', 'Música', 'Sigilo']

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({ cuenta: true, precio: true, genero: true, stock: true })
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
  const [priceMin] = useState(0)
  const [priceMax] = useState(5000)
  const [sort, setSort] = useState(qSort)

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))

  const filtered = useMemo(() => {
    let list = ALL_GAMES
    if (qSearch) list = list.filter((g) => g.title.toLowerCase().includes(qSearch.toLowerCase()))
    if (qTag) list = list.filter((g) => g.tags.includes(qTag))
    if (selectedType) {
      list = list.filter((g) =>
        selectedType === 'primary' ? g.stock.primary > 0 : g.stock.secondary > 0
      )
    }
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
  }, [qSearch, qTag, selectedType, selectedGenres, inStockOnly, priceMin, priceMax, sort])

  const toggleFilter = (key: string) => setOpenFilters((f) => ({ ...f, [key]: !f[key] }))

  const updateSort = (s: string) => {
    setSort(s)
    const next = new URLSearchParams(params)
    next.set('sort', s)
    setParams(next)
  }

  const hasActiveFilters = selectedGenres.length > 0 || !!selectedType || inStockOnly
  const clearFilters = () => { setSelectedGenres([]); setSelectedType(''); setInStockOnly(false) }

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
      <div style={{ padding: `32px ${isMobile ? 16 : 48}px`, maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="section-eyebrow"><span className="section-num">/02</span> Catálogo</p>
            <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 26 : 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              {qSearch ? `"${qSearch}"` : 'Todos los juegos'}
            </h1>
          </div>
          {/* Mobile filter toggle */}
          {isMobile && (
            <button
              onClick={() => setFiltersOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: hasActiveFilters ? 'rgba(230,4,18,0.1)' : 'var(--bg-2)', border: `1px solid ${hasActiveFilters ? 'rgba(230,4,18,0.4)' : 'var(--border)'}`, borderRadius: 8, color: hasActiveFilters ? '#F14555' : 'var(--fg-1)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <SlidersHorizontal size={14} />
              Filtros {hasActiveFilters && `(${selectedGenres.length + (selectedType ? 1 : 0) + (inStockOnly ? 1 : 0)})`}
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
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: sort === s.id ? 'rgba(230,4,18,0.1)' : 'var(--bg-2)', border: `1px solid ${sort === s.id ? 'rgba(230,4,18,0.4)' : 'var(--border)'}`, borderRadius: 100, fontSize: 12, color: sort === s.id ? '#F14555' : '#e5e5ea', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                {s.label}
              </button>
            ))}
          </div>
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
                  <GameCard game={game} accountType={(selectedType as 'primary' | 'secondary') || 'primary'} />
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
                      <GameCard game={game} accountType={(selectedType as 'primary' | 'secondary') || 'primary'} />
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
