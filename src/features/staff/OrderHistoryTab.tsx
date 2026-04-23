import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History, Wallet, ChevronLeft, ChevronRight, User, Calendar, Phone, Mail, Clock, ChevronDown } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatPrice } from '../../lib/utils'
import { Button } from '../../components/ui/button' // <-- ДОДАНО ЦЕЙ ІМПОРТ

const getLocalYYYYMMDD = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function OrderHistoryTab({ useOrderHistory, getProductName }: any) {
  const { t } = useTranslation()
  const { user: currentUser } = useAppStore()
  
  const [date, setDate] = useState(getLocalYYYYMMDD(new Date()))
  const { data: history, isLoading } = useOrderHistory(date)

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin'

  const changeDate = (days: number) => {
    const [year, month, day] = date.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    d.setDate(d.getDate() + days)
    setDate(getLocalYYYYMMDD(d))
  }

  const getTotalStats = () => {
    if (!history) return { orders: 0, revenue: 0, points: 0 }
    return history.reduce((acc: any, order: any) => {
      if (order.status === 'completed') {
        acc.orders += 1
        acc.revenue += order.total_price
        acc.points += order.points_used
      }
      return acc
    }, { orders: 0, revenue: 0, points: 0 })
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-2 rounded-2xl border-2 border-border/50 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-10 w-10 rounded-xl hover:bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 font-bold text-primary">
          <Calendar className="h-4 w-4" />
          {date}
        </div>
        <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-10 w-10 rounded-xl hover:bg-secondary" disabled={date === getLocalYYYYMMDD(new Date())}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border/50 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('total_orders', 'Замовлень')}</span>
            <span className="text-xl font-black text-primary leading-none">{stats.orders}</span>
          </div>
          <div className="bg-card border border-border/50 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('revenue', 'Виторг')}</span>
            <span className="text-xl font-black text-green-500 leading-none">{formatPrice(stats.revenue)}</span>
          </div>
          <div className="bg-card border border-border/50 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('points_used', 'Списано б.')}</span>
            <span className="text-xl font-black text-orange-500 leading-none">{stats.points}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{t('loading', 'Завантаження...')}</p>
      ) : !history || history.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold">{t('no_orders_date', 'Немає замовлень за цю дату')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((order: any) => (
            <div key={order.id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-black text-primary leading-none">{t('table', 'Стіл')} {order.table_id}</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg leading-none">{formatPrice(order.total_price)}</p>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full mt-1 inline-block ${
                    order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {order.status === 'completed' ? t('completed', 'Виконано') : t('cancelled', 'Скасовано')}
                  </span>
                </div>
              </div>

              <details className="group text-sm bg-secondary/30 rounded-xl overflow-hidden">
                <summary className="p-2.5 font-semibold flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> 
                    <span>{t('client_contacts', 'Контакти клієнта')}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-2.5 pt-0 flex flex-col gap-2 border-t border-border/50 mt-1">
                  {order.profiles?.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> <span className="font-medium text-foreground">{order.profiles.phone}</span></div>}
                  {order.profiles?.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> <span className="font-medium text-foreground">{order.profiles.email}</span></div>}
                  {!order.profiles?.phone && !order.profiles?.email && <div className="italic">{t('no_saved_contacts', 'Гість без збережених контактів')}</div>}
                </div>
              </details>

              <div className="space-y-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">{item.quantity}x {getProductName(item.product_id)}</span>
                    <span className="text-muted-foreground font-semibold">
                      {item.price === 0 ? t('by_points', 'Балами') : formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.tip_amount > 0 && (
                  <div className="flex justify-between text-sm pt-1 border-t border-border/50">
                    <span className="font-medium">{t('tips', 'Чайові')}</span>
                    <span className="text-orange-500 font-bold">+{formatPrice(order.tip_amount)}</span>
                  </div>
                )}
                {order.points_used > 0 && (
                  <div className="flex justify-between text-sm text-primary pt-1">
                    <span className="font-medium flex items-center gap-1"><Wallet className="h-3.5 w-3.5"/> {t('paid_with_points', 'Оплачено балами')}</span>
                    <span className="font-bold">-{order.points_used}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}