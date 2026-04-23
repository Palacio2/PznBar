import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, CheckCircle2, Wallet } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { Button } from '../../components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../components/ui/drawer'

import { CartContent } from './CartContent'
import { PinVerification } from './PinVerification'

type CheckoutStep = 'cart' | 'pin' | 'success'

export function CartDrawer() {
  const { t } = useTranslation()
  const { cart, tableId, user, showAlert } = useAppStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [tipPercent, setTipPercent] = useState<number>(0)

  const { totalItems, tipAmount } = useCartCalculations(cart, tipPercent)

  // Скидаємо стан при закритті кошика
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCheckoutStep('cart')
        setTipPercent(0)
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

    setCheckoutStep('pin')
  }

  const handleSuccess = () => {
    setCheckoutStep('success')
    setTimeout(() => setIsOpen(false), 3000)
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

        {checkoutStep === 'cart' && (
          <CartContent 
            tipPercent={tipPercent} 
            setTipPercent={setTipPercent} 
            onCheckout={handleInitialCheckout} 
          />
        )}

        {checkoutStep === 'pin' && (
          <PinVerification 
            tipAmount={tipAmount} 
            onBack={() => setCheckoutStep('cart')} 
            onSuccess={handleSuccess} 
          />
        )}

        {checkoutStep === 'success' && (
          <div className="p-8 flex flex-col items-center animate-in fade-in zoom-in">
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
            <p className="text-xl font-semibold text-center">{t('order_success_desc', 'Очікуйте, ми вже готуємо ваше замовлення!')}</p>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}