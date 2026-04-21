import { useMutation } from '@tanstack/react-query'
import { supabase } from '../api/supabase'

interface CallStaffPayload {
  tableId: string
  type: 'waiter' | 'barman' | 'shisha'
}

export const useServiceCall = () => {
  return useMutation({
    mutationFn: async ({ tableId, type }: CallStaffPayload) => {
      const { data, error } = await supabase.functions.invoke('call-staff', {
        body: { tableId, type }
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
  })
}