import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Zap, Shield, Clock, Gamepad2, Sword, Car, Leaf, Trophy, Puzzle } from 'lucide-react'
import GameCard from '@/components/product/GameCard'
import type { Game } from '@/components/product/GameCard'
import SwitchVideoBg from '@/components/background/SwitchVideoBg'
import { useIsMobile } from '@/hooks/useBreakpoint'
import gamesData from '@/data/games.json'

const games = gamesData as Game[]
const topWeek = games.filter((g) => g.tags.includes('top-week')).slice(0, 8)
const topMonth = games.filter((g) => g.tags.includes('top-month')).slice(0, 8)
const newGames = games.filter((g) => g.tags.includes('new')).slice(0, 8)

const TABS = [
  { id: 'week', label: 'Esta semana', data: topWeek },
  { id: 'month', label: 'Top mes', data: topMonth },
  { id: 'new', label: 'Nuevos', data: newGames },
]

const CATEGORIES = [
  { label: 'Aventura', icon: <Gamepad2 size={20} />, count: 142 },
  { label: 'RPG', icon: <Sword size={20} />, count: 98 },
  { label: 'Carreras', icon: <Car size={20} />, count: 42 },
  { label: 'Indie', icon: <Leaf size={20} />, count: 87 },
  { label: 'Deportes', icon: <Trophy size={20} />, count: 38 },
  { label: 'Puzzle', icon: <Puzzle size={20} />, count: 34 },
]

