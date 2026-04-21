import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useMenu'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../components/ui/drawer'
import { Badge } from '../../components/ui/badge'

interface OrderHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function OrderHistoryDrawer({ isOpen, onClose }: OrderHistoryDrawerProps) {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.language || 'pl') as 'pl' | 'ua' | 'en'
  const { user } = useAppStore()
  const { data: orders, isLoading: isOrdersLoading } = useOrders(user?.id)
  const { data: allProducts } = useProducts(null)

  const isLoading = isOrdersLoading

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'cancelled': return 'bg-destructive/10 text-destructive hover:bg-destructive/20'
      default: return 'bg-primary/10 text-primary hover:bg-primary/20'
    }
  }

  const getProductName = (productId: string) => {
    if (!allProducts) return t('unknown_product')
    const product = allProducts.find(p => p.id === productId)
    if (!product) return t('unknown_product')
    return product.name?.[currentLang] || product.name?.pl || t('unknown_product')
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{t('order_history')}</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 space-y-4 overflow-y-auto pb-8">
          {isLoading ? (
            <div className="text-center text-muted-foreground">{t('loading')}</div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('no_orders')}
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString(i18n.language, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <Badge variant="secondary" className={`mt-2 border-transparent ${getStatusColor(order.status)}`}>
                      {String(t(`status_${order.status}`))}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">
                      {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(order.total_price)}
                    </p>
                    {order.points_earned > 0 && (
                      <p className="text-xs text-green-500 font-medium mt-1">+{order.points_earned}</p>
                    )}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{t('order_details')}</p>
                  <ul className="space-y-1">
                    {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.quantity}x {getProductName(item.product_id)}
                          {item.is_custom && <span className="text-primary ml-1">*</span>}
                        </span>
                        <span className="font-medium text-muted-foreground">
                          {item.price === 0 ? t('by_points') : new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}