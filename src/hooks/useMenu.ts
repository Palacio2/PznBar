import { useQuery } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { Category, Product } from '../types/menu'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }
      
      return data as Category[]
    },
  })
}

export const useProducts = (categoryId?: string | null) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      let query = supabase.from('products').select('*').eq('is_available', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      return data as Product[]
    },
  })
}