import { useQuery } from '@tanstack/react-query'
import { supabase } from '../api/supabase'

export const useProductStats = (productId: string) => {
  return useQuery({
    queryKey: ['productStats', productId],
    queryFn: async () => {
      const [reviewsRes, favsRes] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('product_id', productId),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('product_id', productId)
      ])
      
      return {
        reviewsCount: reviewsRes.count || 0,
        likesCount: favsRes.count || 0
      }
    }
  })
}