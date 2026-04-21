import { useQuery } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { Ingredient } from '../types/menu'

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_available', true)

      if (error) {
        throw new Error(error.message)
      }

      return data as Ingredient[]
    },
  })
}