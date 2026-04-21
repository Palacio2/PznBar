import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { UserRole } from '../../types/menu'
import { supabase } from '../../api/supabase'

interface AdminGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function AdminGuard({ children, allowedRoles }: AdminGuardProps) {
  const { t } = useTranslation()
  const { user } = useAppStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isMounted = true
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (isMounted && !session) {
        setIsChecking(false)
      }
    }
    checkSession()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (user) setIsChecking(false)
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background pointer-events-none">
        <span className="text-muted-foreground animate-pulse font-medium tracking-widest uppercase text-sm">
          {t('loading', 'Завантаження...')}
        </span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/profile" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}