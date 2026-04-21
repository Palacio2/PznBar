import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Loader2 } from 'lucide-react'

export function AdminRoute() {
  const { user, isAuthLoading } = useAppStore()

  // Поки ми чекаємо відповіді від бази даних
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Якщо завантаження закінчилось, і користувач не адмін (або не залогінений)
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
  return <Navigate to="/" replace />
}

  // Якщо все ок — пускаємо в адмінку!
  return <Outlet />
}