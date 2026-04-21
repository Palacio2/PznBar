import { useEffect } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../hooks/useAuth'

import { HomePage } from '../pages/HomePage'
import { CategoryPage } from '../pages/CategoryPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { AboutPage } from '../pages/AboutPage'
import { LegalPage } from '../pages/LegalPage'

import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { StaffDashboardPage } from '../features/staff/StaffDashboardPage'
import { AdminGuard } from '../features/admin/AdminGuard'

import { BottomNav } from '../layouts/BottomNav'
import { CartDrawer } from '../features/cart/CartDrawer'
import { CallStaffDrawer } from '../features/service/CallStaffDrawer'
import { ConstructorDrawer } from '../features/constructor/ConstructorDrawer'
import { AgeVerificationModal } from '../features/auth/AgeVerificationModal'
import { GlobalAlert } from '../components/ui/GlobalAlert'
import { AdminCategoriesPage } from '../features/admin/AdminCategoriesPage'
import { AdminProductsPage } from '../features/admin/AdminProductsPage'
import { AdminStaffPage } from '../features/admin/AdminStaffPage'
import { AdminTablesPage } from '../features/admin/AdminTablesPage'

function AppLayout({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams()
  const { setTableId, setReferralCodeToApply, theme, language } = useAppStore()
  const { i18n } = useTranslation()
  
  useAuth()

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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route 
          path="/staff/*" 
          element={
            <AdminGuard allowedRoles={['staff', 'admin', 'super_admin']}>
              <StaffDashboardPage />
            </AdminGuard>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <AdminGuard allowedRoles={['admin', 'super_admin']}>
              <AdminDashboardPage />
            </AdminGuard>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <AdminGuard allowedRoles={['admin', 'super_admin']}>
              <AdminCategoriesPage />
            </AdminGuard>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <AdminGuard allowedRoles={['admin', 'super_admin']}>
              <AdminProductsPage />
            </AdminGuard>
          } 
        />
        <Route 
          path="/admin/tables" 
          element={
            <AdminGuard allowedRoles={['admin', 'super_admin']}>
              <AdminTablesPage />
            </AdminGuard>
          } 
        />
        <Route 
          path="/admin/staff" 
          element={
            <AdminGuard allowedRoles={['admin', 'super_admin']}>
              <AdminStaffPage />
            </AdminGuard>
          } 
        />
      </Routes>
    </AppLayout>
  )
}