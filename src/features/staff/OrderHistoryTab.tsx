import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History, Wallet, ChevronLeft, ChevronRight, User, Calendar, Phone, Mail, Clock, ChevronDown } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatPrice } from '../../lib/utils'

// Нова функція для правильного отримання локальної дати (ігноруючи UTC)
const getLocalYYYYMMDD = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function OrderHistoryTab({ useOrderHistory, getProductName }: any) {
  const { t } = useTranslation()
  const { user: currentUser } = useAppStore()
  
  // Використовуємо локальний час
  const [date, setDate] = useState(getLocalYYYYMMDD(new Date()))
  const { data: history, isLoading } = useOrderHistory(date)

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin'

  const changeDate = (days: number) => {
    const [year, month, day] = date.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    d.setDate(d.getDate() + days)
    setDate(getLocalYYYYMMDD(d))
  }

  const completedOrders = history?.filter((o: any) => o.status === 'completed') || []
  const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + o.total_price, 0)
  const totalTips = completedOrders.reduce((sum: number, o: any) => sum + o.tip_amount, 0)

  // Перевірка, чи це сьогоднішній день (щоб вимкнути стрілку "вперед")
  const isToday = date === getLocalYYYYMMDD(new Date())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-2xl border border-border shadow-sm">
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => changeDate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <label className="relative flex items-center justify-center bg-background px-4 py-3 rounded-xl border border-border cursor-pointer flex-1 mx-2 shadow-sm hover:bg-secondary/30 transition-colors">
           <Calendar className="h-5 w-5 mr-2 text-primary shrink-0" />
           <input 
             type="date" 
             value={date} 
             onChange={(e) => setDate(e.target.value)}
             className="bg-transparent font-bold text-sm outline-none cursor-pointer w-full text-center appearance-none"
           />
        </label>
        
        <button 
          className={`p-2 rounded-lg transition-colors ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-secondary'}`} 
          onClick={() => !isToday && changeDate(1)} 
          disabled={isToday}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {isAdmin && (
        <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Wallet className="h-10 w-10 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t('revenue', 'Каса за день')}</p>
              <p className="text-2xl font-black text-primary">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('tips', 'Чайові')}</p>
            <p className="text-lg font-bold text-green-500">{formatPrice(totalTips)}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{t('loading', 'Завантаження...')}</p>
      ) : history?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">{t('no_history', 'Немає історії за цей день')}</p>
        </div>
      ) : (
        history?.map((order: any) => (
          <div key={order.id} className={`bg-card border rounded-2xl shadow-sm p-4 flex flex-col ${order.status === 'cancelled' ? 'opacity-60 bg-secondary/10' : ''}`}>
            
            <div className="flex justify-between items-start mb-3 border-b border-border/50 pb-4">
              <div className="flex flex-col gap-2">
                <span className="text-xl font-black uppercase tracking-widest text-primary leading-none">
                  {t('table', 'Стіл')} {order.table_id}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md w-fit">
                  <Clock className="h-3 w-3" />
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {order.status === 'completed' ? 'Виконано' : 'Скасовано'}
                </span>
                <p className="font-black mt-1 text-xl">{formatPrice(order.total_price)}</p>
              </div>
            </div>

            <details className="group text-xs text-muted-foreground bg-secondary/20 rounded-lg border border-border/50 mb-4 cursor-pointer transition-all">
              <summary className="p-2.5 font-semibold flex items-center justify-between hover:bg-secondary/40 transition-colors list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> 
                  <span>{t('client_contacts', 'Контакти клієнта')}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-2.5 pt-0 flex flex-col gap-2 border-t border-border/50 mt-1">
                {order.profiles?.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> <span className="font-medium text-foreground">{order.profiles.phone}</span></div>}
                {order.profiles?.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> <span className="font-medium text-foreground">{order.profiles.email}</span></div>}
                {!order.profiles?.phone && !order.profiles?.email && <div className="italic">Гість без збережених контактів</div>}
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
            </div>

          </div>
        ))
      )}
    </div>
  )
}