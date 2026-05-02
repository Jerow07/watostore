import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Mail, Clock, CheckCircle } from 'lucide-react'
import SwitchModel from '@/components/contact/SwitchModel'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { STORE_CONFIG } from '@/config/store'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const mouse = useRef({ x: 0, y: 0 })
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetForm = () => {
    setSent(false)
    setForm({ name: '', email: '', subject: '', message: '' })
    if (resetTimer.current) clearTimeout(resetTimer.current)
  }

  useEffect(() => {
    if (sent) {
      resetTimer.current = setTimeout(resetForm, 8000)
    }
    return () => { if (resetTimer.current) clearTimeout(resetTimer.current) }
  }, [sent])
  const isMobile = useIsMobile(1025)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const px = isMobile ? 16 : 48

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ padding: `${isMobile ? 40 : 72}px ${px}px ${isMobile ? 28 : 60}px`, textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <p className="section-eyebrow" style={{ display: 'inline-block', marginBottom: 12 }}>CONTACTO</p>
        <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 36 : 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
          Hablemos
        </h1>
        <p style={{ color: 'var(--fg-3)', fontSize: 16, maxWidth: 440, margin: '12px auto 0', lineHeight: 1.5 }}>
          Respondemos en minutos. Sin robots, solo humanos.
        </p>
      </div>

      <div style={{
        padding: `${isMobile ? 32 : 56}px ${px}px ${isMobile ? 48 : 80}px`,
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 360px 280px',
        gap: isMobile ? 24 : 32,
        alignItems: 'start',
      }}>

        {/* Form */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16, padding: isMobile ? 20 : 32, order: isMobile ? 1 : undefined }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle size={48} style={{ color: '#4ade80', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>¡Mensaje enviado!</h3>
              <p style={{ color: 'var(--fg-3)', fontSize: 14, marginBottom: 20 }}>Te respondemos en menos de 30 minutos.</p>
              <button onClick={resetForm} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 20px', color: 'var(--fg-2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Envianos un mensaje</h2>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input className="wato-input" placeholder="Tu nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input className="wato-input" type="email" placeholder="tu@mail.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Asunto</label>
                  <input className="wato-input" placeholder="¿En qué podemos ayudarte?" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Mensaje</label>
                  <textarea className="wato-input" placeholder="Contanos tu consulta..." rows={5} style={{ resize: 'vertical' }} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>
                <a
                  className="btn-primary"
                  style={{ width: isMobile ? '100%' : 'fit-content', justifyContent: 'center', fontSize: 14, textDecoration: 'none', pointerEvents: (!form.name || !form.email || !form.message) ? 'none' : 'auto', opacity: (!form.name || !form.email || !form.message) ? 0.5 : 1 }}
                  href={`https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent(`Hola! Soy ${form.name} (${form.email}).\n\nAsunto: ${form.subject || 'Consulta'}\n\n${form.message}`)}`}
                  target="_blank" rel="noreferrer"
                  onClick={() => { if (form.name && form.email && form.message) setSent(true) }}
                >
                  Enviar por WhatsApp
                </a>
              </div>
            </>
          )}
        </div>

        {/* 3D Switch */}
        <div style={{ height: 420, position: 'relative', zIndex: 3, order: isMobile ? 3 : undefined }}>
          <SwitchModel mouse={mouse} />
        </div>

        {/* Contact cards */}
        <div style={{ display: 'grid', gap: 12, alignContent: 'start', order: isMobile ? 2 : undefined }}>
          {[
            { icon: <MessageSquare size={20} />, title: 'WhatsApp', sub: 'Respuesta inmediata', detail: `+${STORE_CONFIG.whatsapp}`, href: `https://wa.me/${STORE_CONFIG.whatsapp}`, color: '#4CC3E3' },
            { icon: <Mail size={20} />, title: 'Email', sub: 'Respondemos en < 1h', detail: STORE_CONFIG.email, href: `mailto:${STORE_CONFIG.email}`, color: '#4CC3E3' },
            { icon: <Clock size={20} />, title: 'Horario', sub: 'Soporte 24/7', detail: 'Siempre disponibles', href: null, color: '#4CC3E3' },
          ].map((card) => (
            <div key={card.title} style={{ padding: '18px 20px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', color: card.color, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{card.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 4 }}>{card.sub}</div>
                {card.href ? (
                  <a href={card.href} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: card.color, textDecoration: 'none' }}>{card.detail}</a>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--fg-1)' }}>{card.detail}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--fg-3)', fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6,
}