const STEPS = [
  { num: '01', title: 'Elegí tu juego', desc: 'Explorá el catálogo, filtrá por género, precio o disponibilidad y encontrá el juego perfecto.' },
  { num: '02', title: 'Elegí tu cuenta', desc: 'Primaria (online + offline completo) o Secundaria (solo offline, más económica). Vos decidís.' },
  { num: '03', title: 'Jugá al instante', desc: 'Recibís las credenciales por mail en menos de 15 minutos. Sin esperas. Sin complicaciones.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('week')
  const isMobile = useIsMobile()
  const currentGames = TABS.find((t) => t.id === activeTab)?.data ?? topWeek

  const px = isMobile ? 20 : 48

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1 }}>
      <SwitchVideoBg src="/assets/video/switch.mp4" />

      {/* ===== HERO ===== */}
      <section
        style={{
          position: 'relative',
          padding: `${isMobile ? 60 : 100}px ${px}px ${isMobile ? 48 : 80}px`,
          minHeight: isMobile ? 520 : 680,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}
      >
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(230,4,18,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '20%', width: 400, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(76,195,227,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid var(--border-strong)', borderRadius: 100, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-1)', background: 'rgba(0,0,0,0.03)', backdropFilter: 'blur(8px)', marginBottom: 28 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CC3E3', boxShadow: '0 0 8px #4CC3E3', animation: 'pulseDot 1.6s ease-in-out infinite' }} />
          Alquiler digital · Entrega en minutos
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isMobile ? 'clamp(40px, 11vw, 56px)' : 'clamp(52px, 7vw, 88px)', lineHeight: 0.95, letterSpacing: '-0.04em', fontWeight: 700, marginBottom: 24, maxWidth: 820 }}
        >
          Jugá los{' '}
          <span style={{ color: '#E60412', textShadow: '0 0 40px rgba(230,4,18,0.5)', fontStyle: 'italic' }}>tops</span>
          {' '}sin<br />
          gastar una{' '}
          <span style={{ color: '#4CC3E3', textShadow: '0 0 40px rgba(76,195,227,0.4)' }}>fortuna</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: isMobile ? 15 : 18, color: 'var(--fg-3)', lineHeight: 1.55, maxWidth: 500, marginBottom: 40 }}
        >
          Más de 800 títulos para tu consola híbrida. Cuentas primarias y secundarias verificadas, soporte 24/7 y precios que rompen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center', width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 320 : 'none' }}
        >
          <Link to="/catalogo" className="btn-primary" style={{ textDecoration: 'none', gap: 10, justifyContent: 'center' }}>
            Explorar catálogo <ArrowRight size={16} />
          </Link>
          <Link to="/faq" className="btn-ghost" style={{ textDecoration: 'none', gap: 10, justifyContent: 'center' }}>
            <Play size={14} fill="currentColor" /> Cómo funciona
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? 24 : 64,
            marginTop: isMobile ? 48 : 72,
            paddingTop: 40,
            borderTop: '1px solid var(--border)',
            width: '100%',
            maxWidth: 760,
          }}
        >
          {[
            { num: '800', unit: '+', label: 'Títulos disponibles' },
            { num: '12k', unit: '+', label: 'Pedidos completados' },
            { num: '24', unit: '/7', label: 'Soporte humano' },
            { num: '4.9', unit: '/5', label: 'Reseñas verificadas' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isMobile ? 28 : 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {s.num}<span style={{ color: '#E60412', fontSize: isMobile ? 22 : 28 }}>{s.unit}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ===== LO MÁS ALQUILADO ===== */}
      <section style={{ padding: `64px ${px}px 48px`, borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'flex-end', justifyContent: 'space-between', gap: isMobile ? 16 : 0, marginBottom: 32 }}>
          <div>
            <p className="section-eyebrow"><span className="section-num">/01</span> Lo más alquilado</p>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 24 : 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Favoritos de la semana
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ padding: isMobile ? '8px 10px' : '8px 16px', fontSize: isMobile ? 12 : 13, fontWeight: 500, borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTab === tab.id ? '#E60412' : 'transparent', color: activeTab === tab.id ? 'white' : '#989898', transition: 'background 0.15s, color 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20 }}>
          {currentGames.map((game, i) => (
            <motion.div key={game.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} style={{ minWidth: 0 }}>
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/catalogo" className="btn-ghost" style={{ textDecoration: 'none' }}>
            Ver catálogo completo <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ===== CATEGORÍAS ===== */}
      <section style={{ padding: `64px ${px}px`, borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <p className="section-eyebrow" style={{ textAlign: 'center' }}><span className="section-num">/02</span> Por categoría</p>
        <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 24 : 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center' }}>
          Encontrá tu género
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: 12 }}>
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              whileHover={{ y: -4, borderColor: '#4CC3E3', boxShadow: '0 0 0 1px #4CC3E3' }}
              style={{ padding: isMobile ? '16px 10px' : '24px 16px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
              onClick={() => window.location.href = `/catalogo?genero=${cat.label.toLowerCase()}`}
            >
              <div style={{ color: '#4CC3E3', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{cat.icon}</div>
              <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 600, fontSize: isMobile ? 12 : 14, marginBottom: 4 }}>{cat.label}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cat.count}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section style={{ padding: `64px ${px}px`, borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <p className="section-eyebrow" style={{ textAlign: 'center' }}><span className="section-num">/03</span> Proceso simple</p>
        <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 24 : 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 48, textAlign: 'center' }}>
          En 3 pasos estás jugando
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              style={{ padding: 28, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16, position: 'relative' }}
            >
              <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 56, fontWeight: 700, color: 'rgba(230,4,18,0.12)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16, fontStyle: 'italic' }}>
                {step.num}
              </div>
              <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.6 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== GARANTÍAS ===== */}
      <section style={{ padding: px, borderTop: '1px solid var(--border)', background: 'rgba(17,17,20,0.7)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: <Zap size={20} />, title: 'Entrega instantánea', desc: 'Acceso por mail en menos de 15 minutos' },
            { icon: <Shield size={20} />, title: 'Cuentas verificadas', desc: '100% legítimas, sin riesgo de baneo' },
            { icon: <Clock size={20} />, title: 'Soporte 24/7', desc: 'WhatsApp y mail siempre disponibles' },
          ].map((feat) => (
            <div key={feat.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 20, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', color: '#4CC3E3', flexShrink: 0 }}>
                {feat.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{feat.title}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
