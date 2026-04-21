import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/button'

export function AgeVerificationModal() {
  const { t } = useTranslation()
  const { isAgeVerified, verifyAge } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (isAgeVerified) return null

  const handleDecline = () => {
    window.location.href = 'https://google.com'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-3xl font-bold text-destructive">18+</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-card-foreground">
            {t('age_verification_title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('age_verification_desc')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            variant="outline" 
            className="w-full sm:flex-1 border-destructive text-destructive hover:bg-destructive/10" 
            onClick={handleDecline}
          >
            {t('no_under_18')}
          </Button>
          <Button 
            className="w-full sm:flex-1" 
            onClick={verifyAge}
          >
            {t('yes_over_18')}
          </Button>
        </div>
      </div>
    </div>
  )
}