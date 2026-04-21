import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Coffee, GlassWater, Wind, CheckCircle2, Clock } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useServiceCall } from '../../hooks/useServiceCall'
import { useCooldown } from '../../hooks/useCooldown'
import { Button } from '../../components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '../../components/ui/drawer'

export function CallStaffDrawer() {
  const { t } = useTranslation()
  const { tableId, lastServiceCallTime, setLastServiceCallTime, showAlert, cart } = useAppStore()
  const { mutate: callStaff, isPending } = useServiceCall()
  
  const [isOpen, setIsOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const timeLeft = useCooldown(lastServiceCallTime, 120, isOpen)
  const isCartVisible = cart.length > 0

  const handleCall = (type: 'waiter' | 'barman' | 'shisha') => {
    if (timeLeft > 0 || !tableId) return

    callStaff(
      { tableId, type },
      {
        onSuccess: () => {
          setLastServiceCallTime(Date.now())
          setSuccessMessage(t('staff_called_success'))
          setTimeout(() => {
            setIsOpen(false)
            setSuccessMessage(null)
          }, 3000)
        },
        onError: (error) => {
          showAlert(t('error'), `${t('error_calling_staff')}${error.message}`)
        }
      }
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          className={`fixed right-4 h-14 w-14 rounded-full shadow-2xl z-50 transition-all duration-300 ${
            isCartVisible ? 'bottom-40' : 'bottom-24'
          }`}
          size="icon"
          onClick={(e) => {
            if (!tableId) {
              e.preventDefault()
              showAlert(t('attention'), t('scan_qr_prompt'))
            }
          }}
        >
          <Bell className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm pb-6">
          <DrawerHeader>
            <DrawerTitle className="text-center">{t('call_staff')}</DrawerTitle>
            <DrawerDescription className="text-center">
              {timeLeft > 0 ? t('cooldown_active') : t('choose_staff_type')}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 mt-2 flex flex-col gap-3">
            {successMessage ? (
              <div className="flex flex-col items-center justify-center py-8 text-primary animate-in fade-in zoom-in">
                <CheckCircle2 className="h-16 w-16 mb-4" />
                <p className="text-lg font-semibold text-center">{successMessage}</p>
              </div>
            ) : timeLeft > 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground animate-in fade-in">
                <Clock className="h-16 w-16 mb-4" />
                <p className="text-2xl font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
                <p className="text-sm mt-2">{t('please_wait')}</p>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="h-16 text-lg justify-start gap-4 px-6 rounded-2xl"
                  onClick={() => handleCall('waiter')}
                  disabled={isPending}
                >
                  <Coffee className="h-6 w-6 text-primary" />
                  {t('waiter')}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 text-lg justify-start gap-4 px-6 rounded-2xl"
                  onClick={() => handleCall('barman')}
                  disabled={isPending}
                >
                  <GlassWater className="h-6 w-6 text-primary" />
                  {t('bartender')}
                </Button>

                <Button 
                  variant="outline" 
                  className="h-16 text-lg justify-start gap-4 px-6 rounded-2xl"
                  onClick={() => handleCall('shisha')}
                  disabled={isPending}
                >
                  <Wind className="h-6 w-6 text-primary" />
                  {t('shisha_master')}
                </Button>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}