import { useState } from 'react'
import { Search, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import faqsData from '@/data/faqs.json'

interface FAQ { id: number; question: string; answer: string }
const FAQS = faqsData as FAQ[]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(1)
  const [query, setQuery] = useState('')

  const filtered = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1 }}>
      {/* Background image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url(/assets/fondo-faq.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(6px) saturate(0.8)',
          opacity: 0.22,
          transform: 'scale(1.05)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 10 }}>
      {/* Hero */}
      <div
        style={{
          padding: '80px 48px 60px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 500,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(230,4,18,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <p className="section-eyebrow" style={{ display: 'inline-block', marginBottom: 12 }}>
          CENTRO DE AYUDA · v2.0
        </p>
        <h1
          style={{
            fontFamily: '"Space Grotesk",sans-serif',
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          Preguntas{' '}
          <span style={{ color: '#E60412', fontStyle: 'italic' }}>frecuentes</span>
        </h1>
        <p style={{ color: 'var(--fg-3)', fontSize: 16, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.5 }}>
          Todo lo que necesitás saber sobre alquileres, cuentas primarias y secundarias.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fg-3)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="wato-input"
            style={{ paddingLeft: 40 }}
            placeholder="Buscar pregunta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FAQ list */}
      <div style={{ padding: '48px', maxWidth: 880, margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 40 }}>
            No encontramos preguntas que coincidan.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map((faq) => (
              <div
                key={faq.id}
                style={{
                  background: 'var(--bg-1)',
                  border: `1px solid ${open === faq.id ? '#E60412' : 'var(--border)'}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 22px',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: '#4CC3E3',
                        letterSpacing: '0.08em',
                        marginRight: 16,
                        flexShrink: 0,
                      }}
                    >
                      [ {String(faq.id).padStart(2, '0')} ]
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{faq.question}</span>
                  </div>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: `1px solid ${open === faq.id ? '#E60412' : 'var(--border-strong)'}`,
                      background: open === faq.id ? '#E60412' : 'transparent',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                  >
                    {open === faq.id ? <Minus size={12} /> : <Plus size={12} />}
                  </span>
                </div>

                <AnimatePresence>
                  {open === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          color: 'var(--fg-3)',
                          lineHeight: 1.7,
                          padding: '0 22px 18px',
                          borderTop: '1px solid var(--border)',
                          paddingTop: 14,
                          margin: 0,
                        }}
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 56,
            padding: '32px',
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 16 }}>
            ¿No encontraste lo que buscabas? Nuestro equipo responde en minutos.
          </p>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', fontSize: 14 }}
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
      </div>
    </div>
  )
}
