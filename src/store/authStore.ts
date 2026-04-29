import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  authModalOpen: boolean
  authModalTab: 'login' | 'register'
  openAuthModal: (tab?: 'login' | 'register') => void
  closeAuthModal: () => void
  setSession: (session: Session | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  authModalOpen: false,
  authModalTab: 'login',

  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  setSession: (session) => {
    set({ session, user: session?.user ?? null, loading: false })
    // Sync wishlist when user logs in
    if (session?.user) {
      import('@/store/wishlistStore').then(({ useWishlistStore }) => {
        useWishlistStore.getState().syncFromDB(session.user.id)
      })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    import('@/store/wishlistStore').then(({ useWishlistStore }) => {
      useWishlistStore.getState().clearLocal()
    })
    set({ user: null, session: null })
  },
}))

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session)
})
