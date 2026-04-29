import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true)
    })

    // If Supabase already processed the hash before this component mounted
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => navigate('/perfil'), 2500)
  }

  return (
    <div style={{
      paddingTop: 64, minHeight: '100vh', display: 'grid',
      placeItems: 'center', padding: '80px 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--bg-1)', border: '1px solid var(--border-strong)',
        borderRadius: 16, padding: '40px 36px',
      }}>
        {done ? (
          <div style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
            <CheckCircle size={40} style={{ color: '#4ade80', margin: '0 auto' }} />
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 22, fontWeight: 700 }}>
              ¡Contraseña actualizada!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>Redirigiendo a tu perfil...</p>
          </div>
        ) : !validSession ? (
          <div style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
            <Loader2 size={32} style={{ color: 'var(--fg-3)', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 14, color: 'var(--fg-3)' }}>Verificando enlace...</p>
            <p style={{ fontSize: 12, color: 'var(--fg-3)' }}>
              Si esto tarda, volvé a pedir el enlace desde el modal de login.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
              Nueva contraseña
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24 }}>
              Ingresá tu nueva contraseña para continuar.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nueva contraseña *</label>
                <div style={{ position: 'relative' }}>
                  <input className="wato-input" type={showPass ? 'text' : 'password'} required
                    placeholder="Mínimo 6 caracteres" style={{ paddingRight: 40 }}
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirmar contraseña *</label>
                <input className="wato-input" type="password" required placeholder="Repetí la contraseña"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              {error && <p style={{ color: '#E60412', fontSize: 13 }}>{error}</p>}
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--fg-2)',
  fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  display: 'block', marginBottom: 6,
}
