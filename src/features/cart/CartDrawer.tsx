import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Award, Wallet, Lock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { useTranslationHelpers } from '../../hooks/useTranslationHelpers'
import { formatPrice } from '../../lib/utils'
import { APP_CONFIG } from '../../lib/constants'
import { supabase } from '../../api/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '../../components/ui/drawer'

type CheckoutStep = 'cart' | 'pin' | 'success'

export function CartDrawer() {
  const { t } = useTranslation()
  const { getLocalizedText } = useTranslationHelpers()
  const { cart, tableId, user, removeFromCart, updateQuantity, clearCart, toggleItemPaymentMode, showAlert } = useAppStore()
  const { mutate: createOrder, isPending } = useCreateOrder()
  
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [tipPercent, setTipPercent] = useState<number>(0)
  
  // Стейт для ПІН-коду
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const { 
    baseTotalCash, 
    totalPointsUsed, 
    pointsToEarn, 
    tipAmount, 
    finalTotalCash, 
    totalItems, 
    getItemPrice 
  } = useCartCalculations(cart, tipPercent)

  // Скидаємо стан при закритті кошика
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCheckoutStep('cart')
        setPinCode('')
        setPinError('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleInitialCheckout = () => {
    if (cart.length === 0) return
    
    if (!tableId) {
      setIsOpen(false)
      setTimeout(() => {
        showAlert(t('attention', 'Увага'), t('scan_qr_prompt', 'Будь ласка, відскануйте QR-код на вашому столику для замовлення.'))
      }, 300)
      return
    }

    // Замість прямої відправки, переходимо на крок перевірки ПІН-коду
    setCheckoutStep('pin')
  }

  const verifyPinAndSubmit = async () => {
    if (!tableId) return
    setIsVerifying(true)
    setPinError('')

    try {
      // 1. Перевіряємо ПІН-код у базі даних
      const { data, error } = await supabase
        .from('tables')
        .select('pin_code')
        .eq('number', tableId)
        .single()

      if (error) throw new Error(t('table_not_found', 'Столик не знайдено'))

      const correctPin = data.pin_code || '0000'

      if (pinCode !== correctPin) {
        setPinError(t('incorrect_pin', 'Невірний ПІН-код! Спробуйте ще раз.'))
        setIsVerifying(false)
        return
      }

      // 2. Якщо ПІН вірний, відправляємо замовлення
      createOrder(
        { tableId, items: cart, userId: user?.id, tipAmount },
        {
          onSuccess: () => {
            setCheckoutStep('success')
            clearCart()
            setTipPercent(0)
            setTimeout(() => {
              setIsOpen(false)
            }, 3000)
          },
          onError: (error) => {
            setIsOpen(false)
            setTimeout(() => {
              showAlert(t('error', 'Помилка'), `${t('error_processing_order', 'Не вдалося обробити замовлення: ')}${error.message}`)
            }, 300)
          }
        }
      )
    } catch (err: any) {
      setPinError(err.message || t('error', 'Помилка'))
    } finally {
      setIsVerifying(false)
    }
  }

  if (totalItems === 0 && checkoutStep !== 'success') return null

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-2xl z-50 p-0" size="icon">
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
            <DrawerTitle>
              {checkoutStep === 'success' ? t('order_success_title', 'Замовлення прийнято!') : 
               checkoutStep === 'pin' ? t('security_check', 'Перевірка безпеки') :
               t('your_order', 'Ваше замовлення')}
            </DrawerTitle>
            {user && checkoutStep === 'cart' && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-1 rounded-full mx-auto mt-1">
                <Wallet className="h-3 w-3" />
                {t('your_balance', 'Ваш баланс')}: {user.bonus_points}
              </div>
            )}
          </div>
        </DrawerHeader>

        {/* Екран 3: Успіх */}
        {checkoutStep === 'success' && (
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in">
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
            <p className="text-xl font-semibold text-center">{t('order_success_desc', 'Очікуйте, ми вже готуємо ваше замовлення!')}</p>
          </div>
        )}

        {/* Екран 2: Введення ПІН-коду */}
        {checkoutStep === 'pin' && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-right-4 duration-300">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              {t('pin_desc', 'Введіть 4-значний ПІН-код, який вказано на вашому столику, щоб підтвердити замовлення.')}
            </p>

            <Input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              value={pinCode}
              onChange={(e) => {
                setPinError('')
                setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))
              }}
              className={`text-center text-4xl tracking-[0.5em] font-black h-20 w-full max-w-[240px] rounded-2xl ${pinError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              autoFocus
              placeholder="••••"
            />
            
            <div className="h-6 mt-2">
              {pinError && <p className="text-sm font-bold text-destructive animate-in fade-in">{pinError}</p>}
            </div>

            <div className="flex gap-3 w-full mt-6">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setCheckoutStep('cart')} disabled={isVerifying || isPending}>
                {t('back', 'Назад')}
              </Button>
              <Button
                className="flex-[2] h-12 rounded-xl text-lg font-bold shadow-lg"
                disabled={pinCode.length !== 4 || isVerifying || isPending}
                onClick={verifyPinAndSubmit}
              >
                {isVerifying || isPending ? t('processing', 'Обробка...') : t('verify_and_order', 'Замовити')}
              </Button>
            </div>
          </div>
        )}

        {/* Екран 1: Кошик */}
        {checkoutStep === 'cart' && (
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
                    <Button key={percent} variant={tipPercent === percent ? 'default' : 'outline'} className="flex-1 h-10 text-sm font-bold rounded-xl" onClick={() => setTipPercent(percent)} disabled={isPending || baseTotalCash === 0}>
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
              <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-lg" onClick={handleInitialCheckout} disabled={cart.length === 0}>
                {t('confirm_order', 'Підтвердити замовлення')}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}