import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStaffData } from '../hooks/useStaffData'
import { Grid2x2, ListTodo } from 'lucide-react'
import { StaffHall } from '../features/staff/StaffHall'
import { StaffOrders } from '../features/staff/StaffOrders'

export function StaffDashboard() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'hall' | 'orders'>('hall')
  const { tables, orders, serviceCalls, isLoading } = useStaffData()

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>
  }

  const newOrdersCount = orders.filter(o => o.status === 'new').length

  return (
    <div className="min-h-screen bg-muted/20 pb-24 p-4">
      <header className="mb-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Staff App</h1>
        <div className="flex bg-background p-1 rounded-xl border border-border">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hall' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'}`}
            onClick={() => setActiveTab('hall')}
          >
            <Grid2x2 className="h-4 w-4" /> Зал
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'}`}
            onClick={() => setActiveTab('orders')}
          >
            <ListTodo className="h-4 w-4" /> Замовлення
            {newOrdersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {newOrdersCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'hall' && (
        <StaffHall tables={tables} orders={orders} serviceCalls={serviceCalls} />
      )}

      {activeTab === 'orders' && (
        <StaffOrders orders={orders} />
      )}
    </div>
  )
}