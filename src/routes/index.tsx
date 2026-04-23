import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { useGlobalOrderListener } from '../hooks/useOrders' // ОНОВЛЕНИЙ ІМПОРТ

// ==========================================
// ОСНОВНІ КОМПОНЕНТИ (Завантажуються миттєво)
// ==========================================
import { HomePage } from '../pages/HomePage'
import { AdminGuard } from '../features/admin/AdminGuard'
import { BottomNav } from '../layouts/BottomNav'
import { CartDrawer } from '../features/cart/CartDrawer'
import { CallStaffDrawer } from '../features/service/CallStaffDrawer'
import { ConstructorDrawer } from '../features/constructor/ConstructorDrawer'
import { AgeVerificationModal } from '../features/auth/AgeVerificationModal'
import { GlobalAlert } from '../components/ui/GlobalAlert'

// ==========================================
// ЛІНИВЕ ЗАВАНТАЖЕННЯ (Завантажуються тільки при переході)
// ==========================================
const CategoryPage = lazy(() => import('../pages/CategoryPage').then(m => ({ default: m.CategoryPage })))
const FavoritesPage = lazy(() => import('../pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const AboutPage = lazy(() => import('../pages/AboutPage').then(m => ({ default: m.AboutPage })))
const LegalPage = lazy(() => import('../pages/LegalPage').then(m => ({ default: m.LegalPage })))

const StaffDashboardPage = lazy(() => import('../features/staff/StaffDashboardPage').then(m => ({ default: m.StaffDashboardPage })))
const AdminDashboardPage = lazy(() => import('../features/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminCategoriesPage = lazy(() => import('../features/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })))
const AdminProductsPage = lazy(() => import('../features/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })))
const AdminTablesPage = lazy(() => import('../features/admin/AdminTablesPage').then(m => ({ default: m.AdminTablesPage })))
const AdminIngredientsPage = lazy(() => import('../features/admin/AdminIngredientsPage').then(m => ({ default: m.AdminIngredientsPage })))
const AdminStaffPage = lazy(() => import('../features/admin/AdminStaffPage').then(m => ({ default: m.AdminStaffPage })))

// Анімація завантаження, поки "підтягується" шматок коду
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

function AppLayout({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams()
  const { setTableId, setReferralCodeToApply, theme, language, user } = useAppStore()
  const { i18n } = useTranslation()
  
  useAuth()
  
  // ВИКОЛИК ГЛОБАЛЬНОГО СЛУХАЧА ЗАМОВЛЕНЬ
  useGlobalOrderListener(user?.id)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  useEffect(() => {
    const table = searchParams.get('table')
    const ref = searchParams.get('ref')
    if (table) setTableId(table)
    if (ref) setReferralCodeToApply(ref)
  }, [searchParams, setTableId, setReferralCodeToApply])

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      {children}
      <ConstructorDrawer />
      <CallStaffDrawer />
      <CartDrawer />
      <AgeVerificationModal />
      <GlobalAlert />
      <BottomNav />
    </div>
  )
}

export function AppRoutes() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/staff/*" element={<AdminGuard allowedRoles={['staff', 'admin', 'super_admin']}><StaffDashboardPage /></AdminGuard>} />
          
          <Route path="/admin" element={<AdminGuard allowedRoles={['admin', 'super_admin']}><AdminDashboardPage /></AdminGuard>} />
          <Route path="/admin/categories" element={<AdminGuard allowedRoles={['admin', 'super_admin']}><AdminCategoriesPage /></AdminGuard>} />
          <Route path="/admin/products" element={<AdminGuard allowedRoles={['admin', 'super_admin']}><AdminProductsPage /></AdminGuard>} />
          <Route path="/admin/tables" element={<AdminGuard allowedRoles={['admin', 'super_admin']}><AdminTablesPage /></AdminGuard>} />
          <Route path="/admin/ingredients" element={<AdminGuard allowedRoles={['admin', 'super_admin']}><AdminIngredientsPage /></AdminGuard>} />
          <Route path="/admin/staff" element={<AdminGuard allowedRoles={['admin', 'super_admin']}><AdminStaffPage /></AdminGuard>} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}