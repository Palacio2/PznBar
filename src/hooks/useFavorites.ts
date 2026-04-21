import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { Product } from '../types/menu'

export const useFavorites = () => {
  const { user } = useAppStore()

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase.from('favorites').select('product_id').eq('user_id', user.id)
      if (error) throw new Error(error.message)
      return data.map(f => f.product_id)
    },
    enabled: !!user,
  })
}

export const useToggleFavorite = () => {
  const queryClient = useQueryClient()
  const { user } = useAppStore()

  return useMutation({
    mutationFn: async ({ productId, isFavorite }: { productId: string, isFavorite: boolean }) => {
      if (!user) throw new Error('auth_required')
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId)
      } else {
        await supabase.from('favorites').insert([{ user_id: user.id, product_id: productId }])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favoriteProducts', user?.id] })
    }
  })
}

export const useFavoriteProducts = () => {
  const { user } = useAppStore()
  
  return useQuery({
    queryKey: ['favoriteProducts', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data: favs } = await supabase.from('favorites').select('product_id').eq('user_id', user.id)
      if (!favs || favs.length === 0) return []
      
      const productIds = favs.map(f => f.product_id)
      const { data: products, error } = await supabase.from('products').select('*').in('id', productIds).eq('is_available', true)
      
      if (error) throw new Error(error.message)
      return products as Product[]
    },
    enabled: !!user,
  })
}