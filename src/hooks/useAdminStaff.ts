import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import { UserProfile, UserRole } from '../types/menu'

export function useAdminStaff() {
  const queryClient = useQueryClient()

  const useStaffList = () => useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'user')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as UserProfile[]
    }
  })

  const searchUser = useMutation({
    mutationFn: async ({ email, phone }: { email: string; phone: string }) => {
      if (!email && !phone) return null
      
      let query = supabase.from('profiles').select('*')
      
      if (email && phone) {
        query = query.or(`email.eq."${email}",phone.eq."${phone}"`)
      } else if (email) {
        query = query.eq('email', email)
      } else {
        query = query.eq('phone', phone)
      }

      const { data, error } = await query.single()
      
      if (error && error.code !== 'PGRST116') throw error
      return (data as UserProfile) || null
    }
  })

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
    }
  })

  return {
    useStaffList,
    searchUser,
    updateRole
  }
}