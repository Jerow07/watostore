import { create } from 'zustand'
import gamesJson from '@/data/games.json'
import { supabase } from '@/lib/supabase'
import type { Game } from '@/components/product/GameCard'

function mapRow(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    genres: row.genres as string[],
    rating: row.rating as number,
    reviewsCount: row.reviews_count as number,
    rentalsCount: row.rentals_count as number,
    price: { primary: row.price_primary as number, secondary: row.price_secondary as number },
    stock: { primary: row.stock_primary as number, secondary: row.stock_secondary as number },
    description: row.description as string,
    features: row.features as string[],
    tags: row.tags as string[],
    cover: row.cover as string,
  }
}

interface GamesStore {
  games: Game[]
  loaded: boolean
  loadGames: () => Promise<void>
}

export const useGamesStore = create<GamesStore>((set) => ({
  games: gamesJson as Game[],
  loaded: false,
  loadGames: async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('active', true)
      .order('id')
    if (error || !data || data.length === 0) return
    set({ games: data.map(mapRow), loaded: true })
  },
}))
