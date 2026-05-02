const PRIMARY_RULES = [
  'Está terminantemente prohibido cambiar la configuración a "No" en "Ajustes de las licencias en línea".',
  'Si desea jugar un juego sin conexión a internet deberá cargar el cartucho digital. Realice esto con los juegos deseados. Caso contrario le pedirá de conexión a internet.',
  'Debe hacer uso del servicio desde sus perfiles. Es la única forma de conservar su partida, ya que este usuario será eliminado.',
  'Si desea jugar de manera online, deberá abonar Nintendo Online en su perfil. Si usa varios perfiles considere el pase familiar.',
  'La función de compartir cartucho digital se encuentra desactivada. Sólo usted podrá usar en una consola la cuenta rentada.',
  'En caso de renovar suscripción, avise 3 días antes de la fecha de finalización. El día número 30 se realizará la re-sincronización desde la tienda E-shop reenviando los 8 dígitos (QR) como también el respectivo pago del servicio. De no realizarse se procede a desvincularlo de la plataforma.',
  'Siempre actualice la consola y los juegos. Verifique que la hora, fecha y región geográfica son correctos.',
  'Debe obligatoriamente eliminar el perfil en el día número 30 en caso de no renovar. Esto permitirá a un nuevo usuario rentar como cuenta primaria. Si no puede ese día, deberá hacerlo previamente.',
  'El servicio se ofrece sólo en Argentina. Si por algún motivo abandonó el país, evite usarlo.',
]

const SECONDARY_RULES = [
  'Está terminantemente prohibido cambiar la configuración a "No" en "Ajustes de las licencias en línea".',
  'No tiene permiso a cargar el cartucho digital por más que pueda hacerlo. Este es un beneficio de la cuenta primaria. Si lo hace deberá eliminar el perfil y volverlo a sincronizar. Lamentablemente perderá todas las partidas de esta cuenta y tendrá que volver a iniciar los juegos. Si usted inserta el cartucho y no quiere eliminarlo deberá abonar la diferencia en su costo.',
  'Inicie el videojuego con el perfil Wato Store. En el caso de haber alquilado varias cuentas, verifique cuál es la indicada.',
  'Inmediatamente luego de iniciar, ponga modo avión. Si se encuentra con la consola en la base TV, retirarla para poder activar el modo y luego vuelva a colocarla (de lo contrario, no conseguirá hacerlo desde la base).',
  'Si juega en la base, remueva el cable ethernet (internet) de la misma. Si este permanece conectado no servirá el modo avión.',
  'Al finalizar una jornada nunca deje el juego abierto en modo avión. Esto impedirá el acceso a los demás. Cierre el juego y conéctese a Internet. Nintendo almacena todo en un historial sabiendo exactamente cuando se reactiva.',
  'Siempre actualice la consola y los juegos. Verifique que la hora, fecha y región geográfica son correctos.',
  'Si algún amigo o familiar desea usar la cuenta Wato Store debe enseñarle obligatoriamente este procedimiento. No permita su uso si no ve esto posible. La irresponsabilidad afecta directamente a los demás.',
  'En caso de renovar suscripción, avise 3 días antes de la fecha de finalización. El día número 30 se realizará la re-sincronización desde la tienda E-shop reenviando los 8 dígitos (QR) como también el respectivo pago del servicio. De no realizarse se procede a desvincularlo de la plataforma.',
  'La partida se guarda en el perfil rentado. Podrá usarla luego de finalizar la suscripción pero deberá tener de manera personal el videojuego. Si elimina el perfil perderá sus partidas. Haga esto sólo si sabe que no las utilizará nuevamente. La liberación del perfil es beneficioso para Wato Store.',
  'El servicio se ofrece sólo en Argentina. Si por algún motivo abandonó el país, evite usarlo.',
]

const ruleStyle: React.CSSProperties = {
  fontSize: 15,
  color: 'var(--fg-1)',
  lineHeight: 1.75,
  paddingLeft: 16,
  borderLeft: '2px solid var(--border)',
  marginBottom: 16,
}

const warningStyle: React.CSSProperties = {
  marginTop: 28,
  padding: '14px 18px',
  borderRadius: 10,
  background: 'rgba(230,4,18,0.07)',
  border: '1px solid rgba(230,4,18,0.25)',
  fontSize: 14,
  color: '#F14555',
  lineHeight: 1.6,
}

const closingStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 14,
  color: 'var(--fg-3)',
  lineHeight: 1.6,
  fontStyle: 'italic',
}

export default function Terms() {
  return (
    <div style={{ paddingTop: 64, position: 'relative', zIndex: 1 }}>
      <div style={{ padding: '56px 48px 80px', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 56 }}>

        {/* TOC */}
        <nav style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 14 }}>
            Contenidos
          </p>
          <div style={{ display: 'grid', gap: 6 }}>
            {['Cuenta Primaria', 'Cuenta Secundaria'].map((label, i) => (
              <a
                key={i}
                href={i === 0 ? '#primaria' : '#secundaria'}
                style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#4CC3E3')}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#989898')}
              >
                {label}
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

          {/* Cuenta Primaria */}
          <section id="primaria" style={{ marginBottom: 56, scrollMarginTop: 80 }}>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              Cuenta Primaria
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24, lineHeight: 1.6 }}>
              Si es menor de edad un adulto deberá tomar la responsabilidad y el compromiso para el cumplimiento de las siguientes pautas:
            </p>
            {PRIMARY_RULES.map((rule, i) => (
              <div key={i} style={ruleStyle}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#E60412', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                {rule}
              </div>
            ))}
            <div style={warningStyle}>Si no cumple las reglas será expulsado del servicio sin ningún reembolso económico.</div>
            <p style={closingStyle}>Pregunte siempre sus dudas para estar bien informado.<br />Muchas gracias. Será un placer que forme parte de la comunidad Wato Store.</p>
          </section>

          {/* Cuenta Secundaria */}
          <section id="secundaria" style={{ marginBottom: 56, scrollMarginTop: 80 }}>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              Cuenta Secundaria
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24, lineHeight: 1.6 }}>
              Si es menor de edad un adulto deberá tomar la responsabilidad y el compromiso para el cumplimiento de las siguientes pautas:
            </p>
            {SECONDARY_RULES.map((rule, i) => (
              <div key={i} style={ruleStyle}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4CC3E3', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                {rule}
              </div>
            ))}
            <div style={warningStyle}>Si no cumple las reglas será expulsado del servicio sin ningún reembolso económico.</div>
            <p style={closingStyle}>Pregunte siempre sus dudas para estar bien informado.<br />Muchas gracias. Será un placer que forme parte de la comunidad Wato Store.</p>
          </section>
        </article>

      </div>
    </div>
  )
}
