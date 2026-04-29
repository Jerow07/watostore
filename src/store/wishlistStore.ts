import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface WishlistStore {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
  syncFromDB: (userId: string) => Promise<void>
  clearLocal: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: async (id: string) => {
        const prev = get().ids
        const removing = prev.includes(id)
        set({ ids: removing ? prev.filter((x) => x !== id) : [...prev, id] })

        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        if (removing) {
          await supabase.from('wishlist').delete()
            .eq('user_id', session.user.id).eq('game_id', id)
        } else {
          await supabase.from('wishlist').upsert({ user_id: session.user.id, game_id: id })
        }
      },

      has: (id: string) => get().ids.includes(id),

      syncFromDB: async (userId: string) => {
        const { data } = await supabase
          .from('wishlist').select('game_id').eq('user_id', userId)
        if (data) set({ ids: data.map((r: { game_id: string }) => r.game_id) })
      },

      clearLocal: () => set({ ids: [] }),
    }),
    { name: 'wato-wishlist' }
  )
)
