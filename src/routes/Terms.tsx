export default function Terms() {
  const sections = [
    { id: 'intro', title: 'Introducción', content: 'Estos Términos y Condiciones regulan el uso del servicio de alquiler digital de videojuegos ofrecido por WATO STORE. Al utilizar nuestros servicios, el usuario acepta cumplir con las condiciones establecidas en este documento. WATO STORE se reserva el derecho de modificar estos términos con previo aviso de 7 días hábiles.' },
    { id: 'service', title: 'Descripción del servicio', content: 'WATO STORE ofrece acceso temporal a cuentas de videojuegos digitales para consola híbrida. El servicio se presta mediante el alquiler de credenciales de acceso por períodos de 30 días corridos. No transferimos la propiedad de ningún contenido digital.' },
    { id: 'accounts', title: 'Tipos de cuentas', content: 'La cuenta Primaria permite el acceso completo al juego, incluyendo modalidad online y offline, durante el período contratado. La cuenta Secundaria permite únicamente el acceso offline y puede estar sujeta a limitaciones de sesión simultánea. Ambas modalidades son 100% legítimas y verificadas.' },
    { id: 'payment', title: 'Pagos y tarifas', content: 'Todos los precios se expresan en pesos argentinos (ARS) e incluyen impuestos aplicables. El pago es exigible en su totalidad al momento de la contratación. Los métodos aceptados incluyen Mercado Pago, transferencia bancaria y tarjetas de crédito/débito.' },
    { id: 'delivery', title: 'Entrega del servicio', content: 'Una vez confirmado el pago, el usuario recibirá las credenciales de acceso en el correo electrónico registrado en un plazo máximo de 15 minutos. En caso de demoras por causas externas, el soporte de WATO STORE brindará asistencia inmediata.' },
    { id: 'refunds', title: 'Política de devoluciones', content: 'Dado que el acceso al contenido digital se otorga de forma inmediata, no se realizan reembolsos una vez entregadas las credenciales, salvo en casos de fallo técnico comprobable imputable a WATO STORE. En tales casos se ofrecerá extensión del servicio o reembolso a criterio del usuario.' },
    { id: 'responsibility', title: 'Responsabilidades del usuario', content: 'El usuario se compromete a no compartir las credenciales recibidas con terceros, no intentar transferir la cuenta a otros dispositivos no autorizados, y utilizar el servicio de forma personal. El incumplimiento puede resultar en la suspensión inmediata del servicio sin reembolso.' },
    { id: 'contact', title: 'Contacto', content: 'Para consultas sobre estos términos, podés comunicarte a hola@watostore.ar o por WhatsApp en el horario de atención. Buenos Aires, Argentina.' },
  ]

  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1 }}>
      <div style={{ padding: '56px 48px 80px', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 56 }}>
        {/* TOC */}
        <nav style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 14 }}>
            Contenidos
          </p>
          <div style={{ display: 'grid', gap: 6 }}>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#4CC3E3')}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#989898')}
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <article>
          <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Términos y<br />Condiciones
          </h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 48 }}>
            Última actualización: Abril 2026
          </p>

          {sections.map((s) => (
            <section key={s.id} id={s.id} style={{ marginBottom: 48, scrollMarginTop: 80 }}>
              <h2
                style={{
                  fontFamily: '"Space Grotesk",sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {s.title}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--fg-1)', lineHeight: 1.75 }}>{s.content}</p>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
