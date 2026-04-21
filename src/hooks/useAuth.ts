import { useEffect } from 'react'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { UserProfile } from '../types/menu'

export function useAuth() {
  const setUser = useAppStore((state) => state.setUser)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message)
        return
      }

      if (data) {
        setUser(data as UserProfile)
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
    }
  }
}