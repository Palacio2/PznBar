import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { UtensilsCrossed, Heart, User, Settings, ShieldAlert, ClipboardList, MapPin } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../api/supabase'
import { useStaffBadges } from '../hooks/useStaffDashboard' // Імпортували хук

export function BottomNav() {
  const { t } = useTranslation()
  const { user, tableId, setTableId, clearCart, showAlert } = useAppStore()

  const isStaff = user?.role === 'staff' || user?.role === 'admin' || user?.role === 'super_admin'
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  // Витягуємо лічильник для бейджика (спрацює тільки якщо це персонал)
  const { totalBadges } = useStaffBadges(!!isStaff)

  useEffect(() => {
    if (!tableId) return

    const channel = supabase.channel(`table-${tableId}-session`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tables' 
      }, (payload) => {
        if (payload.new.number === tableId || payload.new.number === Number(tableId)) {
          showAlert(
            t('attention', 'Увага'), 
            t('session_ended', 'Ваш стіл було звільнено персоналом. Дякуємо за візит!')
          )
          setTableId(null)
          clearCart()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tableId, setTableId, clearCart, showAlert, t])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 px-2 pb-safe pt-2 backdrop-blur-md overflow-visible hide-scrollbar">
      
      {/* ПЛАШКА СТОЛИКА */}
      {tableId && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-primary-foreground/20 animate-in slide-in-from-bottom-2 duration-300 whitespace-nowrap z-50">
          <MapPin className="h-3.5 w-3.5" />
          {t('table', 'Стіл')} {tableId}
        </div>
      )}

      <div className="mx-auto flex max-w-lg items-center justify-between pb-2 min-w-full gap-4 px-2 relative z-40">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <UtensilsCrossed className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('menu', 'Меню')}</span>
        </NavLink>
        
        <NavLink to="/favorites" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Heart className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('favorites', 'Улюблене')}</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('profile', 'Профіль')}</span>
        </NavLink>

        {isStaff && (
          <NavLink to="/staff" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors shrink-0 ${isActive ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'}`}>
            <div className="relative">
              <ClipboardList className="h-6 w-6" />
              {totalBadges > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white shadow-sm animate-pulse">
                  {totalBadges}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">{t('nav_staff', 'Робота')}</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors shrink-0 ${isActive ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}>
            <ShieldAlert className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{t('nav_admin', 'Адмін')}</span>
          </NavLink>
        )}

        <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t('settings', 'Налаштування')}</span>
        </NavLink>
      </div>
    </nav>
  )
}