import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { LocalizedString } from '../types/menu'

export interface Ingredient {
  id: string
  name: LocalizedString
  type: string
  price_extra: number
  is_free_selection: boolean
  is_available: boolean
  category_constraint: string | null
}

export function useAdminIngredients() {
  const queryClient = useQueryClient()

  const useIngredientsList = () => useQuery({
    queryKey: ['admin-ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('type', { ascending: true })
      if (error) throw error
      return data as Ingredient[]
    }
  })

  const createIngredient = useMutation({
    mutationFn: async (newIngredient: Partial<Ingredient>) => {
      const { error } = await supabase.from('ingredients').insert([newIngredient])
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-ingredients'] }),
  })

  const updateIngredient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ingredient> }) => {
      const { error } = await supabase.from('ingredients').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-ingredients'] }),
  })

  const deleteIngredient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ingredients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-ingredients'] }),
  })

  return {
    useIngredientsList,
    createIngredient,
    updateIngredient,
    deleteIngredient
  }
}