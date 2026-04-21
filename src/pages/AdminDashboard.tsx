import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Package, LayoutGrid, Users, ChevronLeft, Coffee, QrCode } from 'lucide-react'
import { supabase } from '../api/supabase'
import { Button } from '../components/ui/button'

import { AdminStaff } from '../features/admin/AdminStaff'
import { AdminCategories } from '../features/admin/AdminCategories'
import { AdminProducts } from '../features/admin/AdminProducts'
import { AdminIngredients } from '../features/admin/AdminIngredients'
import { AdminTables } from '../features/admin/AdminTables'

export function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'products' | 'staff' | 'ingredients' | 'tables'>('menu')

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="bg-background border-b border-border p-4 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {activeTab !== 'menu' && (
            <Button variant="ghost" size="icon" onClick={() => setActiveTab('menu')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-primary">Bar Admin</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { supabase.auth.signOut(); navigate('/') }}>
          <LogOut className="h-5 w-5 text-destructive" />
        </Button>
      </header>

      <main className="p-4 space-y-4">
        {activeTab === 'menu' && (
          <>
            <h2 className="text-2xl font-bold mb-6">{t('admin_panel')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl shadow-sm bg-card" onClick={() => setActiveTab('products')}>
                <Package className="h-7 w-7 text-primary" />
                <span className="font-semibold">{t('admin_products')}</span>
              </Button>
              <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl shadow-sm bg-card" onClick={() => setActiveTab('categories')}>
                <LayoutGrid className="h-7 w-7 text-orange-500" />
                <span className="font-semibold">{t('admin_categories')}</span>
              </Button>
              <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl shadow-sm bg-card" onClick={() => setActiveTab('ingredients')}>
                <Coffee className="h-7 w-7 text-yellow-600" />
                <span className="font-semibold">{t('admin_ingredients')}</span>
              </Button>
              <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl shadow-sm bg-card" onClick={() => setActiveTab('tables')}>
                <QrCode className="h-7 w-7 text-blue-500" />
                <span className="font-semibold">{t('admin_tables')}</span>
              </Button>
              <Button variant="outline" className="h-28 flex flex-col gap-2 rounded-2xl shadow-sm bg-card col-span-2" onClick={() => setActiveTab('staff')}>
                <Users className="h-7 w-7 text-green-500" />
                <span className="font-semibold">{t('admin_staff')}</span>
              </Button>
            </div>
          </>
        )}

        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'staff' && <AdminStaff />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'ingredients' && <AdminIngredients />}
        {activeTab === 'tables' && <AdminTables />}
      </main>
    </div>
  )
}