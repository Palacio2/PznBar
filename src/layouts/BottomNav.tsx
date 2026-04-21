import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { UtensilsCrossed, Heart, User, Settings, ShieldAlert, ClipboardList } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function BottomNav() {
  const { t } = useTranslation()
  const { user } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 px-4 pb-safe pt-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between pb-2">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <UtensilsCrossed className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('menu')}</span>
        </NavLink>
        
        <NavLink to="/favorites" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Heart className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('favorites')}</span>
        </NavLink>

        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <ShieldAlert className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Admin</span>
          </NavLink>
        )}
        
        {(user?.role === 'staff' || user?.role === 'admin' || user?.role === 'super_admin') && (
          <NavLink to="/staff" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <ClipboardList className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Staff</span>
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('profile')}</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('settings')}</span>
        </NavLink>
      </div>
    </nav>
  )
}