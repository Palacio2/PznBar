import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2, Award } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { formatPrice } from '../../lib/utils'
import { APP_CONFIG } from '../../lib/constants'
import { Button } from '../../components/ui/button'
import { DrawerFooter } from '../../components/ui/drawer'

interface CartContentProps {
  tipPercent: number
  setTipPercent: (percent: number) => void
  onCheckout: () => void
}

export function CartContent({ tipPercent, setTipPercent, onCheckout }: CartContentProps) {
  const { t } = useTranslation()
  const { getLocalizedText } = useTranslationHelpers()
  const { cart, user, updateQuantity, removeFromCart, toggleItemPaymentMode } = useAppStore()
  
  const { 
    baseTotalCash, 
    totalPointsUsed, 
    pointsToEarn, 
    finalTotalCash, 
    getItemPrice 
  } = useCartCalculations(cart, tipPercent)

  return (
    <>
      <div className="p-4 space-y-4 max-h-[45vh] overflow-y-auto">
        {cart.map((item) => {
          const canPayWithPoints = user && item.product.bonus_price && user.bonus_points >= (totalPointsUsed + item.product.bonus_price * item.quantity)
          return (
            <div key={item.id} className="flex flex-col border-b border-border pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{getLocalizedText(item.product.name)}</h4>
                  {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.selectedIngredients.map(ing => getLocalizedText(ing.name)).join(', ')}
                    </p>
                  )}
                </div>
                <span className={`text-sm font-bold ${item.payWithPoints ? 'text-green-500' : 'text-primary'}`}>
                  {item.payWithPoints 
                    ? `${item.product.bonus_price! * item.quantity} б.` 
                    : formatPrice(getItemPrice(item))}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 bg-secondary rounded-lg border border-border">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {item.product.bonus_price && user && (
                    <Button 
                      variant={item.payWithPoints ? "default" : "outline"} 
                      size="sm" 
                      className="h-8 text-xs gap-1.5 rounded-lg"
                      onClick={() => toggleItemPaymentMode(item.id)}
                      disabled={!item.payWithPoints && !canPayWithPoints}
                    >
                      <Award className="h-3.5 w-3.5" />
                      {item.payWithPoints ? t('by_points', 'Балами') : t('use_points', 'Списати бали')}
                    </Button>
                  )}
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <DrawerFooter className="border-t pt-4">
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('add_tip', 'Залишити чайові')}</p>
          <div className="flex gap-2">
            {APP_CONFIG.TIP_OPTIONS.map((percent) => (
              <Button key={percent} variant={tipPercent === percent ? 'default' : 'outline'} className="flex-1 h-10 text-sm font-bold rounded-xl" onClick={() => setTipPercent(percent)} disabled={baseTotalCash === 0}>
                {percent > 0 ? `${percent}%` : '0%'}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-4 border-b border-border/50 pb-4 bg-secondary/20 p-3 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">{t('points_will_earn', 'Буде нараховано балів')}</span>
            <span className="text-sm font-bold text-green-500">+{pointsToEarn}</span>
          </div>
          {totalPointsUsed > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-destructive">{t('points_will_spend', 'Буде списано балів')}</span>
              <span className="text-sm font-bold text-destructive">-{totalPointsUsed}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-2">
            <span className="font-bold text-sm uppercase tracking-wider">{t('total', 'До сплати')}</span>
            <span className="font-black text-3xl text-primary leading-none">
              {formatPrice(finalTotalCash)}
            </span>
          </div>
        </div>
        <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-lg" onClick={onCheckout} disabled={cart.length === 0}>
          {t('confirm_order', 'Підтвердити замовлення')}
        </Button>
      </DrawerFooter>
    </>
  )
}