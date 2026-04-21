import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { supabase } from '../api/supabase'

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
  is_custom: boolean
  components?: string[]
}

export interface Order {
  id: string
  user_id: string | null
  table_id: string
  total_price: number
  tip_amount: number
  status: 'pending' | 'completed' | 'cancelled'
  items: OrderItem[]
  created_at: string
  points_earned: number
  points_used: number
  profiles?: {
    email: string | null
    phone: string | null
  } | null
}

export interface ServiceCall {
  id: string
  table_id: string
  type: 'waiter' | 'barman' | 'shisha'
  status: 'new' | 'completed'
  created_at: string
}

export function useStaffDashboard() {
  const queryClient = useQueryClient()

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) {
      console.error('Audio blocked', e)
    }
  }, [])

  const fetchOrdersWithProfiles = async (query: any) => {
    const { data: orders, error } = await query
    if (error) throw error

    const userIds = [...new Set(orders.map((o: any) => o.user_id).filter(Boolean))] as string[]
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, phone')
        .in('id', userIds)

      return orders.map((o: any) => ({
        ...o,
        profiles: profiles?.find(p => p.id === o.user_id) || null
      })) as Order[]
    }
    return orders as Order[]
  }

  const useActiveOrders = () => useQuery({
    queryKey: ['staff-orders'],
    queryFn: () => fetchOrdersWithProfiles(
      supabase.from('orders').select('*').eq('status', 'pending').order('created_at', { ascending: true })
    )
  })

const useOrderHistory = (dateStr: string) => useQuery({
    queryKey: ['staff-history', dateStr],
    queryFn: async () => {
      // Надійно парсимо локальну дату (без зсувів UTC)
      const [year, month, day] = dateStr.split('-').map(Number)
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

      return fetchOrdersWithProfiles(
        supabase.from('orders')
          .select('*')
          .neq('status', 'pending')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false })
      )
    }
  })

  const useActiveCalls = () => useQuery({
    queryKey: ['staff-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_calls')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as ServiceCall[]
    }
  })

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'completed' | 'cancelled' | 'pending' }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
      queryClient.invalidateQueries({ queryKey: ['staff-history'] })
    }
  })

  const resolveCall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_calls').update({ status: 'completed' }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
  })

  useEffect(() => {
    const channel = supabase.channel('staff_dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
        playNotificationSound()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_calls' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
        playNotificationSound()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
        queryClient.invalidateQueries({ queryKey: ['staff-history'] })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_calls' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient, playNotificationSound])

  return {
    useActiveOrders,
    useOrderHistory,
    useActiveCalls,
    updateOrderStatus,
    resolveCall
  }
}