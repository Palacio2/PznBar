import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'

// 1. ХУК ДЛЯ ОТРИМАННЯ ДАНИХ (Використовується в історії замовлень)
export const useOrders = (userId?: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50) // Ліміт, щоб не вантажити телефон старою історією

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    enabled: !!userId,
  })
}

// 2. ХУК ДЛЯ СПОВІЩЕНЬ (Використовується глобально тільки один раз)
export const useGlobalOrderListener = (userId?: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAppStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (!userId) return

    const uniqueChannelName = `user-orders-${userId}-${Date.now()}`

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Оновлюємо список замовлень у фоні
          queryClient.invalidateQueries({ queryKey: ['orders', userId] })

          // Сповіщаємо клієнта про зміну статусу
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status
            const oldStatus = payload.old?.status 

            if (newStatus === 'completed' && oldStatus !== 'completed') {
              showAlert(
                t('attention', 'Увага'), 
                t('order_ready', 'Ваше замовлення виконано! Персонал вже прямує до вас.')
              )
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
              }
            } else if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
              showAlert(
                t('attention', 'Увага'), 
                t('order_cancelled_msg', 'Ваше замовлення було скасовано.')
              )
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient, showAlert, t])
}