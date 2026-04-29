import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccountType = 'primary' | 'secondary'

export interface CartItem {
  gameId: string
  title: string
  slug: string
  accountType: AccountType
  price: number
  qty: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (gameId: string, accountType: AccountType) => void
  updateQty: (gameId: string, accountType: AccountType, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        const exists = get().items.find(
          (i) => i.gameId === item.gameId && i.accountType === item.accountType
        )
        if (exists) {
          set((s) => ({
            items: s.items.map((i) =>
              i.gameId === item.gameId && i.accountType === item.accountType
                ? { ...i, qty: i.qty + 1 }
                : i
            ),
          }))
        } else {
          set((s) => ({ items: [...s.items, { ...item, qty: 1 }] }))
        }
      },
      removeItem: (gameId, accountType) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.gameId === gameId && i.accountType === accountType)
          ),
        })),
      updateQty: (gameId, accountType, qty) => {
        if (qty <= 0) {
          get().removeItem(gameId, accountType)
          return
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.gameId === gameId && i.accountType === accountType ? { ...i, qty } : i
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.qty, 0),
      totalPrice: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
    }),
    { name: 'wato-cart' }
  )
)
