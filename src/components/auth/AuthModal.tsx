import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

type View = 'login' | 'register' | 'forgot'

export default function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal } = useAuthStore()

  const [view, setView] = useState<View>(authModalTab)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', name: '' })
  const [forgotEmail, setForgotEmail] = useState('')

  useEffect(() => { setView(authModalTab) }, [authModalTab])

  if (!authModalOpen) return null

  const reset = () => { setError(''); setSuccess('') }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email, password: loginForm.password,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    closeAuthModal()
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: { data: { full_name: registerForm.name } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('¡Cuenta creada! Revisá tu email para confirmar.')
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('¡Listo! Revisá tu email y hacé click en el enlace para restablecer tu contraseña.')
  }

  const isForgot = view === 'forgot'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center', padding: '0 16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: isForgot ? 440 : 820,
            background: 'var(--bg-1)', border: '1px solid var(--border-strong)',
            borderRadius: 16, overflow: 'hidden',
            display: 'grid', gridTemplateColumns: isForgot ? '1fr' : '1fr 1fr',
            position: 'relative', transition: 'max-width 0.25s',
          }}
        >
          <button onClick={closeAuthModal} style={{
            position: 'absolute', top: 16, right: 16, width: 32, height: 32,
            borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center', color: 'var(--fg-2)', cursor: 'pointer', zIndex: 1,
          }}>
            <X size={16} />
          </button>

          {/* ── FORGOT PASSWORD ── */}
          {isForgot && (
            <div style={{ padding: '40px 36px' }}>
              <button onClick={() => { setView('login'); reset() }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 24 }}>
                <ArrowLeft size={14} /> Volver
              </button>
              <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
                Olvidé mi contraseña
              </h2>
              <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24, lineHeight: 1.6 }}>
                Ingresá tu email y te mandamos un enlace para restablecer tu contraseña.
              </p>
              {success ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0', textAlign: 'center' }}>
                  <CheckCircle size={40} style={{ color: '#4ade80' }} />
                  <p style={{ fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.6 }}>{success}</p>
                  <button onClick={closeAuthModal} className="btn-primary" style={{ fontSize: 14 }}>Entendido</button>
                </div>
              ) : (
                <form onSubmit={handleForgot} style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Correo electrónico *</label>
                    <input className="wato-input" type="email" required placeholder="tu@mail.com"
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                  {error && <p style={{ color: '#E60412', fontSize: 13 }}>{error}</p>}
                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Enviar enlace'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── LOGIN ── */}
          {!isForgot && (
            <div style={{ padding: '40px 36px', borderRight: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
                Iniciar sesión
              </h2>
              <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Correo electrónico *</label>
                  <input className="wato-input" type="email" required placeholder="tu@mail.com"
                    value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña *</label>
                  <div style={{ position: 'relative' }}>
                    <input className="wato-input" type={showPass ? 'text' : 'password'} required
                      placeholder="••••••••" style={{ paddingRight: 40 }}
                      value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && view === 'login' && <p style={{ color: '#E60412', fontSize: 13 }}>{error}</p>}
                <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Iniciar sesión'}
                </button>
                <button type="button" onClick={() => { setView('forgot'); reset() }}
                  style={{ fontSize: 13, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  ¿Olvidaste la contraseña?
                </button>
              </form>
            </div>
          )}

          {/* ── REGISTER ── */}
          {!isForgot && (
            <div style={{ padding: '40px 36px' }}>
              <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
                Registrarme
              </h2>
              <form onSubmit={handleRegister} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input className="wato-input" type="text" required placeholder="Tu nombre"
                    value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Correo electrónico *</label>
                  <input className="wato-input" type="email" required placeholder="tu@mail.com"
                    value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña *</label>
                  <input className="wato-input" type="password" required placeholder="Mínimo 6 caracteres"
                    value={registerForm.password} onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6 }}>
                  Tus datos se usarán para procesar tu pedido según nuestros{' '}
                  <a href="/terminos" style={{ color: 'var(--wato-cyan)' }}>términos y condiciones</a>.
                </p>
                {error && view === 'register' && <p style={{ color: '#E60412', fontSize: 13 }}>{error}</p>}
                {success && view === 'register' && <p style={{ color: '#4ade80', fontSize: 13 }}>{success}</p>}
                <button className="btn-primary" type="submit" disabled={loading || !!success} style={{ marginTop: 4 }}>
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Registrarme'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--fg-2)',
  fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  display: 'block', marginBottom: 6,
}
