import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { Order, OrderStatus } from '../types/menu'

export interface ServiceCall {
  id: string
  table_id: string
  type: string
  status: string
  created_at: string
}

export const useStaffData = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ordersChannel = supabase
      .channel('staff-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
      })
      .subscribe()

    const serviceChannel = supabase
      .channel('staff-service')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_calls' }, () => {
        queryClient.invalidateQueries({ queryKey: ['service-calls'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(serviceChannel)
    }
  }, [queryClient])

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tables').select('*').order('number')
      if (error) throw new Error(error.message)
      return data
    }
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['staff-orders'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data as Order[]
    }
  })

  const { data: serviceCalls = [], isLoading: callsLoading } = useQuery({
    queryKey: ['service-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_calls')
        .select('*')
        .eq('status', 'new')
      if (error) throw new Error(error.message)
      return data as ServiceCall[]
    }
  })

  return {
    tables,
    orders,
    serviceCalls,
    isLoading: tablesLoading || ordersLoading || callsLoading
  }
}

export const useResolveServiceCall = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (callId: string) => {
      const { error } = await supabase
        .from('service_calls')
        .update({ status: 'completed' })
        .eq('id', callId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-calls'] })
    }
  })
}

export const useClearTable = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tableId: string) => {
      const { error: ordersError } = await supabase
        .from('orders')
        .update({ status: 'completed', is_paid: true })
        .in('status', ['new', 'preparing', 'served'])
        .eq('table_id', tableId)

      if (ordersError) throw new Error(ordersError.message)

      const { error: callsError } = await supabase
        .from('service_calls')
        .update({ status: 'completed' })
        .eq('status', 'new')
        .eq('table_id', tableId)

      if (callsError) throw new Error(callsError.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
      queryClient.invalidateQueries({ queryKey: ['service-calls'] })
    }
  })
}