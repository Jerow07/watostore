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
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
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
