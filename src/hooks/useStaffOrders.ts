import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { Order, OrderStatus } from '../types/menu'

export const useStaffOrders = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('staff-orders-all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['staff-orders'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as Order[]
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      staffId 
    }: { 
      orderId: string
      status: OrderStatus
      staffId?: string 
    }) => {
      const updateData: Partial<Order> = { 
        status, 
        updated_at: new Date().toISOString() 
      }
      
      if (staffId !== undefined) {
        updateData.assigned_staff_id = staffId
      }

      if (status === 'completed') {
        updateData.is_paid = true
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
    }
  })
}