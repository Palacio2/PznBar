import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'

export interface RestaurantTable {
  id: string
  number: string
  pin_code: string
  created_at: string
}

export function useAdminTables() {
  const queryClient = useQueryClient()

  const useTablesList = () => useQuery({
    queryKey: ['admin-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('number', { ascending: true })
      if (error) throw error
      return data as RestaurantTable[]
    }
  })

  const createTable = useMutation({
    mutationFn: async ({ number, pin_code }: { number: string; pin_code: string }) => {
      const { error } = await supabase
        .from('tables')
        .insert([{ number, pin_code }])
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Стіл з таким номером вже існує')
        }
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tables'] }),
  })

  const updateTable = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { number?: string; pin_code?: string } }) => {
      const { error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', id)
      
      if (error) {
        if (error.code === '23505') throw new Error('Стіл з таким номером вже існує')
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tables'] }),
  })

  const deleteTable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tables').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tables'] }),
  })

  return {
    useTablesList,
    createTable,
    updateTable,
    deleteTable
  }
}