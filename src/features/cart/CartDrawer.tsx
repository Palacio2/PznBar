import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Award, Wallet } from 'lucide-react'
import { useAppStore, CartItem } from '../../store/useAppStore'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { Button } from '../../components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '../../components/ui/drawer'

export function CartDrawer() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'pl' | 'ua' | 'en'
  
  const { cart, tableId, user, removeFromCart, updateQuantity, clearCart, toggleItemPaymentMode, showAlert } = useAppStore()
  const { mutate: createOrder, isPending } = useCreateOrder()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tipPercent, setTipPercent] = useState<number>(0)

  const getItemPrice = (item: CartItem) => {
    if (item.payWithPoints) return 0
    const extras = item.selectedIngredients?.reduce((sum, ing) => sum + (ing.price_extra || 0), 0) || 0
    return (item.product.price + extras) * item.quantity
  }

  const rawBaseTotalCash = cart.reduce((sum, item) => sum + getItemPrice(item), 0)
  const baseTotalCash = Math.round(rawBaseTotalCash * 100) / 100

  const totalPointsUsed = cart.reduce((sum, item) => sum + (item.payWithPoints && item.product.bonus_price ? item.product.bonus_price * item.quantity : 0), 0)
  
  const pointsToEarn = cart.reduce((sum, item) => 
    item.payWithPoints ? sum : sum + (item.product.bonus_reward * item.quantity), 0
  )

  const rawTipAmount = baseTotalCash * (tipPercent / 100)
  const tipAmount = Math.round(rawTipAmount * 100) / 100

  const finalTotalCash = Math.round((baseTotalCash + tipAmount) * 100) / 100
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    
    if (!tableId) {
      setIsOpen(false)
      setTimeout(() => {
        showAlert(t('attention'), t('scan_qr_prompt'))
      }, 300)
      return
    }

    createOrder(
      { 
        tableId, 
        items: cart,
        userId: user?.id,
        tipAmount
      },
      {
        onSuccess: () => {
          setIsSuccess(true)
          clearCart()
          setTipPercent(0)
          setTimeout(() => {
            setIsOpen(false)
            setIsSuccess(false)
          }, 3000)
        },
        onError: (error) => {
          setIsOpen(false)
          setTimeout(() => {
            showAlert(t('error'), `${t('error_processing_order')}${error.message}`)
          }, 300)
        }
      }
    )
  }

  if (totalItems === 0 && !isSuccess) return null

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-2xl z-50 p-0" 
          size="icon"
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground border-2 border-primary-foreground shadow-sm">
              {totalItems}
            </span>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-col gap-1">
            <DrawerTitle>{isSuccess ? t('order_success_title') : t('your_order')}</DrawerTitle>
            {user && !isSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-1 rounded-full mx-auto">
                <Wallet className="h-3 w-3" />
                {t('your_balance')}: {user.bonus_points}
              </div>
            )}
          </div>
        </DrawerHeader>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in">
            <CheckCircle2 className="h-20 w-20 text-primary mb-4" />
            <p className="text-xl font-semibold text-center">{t('order_success_desc')}</p>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4 max-h-[45vh] overflow-y-auto">
              {cart.map((item) => {
                const canPayWithPoints = user && item.product.bonus_price && user.bonus_points >= (totalPointsUsed + item.product.bonus_price * item.quantity)
                return (
                  <div key={item.id} className="flex flex-col border-b border-border pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{item.product.name[currentLang] || item.product.name.pl}</h4>
                        {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.selectedIngredients.map(ing => ing.name[currentLang] || ing.name.pl).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${item.payWithPoints ? 'text-green-500' : 'text-primary'}`}>
                        {item.payWithPoints 
                          ? `${item.product.bonus_price! * item.quantity}` 
                          : new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(getItemPrice(item))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8 ml-2" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.product.bonus_price && user && (
                        <Button 
                          variant={item.payWithPoints ? "default" : "outline"} 
                          size="sm" 
                          className="h-8 text-xs gap-1"
                          onClick={() => toggleItemPaymentMode(item.id)}
                          disabled={!item.payWithPoints && !canPayWithPoints}
                        >
                          <Award className="h-3 w-3" />
                          {item.payWithPoints ? t('by_points') : t('use_points')}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <DrawerFooter className="border-t">
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-xs text-muted-foreground uppercase font-bold">{t('add_tip')}</p>
                <div className="flex gap-2">
                  {[0, 5, 10, 15].map((percent) => (
                    <Button key={percent} variant={tipPercent === percent ? 'default' : 'outline'} className="flex-1 h-8 text-xs" onClick={() => setTipPercent(percent)} disabled={isPending || baseTotalCash === 0}>
                      {percent > 0 ? `${percent}%` : '0%'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-4 border-b border-dashed pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('points_will_earn')}</span>
                  <span className="text-sm font-bold text-green-500">+{pointsToEarn}</span>
                </div>
                {totalPointsUsed > 0 && (
                  <div className="flex justify-between items-center text-destructive">
                    <span className="text-sm">{t('points_will_spend')}</span>
                    <span className="text-sm font-bold">-{totalPointsUsed}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-lg">{t('total')}</span>
                  <span className="font-bold text-2xl text-primary">
                    {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(finalTotalCash)}
                  </span>
                </div>
              </div>
              <Button className="w-full h-12 text-lg" onClick={handleCheckout} disabled={isPending || cart.length === 0}>
                {isPending ? t('processing') : t('confirm_order')}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}