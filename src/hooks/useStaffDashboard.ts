import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { supabase } from '../api/supabase'
import { ORDER_STATUSES, CALL_STATUSES } from '../lib/constants'

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
  status: typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]
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
  status: typeof CALL_STATUSES[keyof typeof CALL_STATUSES]
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
      // ВИКОРИСТОВУЄМО КОНСТАНТУ
      supabase.from('orders').select('*').eq('status', ORDER_STATUSES.PENDING).order('created_at', { ascending: true })
    )
  })

  const useOrderHistory = (dateStr: string) => useQuery({
    queryKey: ['staff-history', dateStr],
    queryFn: async () => {
      const [year, month, day] = dateStr.split('-').map(Number)
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

      return fetchOrdersWithProfiles(
        supabase.from('orders')
          .select('*')
          .neq('status', ORDER_STATUSES.PENDING) // ВИКОРИСТОВУЄМО КОНСТАНТУ
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
        .eq('status', CALL_STATUSES.NEW) // ВИКОРИСТОВУЄМО КОНСТАНТУ
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as ServiceCall[]
    }
  })

  const useStaffTables = () => useQuery({
    queryKey: ['staff-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('number', { ascending: true })
      if (error) throw error
      return data
    }
  })

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
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
      const { error } = await supabase.from('service_calls').update({ status: CALL_STATUSES.COMPLETED }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
  })

  const clearTableSession = useMutation({
    mutationFn: async (tableNumber: string) => {
      const newSessionId = crypto.randomUUID()
      const { error } = await supabase
        .from('tables')
        .update({ session_id: newSessionId })
        .eq('number', tableNumber)
      
      if (error) throw error

      await supabase
        .from('service_calls')
        .update({ status: CALL_STATUSES.COMPLETED })
        .eq('table_id', tableNumber)
        .eq('status', CALL_STATUSES.NEW)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
    }
  })

  useEffect(() => {
    // МАГІЯ: Унікальний канал для захисту від крашу в React Strict Mode
    const channelId = `staff_dashboard_${Date.now()}`
    
    const channel = supabase.channel(channelId)
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
    resolveCall,
    clearTableSession,
    useStaffTables
  }
}

export function useStaffBadges(isStaff: boolean) {
  const queryClient = useQueryClient()

  const ordersQuery = useQuery({
    queryKey: ['staff-badge-orders'],
    queryFn: async () => {
      const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', ORDER_STATUSES.PENDING)
      if (error) throw error
      return count || 0
    },
    enabled: !!isStaff
  })

  const callsQuery = useQuery({
    queryKey: ['staff-badge-calls'],
    queryFn: async () => {
      const { count, error } = await supabase.from('service_calls').select('*', { count: 'exact', head: true }).eq('status', CALL_STATUSES.NEW)
      if (error) throw error
      return count || 0
    },
    enabled: !!isStaff
  })

  useEffect(() => {
    if (!isStaff) return
    // МАГІЯ: Унікальний канал
    const channelId = `global_staff_badges_${Date.now()}`
    
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-badge-orders'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_calls' }, () => {
        queryClient.invalidateQueries({ queryKey: ['staff-badge-calls'] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isStaff, queryClient])

  return {
    totalBadges: (ordersQuery.data || 0) + (callsQuery.data || 0)
  }
}