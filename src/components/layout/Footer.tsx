import { Link } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useBreakpoint'
import watoLogo from '@/assets/brand/wato-logo.png'

export default function Footer() {
  const isMobile = useIsMobile()

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: `48px ${isMobile ? 20 : 48}px 32px`,
        background: 'var(--bg-1)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr',
          gap: isMobile ? 32 : 48,
          marginBottom: 40,
          maxWidth: 1200,
          margin: `0 auto ${isMobile ? 32 : 40}px`,
        }}
      >
        {/* Brand — full width on mobile */}
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src={watoLogo} alt="WATO STORE" style={{ height: 40, width: 40, borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>
              WATO<span style={{ color: '#E60412' }}>.</span>STORE
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 240 }}>
            Alquiler digital de videojuegos para consola híbrida. Entrega instantánea, soporte humano.
          </p>
          <p style={{ marginTop: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Alquilá · Jugá · Repetí
          </p>
        </div>

        <FooterCol title="Tienda" links={[
          { to: '/catalogo', label: 'Catálogo completo' },
          { to: '/catalogo?tag=top-week', label: 'Novedades' },
          { to: '/catalogo?tag=top-month', label: 'Más populares' },
        ]} />

        <FooterCol title="Ayuda" links={[
          { to: '/faq', label: 'Preguntas frecuentes' },
          { to: '/terminos', label: 'Términos y condiciones' },
          { to: '/contacto', label: 'Contacto' },
        ]} />

        <div>
          <h5 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 14 }}>
            Contacto
          </h5>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { href: 'https://wa.me/5491151158409', label: 'WhatsApp' },
              { href: 'https://instagram.com/watostore', label: 'Instagram' },
              { href: 'mailto:hola@watostore.ar', label: 'hola@watostore.ar' },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                style={{ fontSize: 13, color: 'var(--fg-1)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#4CC3E3')}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#e5e5ea')}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Social icons */}
      <div style={{ maxWidth: 1200, margin: '0 auto 24px', paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        {SOCIAL_LINKS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
            style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--fg-2)', textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = '#fafafa'; el.style.borderColor = 'rgba(255,255,255,0.2)'; el.style.background = 'var(--bg-3)' }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = 'var(--fg-2)'; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--bg-2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">{s.path}</svg>
          </a>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 6 : 0,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: 'var(--fg-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <span>© 2026 WATO.STORE — Todos los derechos reservados</span>
        <span>v2.0 · Buenos Aires, AR</span>
      </div>
    </footer>
  )
}

const SOCIAL_LINKS = [
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@watostore',
    path: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.69a4.85 4.85 0 0 1-1.02 0z" />,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/watostore',
    path: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@watostore',
    path: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.965C5.12 20 12 20 12 20s6.88 0 8.59-.455a2.78 2.78 0 0 0 1.95-1.965A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--bg-1)"/></>,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/watostore',
    path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/watostore',
    path: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>,
  },
  {
    label: 'Twitch',
    href: 'https://twitch.tv/watostore',
    path: <><path d="M21 2H3v16h5v4l4-4h5l4-4V2zM11 11V7m5 4V7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  },
  {
    label: 'Kick',
    href: 'https://kick.com/watostore',
    path: <><rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 7v10M9 12l6-5M9 12l6 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  },
]

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h5 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 14 }}>
        {title}
      </h5>
      <div style={{ display: 'grid', gap: 8 }}>
        {links.map((l) => (
          <Link key={l.to} to={l.to}
            style={{ fontSize: 13, color: 'var(--fg-1)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#4CC3E3')}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#e5e5ea')}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
