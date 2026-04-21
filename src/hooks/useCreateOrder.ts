import { useMutation } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { CartItem } from '../store/useAppStore'

interface CreateOrderPayload {
  tableId: string
  items: CartItem[]
  userId?: string
  tipAmount: number
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async ({ tableId, items, userId, tipAmount }: CreateOrderPayload) => {
      const { data, error } = await supabase.functions.invoke('process-order', {
        body: { 
          tableId, 
          items, 
          userId,
          tipAmount
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
  })
}