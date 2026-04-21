import { useEffect } from 'react'
import { Routes, Route, useSearchParams, Outlet } from 'react-router-dom'
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

import { AdminDashboard } from '../pages/AdminDashboard'
import { AdminRoute } from './AdminRoute'

import { StaffDashboard } from '../pages/StaffDashboard'
import { StaffRoute } from './StaffRoute'

import { BottomNav } from '../layouts/BottomNav'
import { CartDrawer } from '../features/cart/CartDrawer'
import { CallStaffDrawer } from '../features/service/CallStaffDrawer'
import { ConstructorDrawer } from '../features/constructor/ConstructorDrawer'
import { AgeVerificationModal } from '../features/auth/AgeVerificationModal'
import { GlobalAlert } from '../components/ui/GlobalAlert'

function ClientLayout() {
  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Outlet />
      <ConstructorDrawer />
      <CallStaffDrawer />
      <CartDrawer />
      <AgeVerificationModal />
    </div>
  )
}

export function AppRoutes() {
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
    <>
      <GlobalAlert />
      
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/*" element={<AdminDashboard />} /> 
        </Route>

        <Route element={<StaffRoute />}>
          <Route path="/staff" element={<StaffDashboard />} />
        </Route>
      </Routes>

      <BottomNav />
    </>
  )
}