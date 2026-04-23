import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { supabase } from '../../api/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

interface PinVerificationProps {
  tipAmount: number
  onSuccess: () => void
  onBack: () => void
}

export function PinVerification({ tipAmount, onSuccess, onBack }: PinVerificationProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { tableId, cart, user, clearCart, showAlert } = useAppStore()
  const { mutate: createOrder, isPending } = useCreateOrder()

  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const verifyPinAndSubmit = async () => {
    if (!tableId) return
    setIsVerifying(true)
    setPinError('')

    try {
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

      createOrder(
        { tableId, items: cart, userId: user?.id, tipAmount },
        {
          onSuccess: () => {
            clearCart()
            if (user?.id) {
              queryClient.invalidateQueries({ queryKey: ['orders', user.id] })
            }
            onSuccess()
          },
          onError: (error) => {
            showAlert(t('error', 'Помилка'), `${t('error_processing_order', 'Не вдалося обробити замовлення: ')}${error.message}`)
            onBack()
          }
        }
      )
    } catch (err: any) {
      setPinError(err.message || t('error', 'Помилка'))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
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
        <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={onBack} disabled={isVerifying || isPending}>
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
  )
}