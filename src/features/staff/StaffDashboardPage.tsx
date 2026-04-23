import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Volume2 } from 'lucide-react'
import { useStaffDashboard } from '../../hooks/useStaffDashboard'
import { useProducts } from '../../hooks/useMenu'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'

import { ActiveOrdersTab } from './ActiveOrdersTab'
import { ActiveCallsTab } from './ActiveCallsTab'
import { OrderHistoryTab } from './OrderHistoryTab'
import { StaffTablesTab } from './StaffTablesTab' 

export function StaffDashboardPage() {
  const { t } = useTranslation()
  const { getLocalizedText } = useTranslationHelpers()
  const { data: allProducts } = useProducts(null)
  
  const { useActiveOrders, useOrderHistory, useActiveCalls, updateOrderStatus, resolveCall, clearTableSession, useStaffTables } = useStaffDashboard()
  const { data: orders, isLoading: isOrdersLoading } = useActiveOrders()
  const { data: calls, isLoading: isCallsLoading } = useActiveCalls()
  const { data: tables, isLoading: isTablesLoading } = useStaffTables()

  const [activeTab, setActiveTab] = useState('orders')

  const getProductName = (productId: string) => {
    if (!allProducts) return t('loading', '...')
    const product = allProducts.find(p => p.id === productId)
    return product ? getLocalizedText(product.name) : t('unknown_product', 'Невідомий продукт')
  }

  const enableSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      osc.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">{t('staff_terminal', 'Термінал')}</h1>
            <p className="text-[10px] font-semibold text-muted-foreground">{t('staff_terminal_desc', 'Замовлення онлайн')}</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={enableSound} title="Увімкнути/Протестувати звук" className="rounded-full">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      <main className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-14 bg-secondary/50 rounded-2xl p-1 gap-1">
            <TabsTrigger value="orders" className="text-xs font-bold relative rounded-xl data-[state=active]:bg-background">
              {t('orders_tab', 'Замов.')}
              {(orders?.length || 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white shadow-sm animate-pulse">
                  {orders?.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calls" className="text-xs font-bold relative rounded-xl data-[state=active]:bg-background">
              {t('calls_tab', 'Викл.')}
              {(calls?.length || 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white shadow-sm animate-pulse">
                  {calls?.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tables" className="text-xs font-bold rounded-xl data-[state=active]:bg-background">
              {t('tables_tab', 'Столи')}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-bold rounded-xl data-[state=active]:bg-background">
              {t('history_tab', 'Історія')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-0">
            <ActiveOrdersTab orders={orders} isLoading={isOrdersLoading} updateOrderStatus={updateOrderStatus} getProductName={getProductName} />
          </TabsContent>

          <TabsContent value="calls" className="mt-0">
            <ActiveCallsTab calls={calls} isLoading={isCallsLoading} resolveCall={resolveCall} />
          </TabsContent>

          <TabsContent value="tables" className="mt-0">
            <StaffTablesTab tables={tables} isLoading={isTablesLoading} clearTableSession={clearTableSession} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <OrderHistoryTab useOrderHistory={useOrderHistory} getProductName={getProductName} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}