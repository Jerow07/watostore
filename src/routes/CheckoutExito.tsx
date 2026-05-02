import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useIsMobile } from '@/hooks/useBreakpoint'
import { supabase } from '@/lib/supabase'

export default function CheckoutExito() {
  const [params] = useSearchParams()
  const location = useLocation()
  const isMobile = useIsMobile()
  const order = params.get('order') ?? ''

  // Determinar estado por la ruta, no por el query param
  const pathStatus = location.pathname.includes('error')
    ? 'failure'
    : location.pathname.includes('pendiente')
    ? 'pending'
    : 'approved'
  const status = params.get('status') ?? pathStatus

  // Si MP aprobó el pago, actualizamos el pedido a 'paid' directamente
  useEffect(() => {
    if (status === 'approved' && order) {
      supabase.from('orders').update({ status: 'paid' }).eq('id', order)
    }
  }, [status, order])

  type ConfigKey = 'approved' | 'pending' | 'failure'
  const CONFIGS: Record<ConfigKey, { icon: React.ReactNode; color: string; bg: string; border: string; title: string; msg: string }> = {
    approved: {
      icon: <CheckCircle size={36} />,
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.12)',
      border: 'rgba(74,222,128,0.4)',
      title: '¡Pago aprobado!',
      msg: 'Tu pago fue procesado correctamente. Revisá tu mail — te mandamos las credenciales en menos de 15 minutos.',
    },
    pending: {
      icon: <Clock size={36} />,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.4)',
      title: 'Pago en proceso',
      msg: 'Tu pago está siendo procesado. Te avisamos por mail cuando se confirme.',
    },
    failure: {
      icon: <XCircle size={36} />,
      color: '#F14555',
      bg: 'rgba(230,4,18,0.12)',
      border: 'rgba(230,4,18,0.4)',
      title: 'Pago rechazado',
      msg: 'El pago no pudo completarse. Podés intentar de nuevo con otro método.',
    },
  }
  const config = CONFIGS[(status as ConfigKey) in CONFIGS ? (status as ConfigKey) : 'approved']

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: `0 ${isMobile ? 20 : 0}px` }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          style={{ width: 72, height: 72, borderRadius: '50%', background: config.bg, border: `2px solid ${config.border}`, display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: config.color }}
        >
          {config.icon}
        </motion.div>

        <h1 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: isMobile ? 26 : 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
          {config.title}
        </h1>
        <p style={{ color: 'var(--fg-3)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          {config.msg}
        </p>

        {order && (
          <div style={{ display: 'inline-block', padding: '8px 18px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--fg-0)', letterSpacing: '0.1em', marginBottom: 28 }}>
            Pedido #{order.slice(0, 8).toUpperCase()}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {status === 'failure' ? (
            <Link to="/checkout" className="btn-primary" style={{ textDecoration: 'none' }}>Intentar de nuevo</Link>
          ) : (
            <Link to="/perfil" className="btn-primary" style={{ textDecoration: 'none' }}>Ver mis pedidos</Link>
          )}
          <Link to="/catalogo" className="btn-ghost" style={{ textDecoration: 'none' }}>Seguir explorando</Link>
        </div>
      </motion.div>
    </div>
  )
}
