import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import { useGamesStore } from '@/store/gamesStore'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import AuthModal from '@/components/auth/AuthModal'
import { useThemeStore } from '@/store/themeStore'
import '@/store/authStore' // inicializa la sesión al cargar

import Home from '@/routes/Home'
import Catalog from '@/routes/Catalog'
import Product from '@/routes/Product'
import Checkout from '@/routes/Checkout'
import Profile from '@/routes/Profile'
import FAQ from '@/routes/FAQ'
import Terms from '@/routes/Terms'
import Contact from '@/routes/Contact'
import ResetPassword from '@/routes/ResetPassword'
import CheckoutExito from '@/routes/CheckoutExito'
import Admin from '@/routes/Admin'

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  const { dark } = useThemeStore()
  const loadGames = useGamesStore((s) => s.loadGames)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => { loadGames() }, [loadGames])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      {/* Scan lines overlay */}
      <div className="scan-overlay" />

      {/* App shell */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/catalogo" element={<PageTransition><Catalog /></PageTransition>} />
              <Route path="/producto/:slug" element={<PageTransition><Product /></PageTransition>} />
              <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
              <Route path="/perfil" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/favoritos" element={<Navigate to="/perfil?tab=wishlist" replace />} />
              <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
              <Route path="/terminos" element={<PageTransition><Terms /></PageTransition>} />
              <Route path="/contacto" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
              <Route path="/checkout/exito" element={<PageTransition><CheckoutExito /></PageTransition>} />
              <Route path="/checkout/error" element={<PageTransition><CheckoutExito /></PageTransition>} />
              <Route path="/checkout/pendiente" element={<PageTransition><CheckoutExito /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
              <Route
                path="*"
                element={
                  <PageTransition>
                    <div
                      style={{
                        paddingTop: 64,
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Space Grotesk",sans-serif',
                          fontSize: 80,
                          fontWeight: 700,
                          color: 'rgba(230,4,18,0.15)',
                          letterSpacing: '-0.04em',
                        }}
                      >
                        404
                      </p>
                      <p
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 13,
                          color: '#6b6b73',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        Esta página fue capturada por un Goomba.
                      </p>
                      <a
                        href="/"
                        className="btn-primary"
                        style={{ textDecoration: 'none', marginTop: 8, fontSize: 14 }}
                      >
                        Volvé al inicio
                      </a>
                    </div>
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* Cart drawer (global) */}
      <CartDrawer />

      {/* Auth modal (global) */}
      <AuthModal />
    </>
  )
}
