import { useQuery } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { Ingredient } from '../types/menu'

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients-client'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_available', true) // Клієнти бачать тільки те, що є в наявності
        .order('type', { ascending: true })
      
      if (error) throw error
      return data as Ingredient[]
    }
  })
}