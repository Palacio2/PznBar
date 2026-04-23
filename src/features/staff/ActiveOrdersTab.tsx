import { useTranslation } from 'react-i18next'
import { ClipboardList, CheckCircle2, XCircle, User, Phone, Mail, Clock, ChevronDown } from 'lucide-react'
import { formatPrice } from '../../lib/utils'
import { Button } from '../../components/ui/button'

export function ActiveOrdersTab({ orders, isLoading, updateOrderStatus, getProductName }: any) {
  const { t } = useTranslation()

  if (isLoading) return <p className="text-center text-muted-foreground py-8">{t('loading', 'Завантаження...')}</p>

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
        <ClipboardList className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg font-bold">{t('no_active_orders', 'Немає активних замовлень')}</p>
        <p className="text-sm opacity-50 mt-2">{t('no_active_orders_desc', "Коли клієнт зробить замовлення, воно з'явиться тут")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <div key={order.id} className="bg-card border-2 border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-4 bg-secondary/30 border-b border-border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-black uppercase tracking-widest text-primary leading-none">
                  {t('table', 'Стіл')} {order.table_id}
                </span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground w-fit bg-background/80 px-2.5 py-1 rounded-md border border-border/50 shadow-sm">
                  <Clock className="h-4 w-4 text-orange-500" />
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-black text-2xl leading-none">{formatPrice(order.total_price)}</p>
                {order.tip_amount > 0 && <p className="text-sm font-bold text-orange-500 mt-1">+{formatPrice(order.tip_amount)} {t('tips', 'чайові')}</p>}
              </div>
            </div>

            <details className="group text-sm text-muted-foreground bg-background rounded-xl border border-border/50 shadow-inner overflow-hidden cursor-pointer transition-all">
              <summary className="p-3 font-semibold flex items-center justify-between hover:bg-secondary/20 transition-colors list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> 
                  <span>{t('client_contacts', 'Контакти клієнта')}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-3 pt-0 flex flex-col gap-2 border-t border-border/50 mt-1 bg-secondary/10">
                {order.profiles ? (
                  <>
                    {order.profiles.phone && (
                      <div className="flex items-center gap-2 font-medium">
                        <Phone className="h-4 w-4 text-primary" /> <span className="text-foreground">{order.profiles.phone}</span>
                      </div>
                    )}
                    {order.profiles.email && (
                      <div className="flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4 text-primary" /> <span className="text-foreground">{order.profiles.email}</span>
                      </div>
                    )}
                    {!order.profiles.phone && !order.profiles.email && (
                      <div className="italic">{t('no_saved_contacts', 'Немає збережених контактів')}</div>
                    )}
                  </>
                ) : (
                  <div className="font-medium">
                    {t('guest', 'Гість (без реєстрації)')}
                  </div>
                )}
              </div>
            </details>
          </div>
          
          <div className="p-4 space-y-3 bg-background">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start text-base border-b border-border/30 pb-2 last:border-0 last:pb-0">
                <span className="font-bold pr-4 flex items-center gap-2">
                  <span className="bg-secondary px-2 py-0.5 rounded text-sm">{item.quantity}x</span>
                  {getProductName(item.product_id)}
                  {item.is_custom && <span className="text-primary font-bold">*</span>}
                </span>
                <span className="text-muted-foreground whitespace-nowrap font-medium text-sm mt-0.5">
                  {item.price === 0 ? t('by_points', 'Балами') : formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-secondary/20 border-t border-border flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12 border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-sm font-bold"
              onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'cancelled' })}
              disabled={updateOrderStatus.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('cancel_order', 'Скасувати')}
            </Button>
            <Button 
              className="flex-[2] h-12 bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-lg"
              onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'completed' })}
              disabled={updateOrderStatus.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t('complete_order', 'ВИКОНАНО')}
            </Button>
          </div>

        </div>
      ))}
    </div>
  )
}