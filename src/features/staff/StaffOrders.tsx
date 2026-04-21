import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/button'
import { getLocalized } from '../../lib/utils'
import { OrderStatus } from '../../types/menu'
import { useUpdateOrderStatus } from '../../hooks/useStaffOrders'
import { useAppStore } from '../../store/useAppStore'

interface StaffOrdersProps {
  orders: any[]
}

export function StaffOrders({ orders }: StaffOrdersProps) {
  const { t, i18n } = useTranslation()
  const { user } = useAppStore()
  const currentLang = i18n.language
  
  const { mutate: updateStatus } = useUpdateOrderStatus()

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatus({ orderId, status, staffId: user?.id })
  }

  const columns: { id: OrderStatus; title: string }[] = [
    { id: 'new', title: 'Нові' },
    { id: 'preparing', title: 'Готуються' },
    { id: 'served', title: 'Подано' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col gap-4">
          <div className="bg-background border border-border rounded-xl p-3 shadow-sm font-bold flex justify-between items-center">
            {column.title}
            <span className="bg-muted px-2 py-0.5 rounded-full text-sm">
              {orders?.filter((o) => o.status === column.id).length || 0}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {orders?.filter((o) => o.status === column.id).map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3 border-b border-border/50 pb-3">
                  <div>
                    <span className="font-bold text-lg text-primary">{t('table')} #{order.table_id}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="font-bold">{order.total_price} zł</span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <span className="font-bold">{item.quantity}x</span> {getLocalized(item.name, currentLang)}
                      {item.selected_ingredients && item.selected_ingredients.length > 0 && (
                        <p className="text-xs text-muted-foreground ml-5">
                          + {item.selected_ingredients.map((ing: any) => getLocalized(ing.name, currentLang)).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto">
                  {order.status === 'new' && (
                    <Button className="w-full" onClick={() => handleStatusChange(order.id, 'preparing')}>Взяти в роботу</Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button className="w-full" onClick={() => handleStatusChange(order.id, 'served')}>Готово / Подано</Button>
                  )}
                  {order.status === 'served' && (
                    <Button variant="outline" className="w-full border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleStatusChange(order.id, 'completed')}>Оплачено</Button>
                  )}
                  {(order.status === 'new' || order.status === 'preparing') && (
                    <Button variant="ghost" className="text-destructive px-2" onClick={() => handleStatusChange(order.id, 'cancelled')}>Скасувати</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}