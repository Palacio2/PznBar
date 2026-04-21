import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  profiles?: { phone: string | null }
}

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(phone)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        
      if (error) throw new Error(error.message)
      return data as Review[]
    }
  })
}

export const useAddReview = () => {
  const queryClient = useQueryClient()
  const { user } = useAppStore()

  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string, rating: number, comment: string }) => {
      if (!user) throw new Error('auth_required')
      
      const { error } = await supabase
        .from('reviews')
        .upsert({ 
          product_id: productId, 
          user_id: user.id, 
          rating, 
          comment 
        }, {
          onConflict: 'product_id,user_id'
        })
        
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] })
    }
  })
}